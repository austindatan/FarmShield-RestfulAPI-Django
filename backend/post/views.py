from rest_framework import generics
from .models import (
    Farm,
    Crop,
    SensorNode,
    SensorData,
    DiseasePrediction,
    IrrigationRecommendation,
    YieldForecast,
    Alert,
)
from .serializers import (
    FarmSerializer,
    CropSerializer,
    SensorNodeSerializer,
    SensorDataSerializer,
    DiseasePredictionSerializer,
    IrrigationRecommendationSerializer,
    YieldForecastSerializer,
    AlertSerializer,
)


class FarmListCreateAPIView(generics.ListCreateAPIView):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer


class FarmRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer


class CropListCreateAPIView(generics.ListCreateAPIView):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer


class CropRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer


class SensorNodeListCreateAPIView(generics.ListCreateAPIView):
    queryset = SensorNode.objects.all()
    serializer_class = SensorNodeSerializer


class SensorNodeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SensorNode.objects.all()
    serializer_class = SensorNodeSerializer


class SensorDataListCreateAPIView(generics.ListCreateAPIView):
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer


class SensorDataRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer


class DiseasePredictionListCreateAPIView(generics.ListCreateAPIView):
    queryset = DiseasePrediction.objects.all()
    serializer_class = DiseasePredictionSerializer


class DiseasePredictionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiseasePrediction.objects.all()
    serializer_class = DiseasePredictionSerializer


class IrrigationRecommendationListCreateAPIView(generics.ListCreateAPIView):
    queryset = IrrigationRecommendation.objects.all()
    serializer_class = IrrigationRecommendationSerializer


class IrrigationRecommendationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IrrigationRecommendation.objects.all()
    serializer_class = IrrigationRecommendationSerializer


class YieldForecastListCreateAPIView(generics.ListCreateAPIView):
    queryset = YieldForecast.objects.all()
    serializer_class = YieldForecastSerializer


class YieldForecastRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = YieldForecast.objects.all()
    serializer_class = YieldForecastSerializer


class AlertListCreateAPIView(generics.ListCreateAPIView):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer


class AlertRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer