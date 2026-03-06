from django.contrib import admin
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


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')
    search_fields = ('name', 'owner__username')


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm')
    search_fields = ('name', 'farm__name')
    list_filter = ('farm',)


@admin.register(SensorNode)
class SensorNodeAdmin(admin.ModelAdmin):
    list_display = ('label', 'farm')
    search_fields = ('label', 'farm__name')
    list_filter = ('farm',)


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ('sensor_node', 'soil_moisture', 'soil_temperature', 'air_humidity', 'timestamp')
    list_filter = ('sensor_node',)
    readonly_fields = ('timestamp',)


@admin.register(DiseasePrediction)
class DiseasePredictionAdmin(admin.ModelAdmin):
    list_display = ('disease_name', 'risk_level', 'confidence', 'sensor_data', 'predicted_at')
    list_filter = ('risk_level',)
    search_fields = ('disease_name',)


@admin.register(IrrigationRecommendation)
class IrrigationRecommendationAdmin(admin.ModelAdmin):
    list_display = ('sensor_data', 'should_irrigate', 'recommended_duration_minutes', 'created_at')
    list_filter = ('should_irrigate',)


@admin.register(YieldForecast)
class YieldForecastAdmin(admin.ModelAdmin):
    list_display = ('farm', 'crop', 'forecasted_yield_kg', 'forecast_date', 'created_at')
    list_filter = ('farm', 'crop')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('farm', 'severity', 'message', 'is_resolved', 'created_at')
    list_filter = ('severity', 'is_resolved', 'farm')
    search_fields = ('message',)