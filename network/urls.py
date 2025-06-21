
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),         
    path("logout", views.logout_view, name="logout"),      
    path("register", views.register, name="register"),      
    path("following", views.following, name="following"),   
    path("<str:username>", views.user_profile, name="user_profile"),  
    
    path("api/posts", views.posts, name="posts_api"),                           
    path("api/following/posts", views.following_api, name="following_posts_api"),  
    path("api/profile/<str:username>", views.user_profile_api, name="user_profile_api"),  
    path("api/profile/<str:username>/followers", views.get_followers_list, name="followers_list_api"),  
    path("api/profile/<str:username>/following", views.get_following_list, name="following_list_api"),  
]
