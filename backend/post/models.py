from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Farm(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.name} ({self.owner.username})'


class Crop(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='crops')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.name} @ {self.farm.name}'


class SensorNode(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='sensor_nodes')
    label = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.label} @ {self.farm.name}'


class SensorData(models.Model):
    sensor_node = models.ForeignKey(SensorNode, on_delete=models.CASCADE, related_name='sensor_data')
    soil_moisture = models.FloatField()
    soil_temperature = models.FloatField()
    soil_pH = models.FloatField()
    air_temperature = models.FloatField()
    air_humidity = models.FloatField()
    leaf_wetness = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'SensorData [{self.sensor_node.label}] @ {self.timestamp}'


class DiseasePrediction(models.Model):
    RISK_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    sensor_data = models.ForeignKey(SensorData, on_delete=models.CASCADE, related_name='disease_predictions')
    disease_name = models.CharField(max_length=255)
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES)
    confidence = models.FloatField(help_text='Confidence score 0.0 - 1.0')
    predicted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.disease_name} ({self.risk_level}) - {self.sensor_data}'


class IrrigationRecommendation(models.Model):
    sensor_data = models.ForeignKey(SensorData, on_delete=models.CASCADE, related_name='irrigation_recommendations')
    should_irrigate = models.BooleanField()
    recommended_duration_minutes = models.PositiveIntegerField()
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        action = 'Irrigate' if self.should_irrigate else 'No Irrigation'
        return f'{action} - {self.sensor_data}'


class YieldForecast(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='yield_forecasts')
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='yield_forecasts')
    forecasted_yield_kg = models.FloatField()
    forecast_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Yield Forecast for {self.crop.name} @ {self.farm.name} on {self.forecast_date}'


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('Info', 'Info'),
        ('Warning', 'Warning'),
        ('Critical', 'Critical'),
    ]

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='alerts')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.severity}] {self.message[:50]} @ {self.farm.name}'