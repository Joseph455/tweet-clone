from django.db import models
from django.utils import timezone
from django.shortcuts import reverse
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
import re
# Create your models here.



class Message(models.Model):
    content = models.CharField(max_length=400, null=True)
    image = models.ImageField(upload_to="tweetapp/messages/%Y%M/", null=True, blank=True)
    safe = models.BooleanField(default=True, blank=True)

    def __str__(self):
        return str(self.content)
    
    def get_media_url(self):
        return f"http://{Site.objects.get_current()}/media/{self.image}"
    

class Base(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    message = models.OneToOneField(Message, on_delete=models.CASCADE, null=True, blank=True)
    tweet = models.ForeignKey('Tweet', related_name="%(class)s_set", on_delete=models.CASCADE, blank=True, null=True)
    likes = models.IntegerField(default=0)
    replies = models.IntegerField(default=0)
    date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        abstract = True
    

    def save(self, *args, **kwargs):
        self.likes = self.get_likes
        self.replies = self.get_replies

        if self.date > timezone.now():
            self.date = timezone.now()
        super(Base, self).save(*args, **kwargs)
    
    @property
    def get_likes(self):
        return self.like_set.count()
        
    
    @property
    def get_replies(self):
        return self.reply_set.count()




class Tweet(Base):
    retweets = models.IntegerField(default=0)    
    
    @property
    def get_retweets(self):
        return self.tweet_set.count()
   
    @property
    def is_tweet(self):
        return True
        
    @property
    def is_retweet(self):
        # return boolean value if tweet is a retweet
        return True if self.tweet else False
    
    
    def save(self, *args, **kwargs):
        self.retweets =  self.get_retweets
        super(Tweet, self).save(*args, **kwargs)


    def get_absolute_url(self):
        return reverse("tweetapp:view-tweet", kwargs={
        "tweet_id": self.pk, 
        "creator_username": self.creator.username
        })
    

class Reply(Base):
    # reply is added to enable replying a reply
    reply = models.ForeignKey('self', related_name="replies_set", on_delete=models.CASCADE, blank=True, null=True)
    
    @property
    def is_reply(self):
        return True
    
    @property
    def get_replies(self):
        return self.replies_set.count()

    def is_reply_o_reply(self):
        return True if self.reply else False
    
    def get_absolute_url(self):
        return reverse("tweetapp:view-reply", kwargs={
        "reply_id": self.pk,
        "creator_username": self.creator.username
        })

    def save(self, *args, **kwargs):
        if (self.reply and self.tweet) != None:
            raise BaseException(f"{self.__class__.__name__} Can't have both reply and tweet fields ")
        super(Reply, self).save(*args, **kwargs)


class Conversation(models.Model):
    title = models.CharField(max_length=50, null=True, blank=True)
    members = models.ManyToManyField(User)
    date = models.DateTimeField(default=timezone.now)

    def get_latest_message(self):
        if self.directmessage_set.count() > 0:
            return self.directmessage_set.all().order_by("-date")[0]
    
    def get_absolute_url(self):
        return reverse("tweetapp:conversation", kwargs={"id": self.id})
    
        

class ConversationInvite(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    recipient = models.ForeignKey(User,related_name="invitation_set", on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)


class DirectMessage(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    message = models.OneToOneField(Message, on_delete=models.CASCADE)
    conversation =  models.ForeignKey(Conversation, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=200, null=True)
    username = models.CharField(max_length=200, null=True)
    profile_link = models.URLField(null=True)
    date =  models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if self.creator:
            self.name = f"{self.creator.first_name} {self.creator.last_name}"
            self.username = self.creator.profile.get_username()
            self.profile_link = self.creator.profile.get_absolute_url()
        super(DirectMessage, self).save(*args, **kwargs)
