from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.db import models
from django.shortcuts import reverse
from django.template.defaultfilters import slugify
from django.utils import timezone

from tweetapp.models import Reply, Tweet

# Create your models here.


class Media(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, null=True, blank=True)
    link = models.URLField(null=True, blank=True)
    views = models.IntegerField(default=0)
    tweet = models.OneToOneField(Tweet, on_delete=models.CASCADE, null=True)
    reply = models.OneToOneField(Reply, on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(default=timezone.now)



class Base(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, null=True, blank=True)
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, null=True, blank=True)
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)
    
    class Meta:
        abstract = True
    
    def get_absolute_url(self):
        if self.tweet:
            url = self.tweet.get_absolute_url()
        elif self.reply:
            url = self.reply.get_absolute_url()
        return url
    
    def save(self, *args, **kwargs):
            if self.date > timezone.now():
                self.date = timezone.now()
            if self.reply and self.tweet:
                raise BaseException(f"{self.__class__.__name__} Can't have both reply and tweet fields")
            super(Base, self).save(*args, **kwargs)


class Like(Base):
    pass


class Mention(Base):
    pass



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    following = models.ManyToManyField('Profile', related_name="followers", blank=True)
    notifier = models.OneToOneField('Notifier', on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to="userapp/profile-pictures/", default="userapp/profile-pictures/default.png", null=True, blank=True)
    cover = models.ImageField(upload_to="userapp/profile-covers/", default="userapp/profile-covers/default.png", null=True, blank=True)
    bio = models.CharField(max_length=200, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_thrend = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username

    def get_username(self):
        if self.is_thrend:
            return f"#{self.user.username}"
        else:
            return f"@{self.user.username}"
    
    def get_username_slug(self):
        return slugify(self.user.username)
        
    def get_related_threads(self):
        def sort_threads_by_date(threads):
            t = list(threads)
            for thread in t:
                swaps  = 0
                for j in range(len(t)-1):
                    if t[j].date < t[j+1].date:
                        t[j], t[j+1] = t[j+1], t[j]
                        swaps+=1
                if swaps == 0:
                    break
            return t
        # threads = list(self.user.tweet_set.all())
        threads =  []
        for profile in self.following.all():
            threads += profile.get_threads()
        return sort_threads_by_date(threads)

            
    def get_threads(self):
        # returns threads created/retweated by profile
        threads = []
        threads += list(self.user.tweet_set.all())
        threads += list(self.user.reply_set.all())
        # threads += list(self.mention_set.all())
        # threads += list(self.like_set.all())
        return threads
        
    def get_liked_threads(self):
        # return threads that profile liked
        threads = []
        for like in self.like_set.all().order_by('-date'):
            if like.tweet:
                threads.append(like.tweet)
            elif like.reply:
                threads.append(like.reply)
        return threads
    
    def get_absolute_url(self):
        url = reverse("userapp:profile", kwargs={"profile_id": self.pk, 'username': self.user.username})
        full_url = ""
        protocols = ["http://", "https://"]
        
        for p in protocols:
            if p in Site.objects.get_current():
                return f"{Site.objects.get_current()}{url}"

        return f"http://{Site.objects.get_current()}{url}"
    
    def save(self, *args, **kwargs):
        if not self.image:
            self.image = "userapp/profile-pictures/default.png"
        if not self.cover:
            self.cover = "userapp/profile-covers/default.png"
        super(Profile, self).save(*args, **kwargs)


class Notifier(models.Model):
    notifications = models.ManyToManyField('Notification', blank=True)



class Notification(models.Model):
    # The user who performed the action to be  notied
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    content = models.CharField(max_length=200, null=True, blank=True)
    reply = models.OneToOneField(Reply, on_delete=models.CASCADE, null=True)
    like = models.OneToOneField(Like, on_delete=models.CASCADE, null=True)
    follow = models.OneToOneField(Profile, related_name='followed_notification',on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(default=timezone.now)
    
    
    def broadcast(self, vip_recipient=None):
        # once an action is performed you push a notification to all followers
        if (vip_recipient):
            vip_recipient.notifier.notifications.add(self)
        for profile in self.profile.followers.all():
            if not profile.notifier:
                # create a notifier for follower if non exist 
                profile.notifier = Notifier.objects.create()
                profile.save()
            profile.notifier.notifications.add(self)
    

    def get_reference(self):
        reason = None
        if (self.content):
            reason = self.content
        elif self.reply:
            reason = ["reply", self.reply]
        elif self.like:
            reason = ['like', self.like]
        elif self.follow:
            reason = ["follow",  self.follow]
        return reason
