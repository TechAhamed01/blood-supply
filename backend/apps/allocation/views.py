from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import AllocationRequest, AllocationItem
from .serializers import AllocationRequestSerializer
from apps.hospitals.models import Hospital
from apps.inventory.models import Inventory
from apps.bloodbanks.models import BloodBank
from apps.ai_engine.allocation_algorithm import smart_allocate
from apps.ai_engine.delivery_time import DeliveryTimeEstimator
from datetime import date

class AllocationRequestViewSet(viewsets.ModelViewSet):
    queryset = AllocationRequest.objects.all().order_by('-requested_at')
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AllocationRequest.objects.all()
        elif user.role == 'HOSPITAL' and hasattr(user, 'hospital_profile'):
            return AllocationRequest.objects.filter(hospital=user.hospital_profile)
        elif user.role == 'BLOODBANK' and hasattr(user, 'bloodbank_profile'):
            # Blood banks see requests that involve their inventory
            return AllocationRequest.objects.filter(items__bloodbank=user.bloodbank_profile).distinct()
        return AllocationRequest.objects.none()

    @action(detail=False, methods=['post'], url_path='create-allocation')
    def create_allocation(self, request):
        """Create a new allocation request and run smart allocation."""
        # Input validation
        hospital_id = request.data.get('hospital_id')
        blood_group = request.data.get('blood_group')
        units_requested = request.data.get('units_requested')
        emergency = request.data.get('emergency_flag', False)

        if not all([hospital_id, blood_group, units_requested]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            hospital = Hospital.objects.get(id=hospital_id)
        except Hospital.DoesNotExist:
            return Response({'error': 'Hospital not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user has permission (hospital users can only request for themselves)
        user = request.user
        if user.role == 'HOSPITAL' and hasattr(user, 'hospital_profile'):
            if user.hospital_profile.id != hospital.id:
                return Response({'error': 'You can only request for your own hospital'}, status=403)

        # Create request record
        alloc_request = AllocationRequest.objects.create(
            hospital=hospital,
            blood_group=blood_group,
            units_requested=units_requested,
            emergency_flag=emergency,
            status='PENDING'
        )

        # Call smart allocation from ai_engine
        try:
            allocations, status_code, message = smart_allocate(
                hospital, blood_group, units_requested, emergency
            )
        except Exception as e:
            alloc_request.status = 'CANCELLED'
            alloc_request.notes = f"Allocation failed: {str(e)}"
            alloc_request.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Process allocations if any
        total_allocated = 0
        with transaction.atomic():
            for alloc in allocations:
                inventory_id = alloc['inventory_id']
                try:
                    batch = Inventory.objects.select_for_update().get(id=inventory_id)
                except Inventory.DoesNotExist:
                    continue
                if batch.units_available < alloc['units_taken']:
                    # Should not happen if algorithm is correct, but handle
                    continue
                # Reduce available units
                batch.units_available -= alloc['units_taken']
                batch.save()

                # Create allocation item
                bloodbank = BloodBank.objects.get(id=alloc['bloodbank_id'])
                AllocationItem.objects.create(
                    allocation_request=alloc_request,
                    inventory_batch=batch,
                    bloodbank=bloodbank,
                    units_taken=alloc['units_taken'],
                    distance_km=alloc.get('distance_km'),
                    estimated_delivery_min=alloc.get('estimated_delivery_min')
                )
                total_allocated += alloc['units_taken']

        # Update request
        alloc_request.units_allocated = total_allocated
        if total_allocated == 0:
            alloc_request.status = 'PENDING'  # maybe change to UNAVAILABLE? Keep as pending.
        elif total_allocated < units_requested:
            alloc_request.status = 'PARTIALLY_FULFILLED'
        else:
            alloc_request.status = 'FULFILLED'
        if total_allocated > 0:
            alloc_request.allocated_at = timezone.now()
        alloc_request.save()

        serializer = self.get_serializer(alloc_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_request(self, request, pk=None):
        """Cancel a pending request."""
        alloc_request = self.get_object()
        if alloc_request.status not in ['PENDING', 'PARTIALLY_FULFILLED']:
            return Response({'error': 'Request cannot be cancelled'}, status=400)
        alloc_request.status = 'CANCELLED'
        alloc_request.save()
        return Response({'status': 'cancelled'})