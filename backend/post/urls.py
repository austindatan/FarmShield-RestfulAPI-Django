from django.urls import path
from .views import (
    FarmListCreateAPIView,
    FarmRetrieveUpdateDestroyAPIView,
    CropListCreateAPIView,
    CropRetrieveUpdateDestroyAPIView,
    SensorNodeListCreateAPIView,
    SensorNodeRetrieveUpdateDestroyAPIView,
    SensorDataListCreateAPIView,
    SensorDataRetrieveUpdateDestroyAPIView,
    DiseasePredictionListCreateAPIView,
    DiseasePredictionRetrieveUpdateDestroyAPIView,
    IrrigationRecommendationListCreateAPIView,
    IrrigationRecommendationRetrieveUpdateDestroyAPIView,
    YieldForecastListCreateAPIView,
    YieldForecastRetrieveUpdateDestroyAPIView,
    AlertListCreateAPIView,
    AlertRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    # Farm
    path('farms/', FarmListCreateAPIView.as_view(), name='farm-list-create'),
    path('farms/<int:pk>/', FarmRetrieveUpdateDestroyAPIView.as_view(), name='farm-detail'),

    # Crop
    path('crops/', CropListCreateAPIView.as_view(), name='crop-list-create'),
    path('crops/<int:pk>/', CropRetrieveUpdateDestroyAPIView.as_view(), name='crop-detail'),

    # Sensor Node
    path('sensor-nodes/', SensorNodeListCreateAPIView.as_view(), name='sensornode-list-create'),
    path('sensor-nodes/<int:pk>/', SensorNodeRetrieveUpdateDestroyAPIView.as_view(), name='sensornode-detail'),

    # Sensor Data
    path('sensor-data/', SensorDataListCreateAPIView.as_view(), name='sensordata-list-create'),
    path('sensor-data/<int:pk>/', SensorDataRetrieveUpdateDestroyAPIView.as_view(), name='sensordata-detail'),

    # Disease Prediction
    path('disease-predictions/', DiseasePredictionListCreateAPIView.as_view(), name='diseaseprediction-list-create'),
    path('disease-predictions/<int:pk>/', DiseasePredictionRetrieveUpdateDestroyAPIView.as_view(), name='diseaseprediction-detail'),

    # Irrigation Recommendation
    path('irrigation-recommendations/', IrrigationRecommendationListCreateAPIView.as_view(), name='irrigationrecommendation-list-create'),
    path('irrigation-recommendations/<int:pk>/', IrrigationRecommendationRetrieveUpdateDestroyAPIView.as_view(), name='irrigationrecommendation-detail'),

    # Yield Forecast
    path('yield-forecasts/', YieldForecastListCreateAPIView.as_view(), name='yieldforecast-list-create'),
    path('yield-forecasts/<int:pk>/', YieldForecastRetrieveUpdateDestroyAPIView.as_view(), name='yieldforecast-detail'),

    # Alert
    path('alerts/', AlertListCreateAPIView.as_view(), name='alert-list-create'),
    path('alerts/<int:pk>/', AlertRetrieveUpdateDestroyAPIView.as_view(), name='alert-detail'),
]