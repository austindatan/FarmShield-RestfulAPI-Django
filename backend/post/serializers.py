from rest_framework import serializers
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


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = '__all__'
        read_only_fields = ('created_at',)


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'


class SensorNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorNode
        fields = '__all__'
        read_only_fields = ('installed_at',)


class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = '__all__'
        read_only_fields = ('timestamp',)


class DiseasePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseasePrediction
        fields = '__all__'
        read_only_fields = ('predicted_at',)


class IrrigationRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationRecommendation
        fields = '__all__'
        read_only_fields = ('created_at',)


class YieldForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = YieldForecast
        fields = '__all__'
        read_only_fields = ('created_at',)


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ('created_at',)