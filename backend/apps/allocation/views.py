from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from .models import AllocationRequest, AllocationItem
from .serializers import AllocationRequestSerializer
from apps.inventory.models import Inventory
from apps.ai_engine.allocation_algorithm import smart_allocate
from apps.ai_engine.delivery_time import DeliveryTimeEstimator
from apps.users.permissions import IsHospitalUser, IsBloodBankUser, IsAdminUser

class AllocationRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AllocationRequest.objects.all()
        elif user.role == 'HOSPITAL':
            return AllocationRequest.objects.filter(hospital=user.hospital)
        elif user.role == 'BLOODBANK':
            # Bloodbank sees requests that involve their bank? Could filter via items, but for simplicity, return all pending?
            return AllocationRequest.objects.filter(status__in=['PENDING', 'PARTIALLY_FULFILLED'])
        return AllocationRequest.objects.none()

    def perform_create(self, serializer):
        # Only hospital users can create
        if self.request.user.role != 'HOSPITAL':
            self.permission_denied(self.request)
        serializer.save(hospital=self.request.user.hospital, status='PENDING')

class AllocationRequestDetailView(generics.RetrieveAPIView):
    queryset = AllocationRequest.objects.all()
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    # object-level permission handled by get_queryset? Actually RetrieveAPIView uses queryset, so if not in queryset, 404.
    # We'll override get_queryset to filter by role.
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AllocationRequest.objects.all()
        elif user.role == 'HOSPITAL':
            return AllocationRequest.objects.filter(hospital=user.hospital)
        elif user.role == 'BLOODBANK':
            return AllocationRequest.objects.all()  # bloodbank can see all? Maybe restrict later.
        return AllocationRequest.objects.none()

class FulfillAllocationView(generics.GenericAPIView):
    permission_classes = [IsBloodBankUser]
    queryset = AllocationRequest.objects.all()

    def post(self, request, pk):
        allocation_request = self.get_object()
        if allocation_request.status in ['FULFILLED', 'CANCELLED']:
            return Response({'error': 'Request already fulfilled or cancelled'}, status=status.HTTP_400_BAD_REQUEST)

        # Run smart allocation algorithm
        hospital = allocation_request.hospital
        allocations, status_result, message = smart_allocate(
            hospital=hospital,
            blood_group=allocation_request.blood_group,
            units_requested=allocation_request.units_requested - allocation_request.units_allocated,
            emergency=allocation_request.emergency_flag
        )

        if not allocations:
            return Response({'message': message}, status=status.HTTP_200_OK)

        # Update inventory and create AllocationItems
        with transaction.atomic():
            total_taken = 0
            for alloc in allocations:
                batch = Inventory.objects.select_for_update().get(id=alloc['inventory_id'])
                if batch.units_available < alloc['units_taken']:
                    raise Exception("Insufficient units now")  # rollback
                batch.units_available -= alloc['units_taken']
                batch.save()
                AllocationItem.objects.create(
                    allocation_request=allocation_request,
                    inventory_batch=batch,
                    units_taken=alloc['units_taken'],
                    bloodbank_id=alloc['bloodbank_id'],
                    distance_km=alloc['distance_km'],
                    estimated_delivery_min=alloc['estimated_delivery_min']
                )
                total_taken += alloc['units_taken']

            allocation_request.units_allocated += total_taken
            if allocation_request.units_allocated >= allocation_request.units_requested:
                allocation_request.status = 'FULFILLED'
            else:
                allocation_request.status = 'PARTIALLY_FULFILLED'
            allocation_request.allocated_at = timezone.now()
            allocation_request.save()

        serializer = AllocationRequestSerializer(allocation_request)
        return Response(serializer.data, status=status.HTTP_200_OK)