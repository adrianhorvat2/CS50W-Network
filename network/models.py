from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", blank=True)
    following = models.ManyToManyField("self", blank=True)
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "followers": self.followers.count(),
            "following": self.following.count(),
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name='likes')

    def serialize(self): 
        return {
            "id": self.id,
            "user": self.user.username,  
            "content": self.content,
            "timestamp": self.timestamp.strftime("%H:%M %B %d, %Y"),
            "likes": self.likes.count(),
        }
    
    def __str__(self):
        return f"{self.user.username}: {self.content}"