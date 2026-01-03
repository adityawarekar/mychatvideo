from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    STATUS_CHOICES =(
        ('online', 'Online'),
        ('offline', 'offline'),
        ('in_call', 'In Call'),
    )

    user = models.OneToOneField(User,  on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='offline'
    )

    def __str__(self):
        return self.user.username
