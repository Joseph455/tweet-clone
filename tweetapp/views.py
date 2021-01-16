from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.sites.models import Site
from django.contrib.sites.shortcuts import get_current_site
from django.views.generic import View
from django.contrib.auth.models import User
from django.db.models import Q

import json

from userapp.models import Like, Profile

from tweetapp.serializers import *
from tweetapp.models import Tweet, Reply, Message, Conversation, ConversationInvite, DirectMessage
from tweetapp.forms  import MessageForm

# Create your views here.



class HomeView(View):
    def get(self, request, *args, **kwargs):
        amt, load_state = kwargs.get("max", None), kwargs.get("load_state", None)
        if load_state  != None:
            print(amt, load_state)
            threads = request.user.profile.get_related_threads()
            maxState = len(threads)//amt
            start = load_state*amt
            end = start + amt
            if load_state<=maxState:
                threads = [thread_serializer(thread, request.user.profile) for thread in threads]
                threads = threads[start:end]
            return JsonResponse({'threads': threads, 'maxState': maxState})
        else:
            threads = request.user.profile.get_related_threads()
            return render(request, 'home.html', {'threads': threads})


@login_required
def home(request):
    threads = request.user.profile.get_related_threads()
    return render(request, 'home.html', {'threads': threads})


@login_required
def getThreads(request, loadState=0):	
    threads = request.user.profile.get_related_threads()
    maxState = len(threads)//10
    start = loadState*10
    end = start + 10
    if loadState<=maxState:
        threads = [thread_serializer(thread, request.user.profile) for thread in threads]
        threads = threads[start:end]
    return JsonResponse({'threads': threads, 'maxState': maxState})



@login_required
def like_tweet(request):
    # This adds a like or removes like 
    if request.is_ajax and request.method == "POST":
        data = json.loads(request.body)
        try:    
            reply = Tweet.objects.get(pk=int(data["id"]))
            like = reply.like_set.get_or_create(profile=request.user.profile)
        except Tweet.DoesNotExist:
            return JsonResponse({"error": f"Tweet with ID: {data['id']}  Does Not Exits"}, status=404)
        except Like.MultipleObjectsReturned:
            likes = Like.objects.all().filter(profile=request.user.profile).order_by('date')
            for i in range(len(likes)-1):
                likes[i].delete()
            like = reply.like_set.get_or_create(profile=request.user.profile)
        
        # delete the users like object if it already exits
        if like[1] == False:
            like[0].delete()
        thread = thread_serializer(reply, request.user.profile)
        return JsonResponse({'thread': thread},status=201)
    return  JsonResponse({"error": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


@login_required
def add_tweet(request):
    if request.is_ajax and request.method == "POST":
        msg = MessageForm(request.POST, request.FILES) 
        if msg.is_valid():
            msg = msg.save()
            twt = request.user.tweet_set.create(message=msg)
            if request.FILES:
                request.user.profile.media_set.create(tweet=twt)
            return JsonResponse({}, status=201)
    return  JsonResponse({"error": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)



@login_required
def reply_tweet(request):
    if request.is_ajax and request.method == "POST":
        msg = MessageForm(request.POST, request.FILES)
        if msg.is_valid():
            msg = msg.save()
            tweet = get_object_or_404(Tweet, pk=int(request.POST.get("comment_id")))
            reply = request.user.reply_set.create(
                message = msg,
                tweet = tweet
            )
            if request.FILES:
                request.user.profile.media_set.create(reply=reply)
            thread = thread_serializer(reply, request.user.profile)
            return JsonResponse({"thread": thread} ,status=201)
        else:
            return JsonResponse(msg.errors, status=400)
    return  JsonResponse({"error": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


@login_required
def retweet_tweet(request):
    if request.is_ajax and request.method == "POST":
        msg = MessageForm(request.POST, request.FILES)
        if msg.is_valid():
            msg = msg.save()
            tweet = get_object_or_404(Tweet, pk=int(request.POST.get("comment_id")))    
            twt = request.user.tweet_set.create(
                message=msg,
                tweet=tweet
            )
            if request.FILES:
                request.user.profile.media_set.create(tweet=twt)
            thread = thread_serializer(tweet, request.user.profile)
            return JsonResponse({"thread": thread}, status=201)
        else:
            tweet = get_object_or_404(Tweet, pk=int(request.POST.get("comment_id")))    
            request.user.tweet_set.create(
                tweet=tweet
            )
            thread = thread_serializer(tweet, request.user.profile)
            return JsonResponse({"thread": thread}, status=201)
    return  JsonResponse({"error": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


# reply section 
def view_tweet(request, creator_username, tweet_id):
    tweet = get_object_or_404(Tweet, pk=tweet_id, creator__username=creator_username)
    return render(request, "tweet.html", {"tweet": tweet})


def get_icons_state(request, creator_username, tweet_id):
    if request.user.is_anonymous:
        return JsonResponse({}, status=403)
    try:
        tweet = Tweet.objects.get(pk=tweet_id, creator__username=creator_username)
        response_data = {
            "reply-icon": "true" if request.user.profile.user.reply_set.filter(tweet=tweet) else "false",
            "retweet-icon": "true" if request.user.profile.user.tweet_set.filter(tweet=tweet) else "false",
            "like-icon": "true" if request.user.profile.like_set.filter(tweet=tweet) else "false"
        }
    except Tweet.DoesNotExist:
        return JsonResponse({"error": f"Tweet with ID: {tweet_id}  Does Not Exits"}, status=404)
    return JsonResponse(response_data, status=200)


def get_tweet_replies(request, creator_username, tweet_id, load_state):
    try:
        tweet = Tweet.objects.get(pk=tweet_id, creator__username=creator_username)
        replies = tweet.reply_set.all().order_by("-date")
        max_state = len(replies)//10
        start = load_state*10
        end = start + 10
        if load_state<=max_state:
            if request.user.is_anonymous:
                replies = [thread_serializer(rep) for rep in replies[start:end]]
            else:
                replies = [thread_serializer(rep, request.user.profile) for rep in replies[start:end]]
    
    except Tweet.DoesNotExist:
        return JsonResponse({"error": f"The resource you requested does not exits or has been removed from the server"}, status=404)
    
    return JsonResponse({'replies': replies, 'maxState': max_state})


@login_required
def reply_reply(request):
    if request.POST and request.is_ajax:
        msg = MessageForm(request.POST, request.FILES)
        if msg.is_valid():
            msg = msg.save()
            reply = get_object_or_404(Reply, pk=int(request.POST.get("comment_id")))
            rply = request.user.reply_set.create(
                message= msg,
                reply=reply
            )
            if request.FILES:
                request.user.profile.media_set.create(reply=rply)
            thread = thread_serializer(rply, request.user.profile)
            return JsonResponse({"thread": thread}, status=201)
        else:
            return JsonResponse(msg.errors, status=400)
    return  JsonResponse({"Response": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


@login_required
def like_reply(request):
    if request.is_ajax and request.method == "POST":
        data = json.loads(request.body)
        try:    
            rply = Reply.objects.get(pk=int(data["id"]))
        except Tweet.DoesNotExist:
            return JsonResponse({"error": "Resource Does Not Exits"}, status=404)
        try:
          like = rply.like_set.get_or_create(profile=request.user.profile)
        except Like.MultipleObjectsReturned:
          likes = Like.objects.all().filter(profile=request.user.profile).order_by('date')
          for i in range(len(likes)-1):
            likes[i].delete()
          like = rply.like_set.get_or_create(profile=request.user.profile)
        
        # delete the users like object if it already exits
        if like[1] == False:
            like[0].delete()
        thread = thread_serializer(rply, request.user.profile)
        return JsonResponse({'thread': thread},status=201)
    return  JsonResponse({"response": "Wrong request method for view: <Make request using AJAX with POST header >"}, status=200)


# Reply section
def view_reply(request, creator_username, reply_id):
    reply = get_object_or_404(Reply, pk=reply_id, creator__username=creator_username)
    return render(request, "reply.html", {"reply": reply, "Site": Site.objects.all()[0]})


@login_required
def get_reply_icons_state(request, creator_username, reply_id):
    reply = get_object_or_404(Reply, pk=reply_id, creator__username=creator_username)
    profile = request.user.profile
    response_data = {
        "reply-icon": "true" if profile.user.reply_set.filter(reply=reply) else "false",
        "retweet-icon": "false",
        "like-icon": "true" if profile.like_set.filter(reply=reply) else "false"
    }
    return JsonResponse(response_data)


def get_reply_replies(request, creator_username, reply_id, load_state):
    reply = get_object_or_404(Reply, pk=reply_id, creator__username=creator_username)
    replies = reply.replies_set.all().order_by("-date")
    max_state = len(replies)//10
    start = load_state*10
    end = start + 10
    if load_state<=max_state:
        if request.user.is_anonymous:
            replies = [thread_serializer(rep) for rep in replies[start:end]]
        else:
            replies = [thread_serializer(rep, request.user.profile) for rep in replies[start:end]]

    return JsonResponse({'replies': replies, 'maxState': max_state})



# MESSAGE SECTION

@login_required
def view_conversations(request):
    if request.method == "POST":
        profile_ids = json.loads(request.body).get("profile_ids", None)
        if profile_ids:
            conversation = request.user.conversation_set.create()
            for id in profile_ids:
                if id==request.user.profile.id:
                    continue
                try :
                    profile = Profile.objects.get(id=id) 
                    ConversationInvite.objects.create(creator=request.user, recipient=profile.user, conversation=conversation)
                except Profile.DoesNotExist:
                    continue
            conversation.save()
            return JsonResponse({"redirect":conversation.get_absolute_url()}, status=201)
    return render(request, "conversations.html")



@login_required
def get_conversations(request, loadState=0):
    conversations  = request.user.conversation_set.all().order_by("-date")
    maxState = len(conversations)//10
    start = loadState*10
    end = start + 10
    if loadState <= maxState:
        conversations = conversations[start:end]
        conversations = [conversation_serializer(conv, request.user.profile) for conv in conversations]
    else:
        conversations = []
    return JsonResponse({'conversations': conversations, 'maxState': maxState})



@login_required
def get_invites(request, loadState):
    invites  = request.user.invitation_set.all().order_by("-date")
    maxState = len(invites)//10
    start = loadState*10
    end = start + 10
    if loadState <= maxState:
        invites = invites[start:end]
        invites = [invite_serializer(invite, request.user.profile) for invite in invites]
    else:
        invites = []
    return JsonResponse({'invites': invites, 'maxState': maxState})
    

@login_required
def reject_invite(request):
    if request.method == "POST": 
        try:
            id = json.loads(request.body).get("id", None)   
            request.user.invitation_set.get(id=id).delete()
        except ConversationInvite.DoesNotExist:
            return JsonResponse({}, status=404)
        return JsonResponse({"message": 'Invitation rejected'}, status=201)
    return JsonResponse({}, status=200)


@login_required
def accept_invite(request):
    if request.method == "POST": 
        try:
            id = json.loads(request.body).get("id", None)   
            invite = request.user.invitation_set.get(id=id)
        except ConversationInvite.DoesNotExist:
            return JsonResponse({}, status=404)
        conversation = invite.conversation
        conversation.members.add(request.user)
        conversation.save()
        invite.delete()
        return JsonResponse({"redirect": conversation.get_absolute_url()}, status=201)
    return JsonResponse({}, status=200)


@login_required
def get_related_profiles(request):
    related = set(list(request.user.profile.followers.all()) + list(request.user.profile.following.all()))
    if request.user.profile in related:
        related.remove(request.user.profile)
    profiles = [profile_serializer(p, request.user.profile) for p in related]
    if request.user.profile in profiles:
        profiles.remove(request.user.profile)
    return JsonResponse({"profiles": profiles}, status=200)


@login_required
def find_profile(request, username="", amount=3):
    if username != "":
        print(request.is_ajax())
        results = list(Profile.objects.filter(
            Q(user__username__istartswith=username) | 
            Q(user__username__icontains=username)
            ).distinct())
        if request.user.profile in results:
            results.remove(request.user.profile)
        if len(results) > amount:
            results =  results[:amount]
        results = [profile_serializer(res, request.user.profile) for res in results]
        return JsonResponse({"results": results}, status=200)
    else:
        return render(request, 'search.html')



@login_required
def view_conversation(request, id):
    conv = request.user.conversation_set.get(id=id)
    if request.method == "GET":
        return render(request, 'conversation.html', {'conversation': conv})
    elif request.method == 'POST':
        conv.members.remove(request.user)
        if conv.members.count() == 0:
            conv.save()
            conv.delete()
        else :
            msg = Message.objects.create(content=f"{request.user.profile.get_username()} has left this conversation")
            conv.directmessage_set.create(message=msg)
            conv.save()
        return JsonResponse({}, status=201)


@login_required
def get_messages(request, id, loadState):
    conv = request.user.conversation_set.get(id=id)
    messages  = conv.directmessage_set.all().order_by("date")
    maxState = len(messages)//5
    start = loadState*5
    end = start + 5
    if loadState <= maxState:
        messages = messages[start:end]
        messages = [dm_serializer(message, request.user.profile) for message in messages]
    else:
        messages = []
    return JsonResponse({"messages": messages, "maxState": maxState}, status=200)


@login_required
def add_message(request, id):
    if request.method == "POST":
        conv = request.user.conversation_set.get(id=id)
        msg = MessageForm(request.POST, request.FILES)
        if msg.is_valid():
            msg = msg.save()
            dm = request.user.directmessage_set.create(message=msg,conversation=conv)
            dm.save()
            dm = dm_serializer(dm, request.user.profile)
            return JsonResponse({"message": dm}, status=201)
        else :
            return JsonResponse({"errors": msg.errors}, status=404)
    return redirect("tweetapp:messages")


