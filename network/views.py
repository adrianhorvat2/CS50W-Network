from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from .models import Post, User
import json
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt



def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def posts(request):

    if request.method == "GET":
        posts = Post.objects.all().order_by("-timestamp")
        return JsonResponse([post.serialize() for post in posts], safe=False)
    
    elif request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")
        
        if content == "":
            return JsonResponse({"error": "Post cannot be empty"}, status=400)

        post = Post(user=request.user, content=content)
        post.save()
        
        return JsonResponse({"message": "Post created successfully"}, status=201)
    
def user_profile(request, username):

    user = User.objects.get(username=username)

    return render(request, "network/user_profile.html", {
        "user": user,
    })

@csrf_exempt
def user_profile_api(request, username):

    user = User.objects.get(username=username)
    posts = Post.objects.filter(user=user).order_by("-timestamp")

    if request.method == "GET":
        return JsonResponse({
            "username": user.username,
            "followers": user.followers.count(),
            "following": user.following.count(),
            "posts": [post.serialize() for post in posts],
            "is_following": request.user in user.followers.all() if request.user.is_authenticated else False
        })

    elif request.method == "POST":
        if request.user in user.followers.all():
            user.followers.remove(request.user)
            is_following = False
        else:
            user.followers.add(request.user)
            is_following = True

        return JsonResponse({"is_following": is_following, "followers": user.followers.count()})

