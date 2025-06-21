
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.posts, name="posts"),
    path("following", views.following, name="following"),
    path("following_api", views.following_api, name="following_api"),
    path("<str:username>", views.user_profile, name="user_profile"),
    path("api/profile/<str:username>", views.user_profile_api, name="user_profile_api"),
    path("api/followers/<str:username>", views.get_followers_list, name="get_followers_list"),
    path("api/following/<str:username>", views.get_following_list, name="get_following_list"),
]
