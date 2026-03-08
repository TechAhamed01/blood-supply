from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .demand_predictor import DemandPredictor
from .shortage_detector import detect_shortage_risks
from .delivery_time import DeliveryTimeEstimator
from apps.hospitals.models import Hospital
from apps.bloodbanks.models import BloodBank
from datetime import datetime


class DemandForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hospital_id = request.query_params.get('hospital_id')
        blood_group = request.query_params.get('blood_group')
        if not hospital_id or not blood_group:
            return Response({'error': 'hospital_id and blood_group required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check permission: hospital users can only forecast their own hospital
        user = request.user
        if user.role == 'HOSPITAL' and user.hospital.hospital_id != int(hospital_id):
            return Response({'error': 'You can only forecast for your own hospital'}, status=status.HTTP_403_FORBIDDEN)

        predictor = DemandPredictor()
        try:
            forecast = predictor.forecast_7_days(int(hospital_id), blood_group)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'hospital_id': hospital_id, 'blood_group': blood_group, 'forecast': forecast})

class ShortageRisksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only admin can see all risks? Or hospital can see their city? We'll allow admin only.
        if request.user.role != 'ADMIN':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        risks = detect_shortage_risks()
        return Response(risks)

class DeliveryTimeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        bloodbank_id = request.data.get('bloodbank_id')
        hospital_id = request.data.get('hospital_id')
        if not bloodbank_id or not hospital_id:
            return Response({'error': 'bloodbank_id and hospital_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bb = BloodBank.objects.get(bloodbank_id=bloodbank_id)
            hosp = Hospital.objects.get(hospital_id=hospital_id)
        except (BloodBank.DoesNotExist, Hospital.DoesNotExist):
            return Response({'error': 'Invalid IDs'}, status=status.HTTP_404_NOT_FOUND)

        estimator = DeliveryTimeEstimator()
        minutes = estimator.estimate(bb.latitude, bb.longitude, hosp.latitude, hosp.longitude)
        return Response({'delivery_time_minutes': minutes})