from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from apps.inventory.models import Inventory
from .serializers import (
    DemandForecastInputSerializer, DemandForecastOutputSerializer,
    AllocationInputSerializer, AllocationOutputSerializer,
    DeliveryTimeInputSerializer, DeliveryTimeOutputSerializer,
    ShortageRiskOutputSerializer
)
from .demand_predictor import DemandPredictor
from .allocation_algorithm import smart_allocate
from .delivery_time import DeliveryTimeEstimator
from .shortage_detector import detect_shortage_risks
from .utils import haversine

class DemandForecastAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DemandForecastInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        hospital_id = serializer.validated_data['hospital_id']
        blood_group = serializer.validated_data['blood_group']
        start_date = serializer.validated_data.get('start_date', date.today())

        try:
            predictor = DemandPredictor()
            forecast = predictor.forecast_7_days(hospital_id, blood_group, start_date)
        except Exception as e:
            return Response(
                {"error": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        output_data = [{"date": d, "predicted_units": u} for d, u in forecast]
        output_serializer = DemandForecastOutputSerializer(data=output_data, many=True)
        output_serializer.is_valid()  # should be valid
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class SmartAllocationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AllocationInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        hospital_id = serializer.validated_data['hospital_id']
        blood_group = serializer.validated_data['blood_group']
        units_requested = serializer.validated_data['units_requested']
        emergency = serializer.validated_data.get('emergency_flag', False)

        hospital = get_object_or_404(Hospital, id=hospital_id)

        try:
            allocations, status_code, message = smart_allocate(
                hospital, blood_group, units_requested, emergency
            )
        except Exception as e:
            return Response(
                {"error": f"Allocation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response_data = {
            "status": status_code,
            "message": message,
            "allocations": allocations
        }
        output_serializer = AllocationOutputSerializer(data=response_data)
        output_serializer.is_valid()
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class DeliveryTimeEstimationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeliveryTimeInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Get coordinates
        if 'bloodbank_id' in data and 'hospital_id' in data:
            bloodbank = get_object_or_404(BloodBank, id=data['bloodbank_id'])
            hospital = get_object_or_404(Hospital, id=data['hospital_id'])
            lat1, lon1 = bloodbank.latitude, bloodbank.longitude
            lat2, lon2 = hospital.latitude, hospital.longitude
        else:
            lat1, lon1 = data['bloodbank_lat'], data['bloodbank_lon']
            lat2, lon2 = data['hospital_lat'], data['hospital_lon']

        try:
            estimator = DeliveryTimeEstimator()
            estimated_time = estimator.estimate(lat1, lon1, lat2, lon2)
            distance = haversine(lat1, lon1, lat2, lon2)
        except Exception as e:
            return Response(
                {"error": f"Estimation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        output_data = {
            "estimated_time_minutes": estimated_time,
            "distance_km": round(distance, 2)
        }
        output_serializer = DeliveryTimeOutputSerializer(data=output_data)
        output_serializer.is_valid()
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class ShortageRiskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            risks = detect_shortage_risks()
        except Exception as e:
            return Response(
                {"error": f"Shortage detection failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        output_serializer = ShortageRiskOutputSerializer(data=risks, many=True)
        output_serializer.is_valid()
        return Response(output_serializer.data, status=status.HTTP_200_OK)