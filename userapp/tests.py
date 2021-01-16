from django.test import TestCase
from userapp.models import Like, Mention, Profile, Notification, Notifier
from django.utils import timezone
from django.contrib.auth.models import User
# Create your tests here.

class BaseModelsTest(TestCase):
    
    ### These tests cover all models derived from userapp.modesl.Base -{Like, Mention}

    def test_creation_date_with_furture_date(self):
        future_time = timezone.now() + timezone.timedelta(days=10)
        model = Like.objects.create(date=future_time)
        model.save()
        self.assertGreaterEqual(timezone.now(), model.date)
    

class ProfileModelTest(TestCase):

    def test_get_related_threads_by_date_ordering(self):
        profile =  Profile.objects.create()
        following = (Profile.objects.create(),
                      Profile.objects.create(),
                      Profile.objects.create())
        threads = []
        us_n =  "a"
        for prof in following:
            prof.user = User.objects.create(username=us_n)
            us_n = us_n+"a"
            twt = prof.user.tweet_set.create()
            rly = prof.user.reply_set.create()
            mnt = prof.mention_set.create()
            lke = prof.like_set.create()
            threads += [twt, rly, mnt, lke]
            prof.save()
            profile.following.add(prof)
            profile.save()
        threads.reverse()
        self.assertEqual(len(threads), len(profile.get_related_threads()))
        self.assertEqual(threads, profile.get_related_threads())
        
