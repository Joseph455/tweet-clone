from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout, authenticate
from django.contrib.sites.models import Site
import json
from userapp.forms import LoginForm, RegistrationForm, ForgotPasswordForm, ProfileForm, ProfileUserForm
from userapp.models import Profile, Notifier
from tweetapp.serializers import like_serializer, profile_serializer, thread_serializer
# Create your views here.


def home(request):
    if request.user.is_authenticated:
        return redirect(reverse("tweetapp:feed"))
    return render(request, "userapp/login.html")


def login_view(request):
    if request.is_ajax and request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            usr = User.objects.filter(email__iexact=form.cleaned_data["email"])
            if usr:
                username = usr[0].username
                user = authenticate(request, username=username, email=form.cleaned_data["email"], password=form.cleaned_data["password"])
                if user:
                    login(request, user)
                    return JsonResponse({"url": f"http://{Site.objects.get_current()}/"}, status=200)
                else:
                    return JsonResponse({"errors": ["Invalid email or password"]}, status=404)
            else:
                return JsonResponse({"errors": ["Invalid email or password"]}, status=404)
        else:
            return JsonResponse({"errors": form.errors}, status=404)
    return  JsonResponse({"errors": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


# Registration helper functions
def create_user_profile(user):
    profile = Profile.objects.create(user=user)
    Notifier.objects.create(profile=profile)
    user.username = f"{user.first_name}{user.id}"
    user.save()
    return user


def registration_view(request):
    if request.is_ajax and request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            if not User.objects.filter(email__iexact=form.cleaned_data["email"]):
                user = form.save()
                user.set_password(form.cleaned_data["password"])
                user.save()
                create_user_profile(user)
                login(request, user)
                return JsonResponse({"url": f"http://{Site.objects.get_current()}/"}, status=200)
            else:
                return JsonResponse({"errors": ["User with this email already exits"]}, status=404)
        else:
            return JsonResponse({"errors": form.errors}, status=404)
    return  JsonResponse({"errors": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


def logout_view(request):
    logout(request)
    return redirect("userapp:home")

def forgot_password(request):
    pass


@login_required
def view_profile(request, username, profile_id):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    return render(request, "userapp/profile.html", {"profile": profile})


@login_required
def follow_profile(request, username, profile_id):
    if request.method == "POST":
        profile = get_object_or_404(Profile, id=request.POST.get("profile_id"))
        # if profile == request.user.profile:
        #     return JsonResponse({}, status=200)
        if profile in request.user.profile.following.all():
            request.user.profile.following.remove(profile)
            print(request.user.profile.following.all())
            return JsonResponse({}, status=201)
        else:
            request.user.profile.following.add(profile)
            print(request.user.profile.following.all())
            return JsonResponse({}, status=201)
    return JsonResponse({}, status=200)


@login_required
def edit_profile(request):
    if request.method =="POST" and request.is_ajax:
        profile = request.user.profile
        user_form = ProfileUserForm(request.POST, instance=request.user)
        profile_form =  ProfileForm(request.POST, request.FILES, instance=profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return JsonResponse({}, status=201)
        else:
            return JsonResponse({"errors": user_form.errors+profile_form.errors}, status=404)
    return JsonResponse({}, status=200)


@login_required
def get_followers(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    followers = [profile_serializer(i, request.user.profile) for i in profile.followers.all()]
    return JsonResponse({'profiles': followers})


@login_required
def get_following(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)    
    following = [profile_serializer(i, request.user.profile) for i in profile.following.all()]
    return JsonResponse({'profiles': following})


@login_required
def get_tweets(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    tweets = list(profile.user.tweet_set.all().order_by("-date"))
    maxState = len(tweets)//10
    start = loadState*10
    end = start + 10
    if loadState <= maxState:
        tweets = tweets[start:end]
        tweets =  [thread_serializer(twt, request.user.profile) for twt in tweets]
    else:
        tweets = []
    return JsonResponse({'tweets': tweets, 'maxState': maxState})


@login_required
def get_replies(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    replies = list(profile.user.reply_set.all().order_by("-date"))
    maxState = len(replies)//10
    start = loadState*10
    end = start + 10
    if loadState <= maxState:
        replies = replies[start:end]
        replies =  [thread_serializer(reply, request.user.profile) for reply in replies]
        print(replies, loadState)
    else:
        replies = []
    return JsonResponse({'replies': replies, 'maxState': maxState})


@login_required
def get_likes(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    likes = list(profile.like_set.all().order_by("-date"))
    maxState = len(likes)//10
    start = loadState*10
    end = start + 10
    if loadState <= maxState:
        likes = likes[start:end]
        if request.user.is_anonymous:
            likes = [like_serializer(lke) for lke in likes]
        else:
            likes = [like_serializer(lke, request.user.profile) for lke in likes]
    else :
        likes = []
    return JsonResponse({'likes': likes, 'maxState': maxState})


@login_required
def get_medias(request, profile_id, username, loadState):
    profile = get_object_or_404(Profile, pk=profile_id, user__username=username)
    medias = list(profile.media_set.all().order_by("-date"))
    maxState = len(medias)//5
    start = loadState*5
    end = start + 5
    if loadState <= maxState:
        medias = medias[start:end]
        if request.user.is_anonymous:
            medias = [like_serializer(med) for med in medias]
        else :
            medias = [like_serializer(med, request.user.profile) for med in medias]
    else :
        medias = []
    return JsonResponse({'medias': medias, 'maxState': maxState})

