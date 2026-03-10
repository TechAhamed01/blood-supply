from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import AllocationRequest, AllocationItem
from .serializers import AllocationRequestSerializer
from apps.inventory.models import Inventory

# AI engine helpers
from apps.ai_engine.allocation_algorithm import (
    smart_allocate, 
    get_nearest_bloodbanks_with_details,
    is_bloodbank_near_request,
    smart_allocate_with_bank_details
)
from apps.users.permissions import IsHospitalUser, IsBloodBankUser

class AllocationRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = AllocationRequest.objects.all()
        
        # --- 1. Generic Query Parameter Filtering ---
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        allocated_date = self.request.query_params.get('allocated_at__date')
        if allocated_date:
            queryset = queryset.filter(allocated_at__date=allocated_date)

        bloodbank_id = self.request.query_params.get('bloodbank_id')

        # --- 2. Role-Based Access Control & Logic ---
        if user.role == 'ADMIN':
            if bloodbank_id:
                queryset = queryset.filter(items__bloodbank_id=bloodbank_id).distinct()
            return queryset.order_by('-requested_at')

        elif user.role == 'HOSPITAL':
            return queryset.filter(hospital=user.hospital).order_by('-requested_at')

        elif user.role == 'BLOODBANK':
            bloodbank = user.bloodbank
            
            # Case A: If specifically filtering by a bloodbank_id param (usually their own)
            if bloodbank_id:
                queryset = queryset.filter(items__bloodbank_id=bloodbank_id).distinct()
            
            # Case B: Combine requests they've contributed to WITH requests they ARE NEAR
            # First, get requests where they already have items
            contributed_ids = list(queryset.filter(items__bloodbank=bloodbank).values_list('id', flat=True))
            
            # Second, get PENDING requests where they are among the top 3 nearest (Original Logic)
            all_pending = AllocationRequest.objects.filter(status='PENDING').select_related('hospital')
            relevant_near_ids = []
            
            for request in all_pending:
                remaining = request.units_requested - request.units_allocated
                if remaining > 0:
                    if is_bloodbank_near_request(
                        bloodbank.bloodbank_id,
                        request.hospital,
                        request.blood_group,
                        remaining
                    ):
                        relevant_near_ids.append(request.id)
            
            # Return union of both
            final_ids = list(set(contributed_ids + relevant_near_ids))
            return AllocationRequest.objects.filter(id__in=final_ids).order_by('-requested_at')

        return AllocationRequest.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'HOSPITAL':
            self.permission_denied(self.request)
        serializer.save(hospital=self.request.user.hospital, status='PENDING')


class AllocationRequestDetailView(generics.RetrieveAPIView):
    queryset = AllocationRequest.objects.all()
    serializer_class = AllocationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return AllocationRequest.objects.all()
        elif user.role == 'HOSPITAL':
            return AllocationRequest.objects.filter(hospital=user.hospital)
        elif user.role == 'BLOODBANK':
            # Blood banks can view details of requests they are eligible for or involved in
            return AllocationRequest.objects.all() 
        return AllocationRequest.objects.none()


class FulfillAllocationView(generics.GenericAPIView):
    permission_classes = [IsBloodBankUser]
    queryset = AllocationRequest.objects.all()

    def post(self, request, pk):
        allocation_request = self.get_object()
        if allocation_request.status in ['FULFILLED', 'CANCELLED']:
            return Response(
                {'error': 'Request already fulfilled or cancelled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Run smart allocation algorithm
        hospital = allocation_request.hospital
        allocations, status_result, message = smart_allocate(
            hospital=hospital,
            blood_group=allocation_request.blood_group,
            units_requested=allocation_request.units_requested - allocation_request.units_allocated,
            emergency=allocation_request.emergency_flag,
            current_bloodbank=request.user.bloodbank
        )

        if not allocations:
            return Response({'message': message}, status=status.HTTP_200_OK)

        with transaction.atomic():
            total_taken = 0
            for alloc in allocations:
                batch = Inventory.objects.select_for_update().get(
                    inventory_id=alloc['inventory_id']
                )
                if batch.units_available < alloc['units_taken']:
                    raise Exception("Insufficient units now")
                
                batch.units_available -= alloc['units_taken']
                batch.save()
                
                AllocationItem.objects.create(
                    allocation_request=allocation_request,
                    inventory_batch=batch,
                    units_taken=alloc['units_taken'],
                    bloodbank=batch.bloodbank,
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