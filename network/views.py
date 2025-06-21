from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.http import JsonResponse
from .models import Post, User
import json
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator


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
        page = request.GET.get('page', 1)
        posts_per_page = 10
        
        user = request.user
        
        all_posts = Post.objects.all().order_by("-timestamp")
        
        paginator = Paginator(all_posts, posts_per_page)

        page_obj = paginator.get_page(page)

        serialized_posts = []
        for post in page_obj:
            post_data = post.serialize()
            post_data['liked'] = request.user in post.likes.all() if request.user.is_authenticated else False
            serialized_posts.append(post_data)
        
        return JsonResponse({
            'posts': serialized_posts,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'user': user.username
        }, safe=False)
    
    
    elif request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")
        post_id = data.get("post_id", None)
        
        if post_id:
            post = get_object_or_404(Post, id=post_id)
            
            if request.user in post.likes.all():
                post.likes.remove(request.user)
                liked = False
            else:
                post.likes.add(request.user)
                liked = True
            
            return JsonResponse({
                "likes": post.likes.count(),
                "liked": liked
            }, status=200)
        
        elif content:
            post = Post(user=request.user, content=content)
            post.save()
            
            return JsonResponse({"message": "Post created successfully"}, status=201)
        
        else:
            return JsonResponse({"error": "Post cannot be empty"}, status=400)
    
    elif request.method == "PUT":
        data = json.loads(request.body)
        post_id = data.get("post_id")
        content = data.get("content", "")
        
        if content == "":
            return JsonResponse({"error": "Post cannot be empty"}, status=400)

        post = get_object_or_404(Post, id=post_id, user=request.user)
        post.content = content
        post.save()
        
        return JsonResponse({"message": "Post updated successfully"}, status=200)
    
    elif request.method == "DELETE":
        data = json.loads(request.body)
        post_id = data.get("post_id")
        
        post = get_object_or_404(Post, id=post_id, user=request.user)
        post.delete()
        
        return JsonResponse({"message": "Post deleted successfully"}, status=200)
    
def user_profile(request, username):

    user = get_object_or_404(User, username=username)

    return render(request, "network/user_profile.html", {
        "user": user,
    })

@csrf_exempt
def user_profile_api(request, username):

    user = get_object_or_404(User, username=username)
    logged_in_user = request.user.username 

    if request.method == "GET":
        page = request.GET.get('page', 1)
        posts_per_page = 10
        
        user_posts = Post.objects.filter(user=user).order_by("-timestamp")
        
        paginator = Paginator(user_posts, posts_per_page)
        
        page_obj = paginator.get_page(page)

        serialized_posts = []
        for post in page_obj:
            post_data = post.serialize()
            post_data['liked'] = request.user in post.likes.all() if request.user.is_authenticated else False
            serialized_posts.append(post_data)
        
        return JsonResponse({
            "username": user.username,
            "logged_in_user": logged_in_user,
            "posts": serialized_posts,
            "followers": user.followers.count(),
            "following": user.following.count(),
            "is_following": request.user in user.followers.all() if request.user.is_authenticated else False,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
            "current_page": page_obj.number,
            "total_pages": paginator.num_pages
        })

    elif request.method == "POST":
        if request.user in user.followers.all():
            user.followers.remove(request.user)
            request.user.following.remove(user)
            is_following = False
        else:
            user.followers.add(request.user)
            request.user.following.add(user)
            is_following = True
        user.save()
        request.user.save()
       
        return JsonResponse({"is_following": is_following, "followers": user.followers.count(), "following": user.following.count()})

def following(request):
    return render(request, "network/following.html")

def following_api(request):
    user = request.user
    following_users = user.following.all()

    page = request.GET.get('page', 1)
    posts_per_page = 10

    all_posts = Post.objects.filter(user__in=following_users).order_by("-timestamp")
    
    paginator = Paginator(all_posts, posts_per_page)

    page_obj = paginator.get_page(page)

    serialized_posts = []
    for post in page_obj:
        post_data = post.serialize()
        post_data['liked'] = request.user in post.likes.all() if request.user.is_authenticated else False
        serialized_posts.append(post_data)
    
    return JsonResponse({
        'posts': serialized_posts,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages
    }, safe=False)
 