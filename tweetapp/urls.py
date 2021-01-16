from django.urls import path
from tweetapp import views 

app_name = 'tweetapp'
urlpatterns = [
    # feed urls
    path('home', views.HomeView.as_view(), name="index"),
    path('home/g:max=<int:max>s=<int:load_state>', views.HomeView.as_view(), name="getFeed"),
    path('', views.home, name="feed"),
    path('threads-<int:loadState>/', views.getThreads, name="getThreads"),
    path('like-tweet/', views.like_tweet, name="like-tweet"),
    path('add-tweet/', views.add_tweet, name="add-tweet"),
    path('reply-tweet/', views.reply_tweet, name="reply-tweet"),
    path('retweet-tweet/', views.retweet_tweet, name="retweet-tweet"),
    # Profile urls
    path('<creator_username>/t-<int:tweet_id>/', views.view_tweet, name="view-tweet"),
    path('<creator_username>/t-<int:tweet_id>/<int:load_state>/', views.get_tweet_replies, name="get-tweet-reply"),
    path('<creator_username>/t-<int:tweet_id>/get-icon-state/', views.get_icons_state),
    path('reply-reply/', views.reply_reply, name="reply-reply"),
    path('like-reply/', views.like_reply, name="like-reply"),
    path('<creator_username>/r-<int:reply_id>/', views.view_reply, name="view-reply"),
    path('<creator_username>/r-<int:reply_id>/get-icon-state/', views.get_reply_icons_state),
    path('<creator_username>/r-<int:reply_id>/<int:load_state>/', views.get_reply_replies, name="get-reply-replies"),
    path('find/', views.find_profile, name="find"),
    path('find/username=<username>-amount=<int:amount>/', views.find_profile),
    # message/conversation urls
    path('messages/', views.view_conversations, name="messages"),
    path('messages/conversations/?state=:<int:loadState>', views.get_conversations, name="get-conversations"),
    path('messages/invites/?state=:<int:loadState>', views.get_invites, name="get-invites"),
    path('messages/invites/accept/', views.accept_invite, name="accept-invite"),
    path('messages/invites/reject/', views.reject_invite, name="reject-invite"),
    path('messages/conversations/<id>/', views.view_conversation, name="conversation"),
    path('messages/conversations/<id>/add/', views.add_message, name="add-message"),
    path('messages/conversations/<id>/state=<int:loadState>/', views.get_messages, name="get-messages"),
    path('messages/profile?=<username>/', views.find_profile, name="find-profile"),
    path('message/related-profiles/', views.get_related_profiles, name="get-related-profiles"),
]