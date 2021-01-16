from tweetapp.models import Reply, Tweet
from django.utils import timezone


# def format_date(date):
#     str_months = {
#         1:"Jan", 2:"Feb", 3:"Mar", 4:"Aprl",
#         5:"May", 6:"Jun", 7:"Jul", 8:"Aug",
#         9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"
#     }
#     now = timezone.now()
#     if (now.date() - date.date()).days == 0:
#         # Check if the message was created today
#         if now.hour == date.hour:
#             if (now.minute - date.minute) ==0 :
#                 return "Just now"
#             else:
#                 return f'{now.minute - date.minute}m ago'
#         else :
#             return f'{now.hour - date.hour}hr ago'
#     else:
#         if (date.year < now.year):
#             # message sent over a year ago
#             return str(date)
#         else:
#             # message sent within the same year
#             # format day , month
#             return f'{str_months[date.month]}. {date.day}'


def thread_serializer(thread, profile=None, recursive_level=1):
    data = {}
    data['creator'] = None
    data['message'] = None
    data['tweet'] = None
    data['type'] = thread.__class__.__name__
    data["id"] = thread.id
    
    if data['type'] == "Tweet":
        data['absolute_url'] = thread.get_absolute_url()
        data['date'] =  thread.date
        data['replies'] = thread.get_replies
        data['likes'] = thread.get_likes
        data['retweets'] = thread.get_retweets
        
        if (profile):
            data['likeState'] = "true" if profile.like_set.filter(tweet=thread) else "false"
            data['retweetState'] = "true" if profile.user.tweet_set.filter(tweet=thread) else "false" 
            data["replyState"] = "true" if profile.user.reply_set.filter(tweet=thread) else "false"
            if profile == thread.creator.profile:
                data["you"] = True
        
        if thread.message:
            data['message'] = {
                'content': thread.message.content,
                'media': thread.message.get_media_url() if thread.message.image else None
            }

        if thread.tweet and recursive_level<2:
            data['tweet'] = thread_serializer(thread.tweet, profile, recursive_level+1)
            data['type'] = 'Retweet'
            data['absolute_url'] = thread.get_absolute_url()
        
        if thread.creator:
            data['creator'] = {
                'username': thread.creator.profile.get_username(),
                'name': f"{thread.creator.first_name} {thread.creator.last_name}",
                'profileLink': thread.creator.profile.get_absolute_url(),
                'profilePicture': thread.creator.profile.image.url,
            }

    else:
        data['absolute_url'] = thread.get_absolute_url()
        data['date'] =  thread.date
        data['replies'] = thread.get_replies
        data['likes'] = thread.get_likes
        data['retweets'] =0
        
        if (profile):
            data['likeState'] = "true" if profile.like_set.filter(reply=thread) else "false"
            data["replyState"] = "true" if profile.user.reply_set.filter(reply=thread) else "false" 
            data["retweetState"] = "false"
            if profile == thread.creator.profile:
                data["you"] = True


        if thread.creator:
            data['creator'] = {
            'username': thread.creator.profile.get_username(),
            'name': f"{thread.creator.first_name} {thread.creator.last_name}",
            'profileLink': thread.creator.profile.get_absolute_url(),
            'profilePicture': thread.creator.profile.image.url,
        }
                
        if thread.message:
            data['message'] = {
                'content': thread.message.content,
                'media': thread.message.get_media_url() if thread.message.image else None
            }
    
        if thread.tweet and recursive_level<2:
            data['tweet'] = thread_serializer(thread.tweet, profile, recursive_level+1)
            data['absolute_url'] = thread.get_absolute_url()
        
        if data["type"] == "Reply":
            if thread.is_reply_o_reply() and recursive_level < 2:
                data["reply"] = thread_serializer(thread.reply, profile, recursive_level+1)
                data['absolute_url'] = thread.get_absolute_url()
    return data


def profile_serializer(profile, logged_profile=None):
    data =  {}
    data["id"] = profile.id
    data["username"] = profile.get_username()
    data["name"] = f"{profile.user.first_name} {profile.user.last_name}"
    data["profilePicture"] = profile.image.url
    data["bio"] = profile.bio
    data["profileLink"] = profile.get_absolute_url()
    if logged_profile:
        if profile in logged_profile.followers.all():
            data["follower"] = True
        if profile in logged_profile.following.all():
            data["following"] = True
    if logged_profile == profile:
        data["name"] = "You"
    return data


def like_serializer(like, logged_profile=None):
    # works for both Like and Media models 
    data = {}
    data["creator"] = {
        "username":  like.profile.get_username(),
        "profileLink": like.profile.get_absolute_url(),
        "profilePicture": like.profile.image.url
    }

    if like.tweet:
        data["thread"] = thread_serializer(like.tweet, logged_profile)
    elif like.reply:
        data["thread"] = thread_serializer(like.reply, logged_profile)
    
    if like.profile == logged_profile:
        data["you"] = True

    return data


def conversation_serializer(conversation, logged_profile):
    data = {}
    data['date'] = format_date(conversation.date)
    data['id'] = conversation.id
    data['link'] =  conversation.get_absolute_url()
    data["loggedProfile"] = profile_serializer(logged_profile, logged_profile=logged_profile)
    data['members'] = [profile_serializer(user.profile, logged_profile) for user in conversation.members.all().exclude(username=logged_profile.user.username)]
    msg = conversation.get_latest_message()
    if msg:
        data['latestMessage'] = dm_serializer(msg, logged_profile)
    return data


def invite_serializer(invite, logged_profile):
    data = {}
    data['creator'] = profile_serializer(invite.creator.profile, logged_profile)
    data['conversation'] = conversation_serializer(invite.conversation, logged_profile)
    data['date'] = invite.date
    data['id'] = invite.id
    return data



def dm_serializer(dm, logged_profile):
    data = {}
    data['message'] = {
        'content': dm.message.content,
        'image': dm.message.image.url if dm.message.image else None,
    }
    data['id'] = dm.id
    data['date'] = dm.date
    if dm.creator:
        data['creator'] = profile_serializer(dm.creator.profile, logged_profile)
    
    else:
        data['creator'] = {
            'name': dm.name,
            'username': dm.username,
            'profileLink': dm.profile_link,
        }
    return data

