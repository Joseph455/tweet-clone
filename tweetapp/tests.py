from django.test import TestCase
from tweetapp.models import Tweet, Reply
from django.utils import timezone
# Create your tests here.


class BaseModelTest(TestCase):
    
    ###  This tests work for all Models derived from  tweetapp.models.Base 
    
    def test_creation_date_with_furture_date(self):
        future_time = timezone.now() + timezone.timedelta(days=10)
        model = Tweet.objects.create(date=future_time)
        model.save()
        self.assertGreaterEqual(timezone.now(), model.date)
    
    def test_format_date_with_sameday_minute_difference(self):
        if timezone.now().minute < 3:
            self.skipTest("Can't run test within the ist 2 minutes of the hour")
        date = timezone.now() - timezone.timedelta(minutes=2)
        model = Reply.objects.create(date=date)
        model.save()
        self.assertEqual(model.format_date(), "2m")
    
    def test_format_date_with_sameday_hour_difference(self):
        if timezone.now().hour < 3:
            self.skipTest("cant run test within the ist 2 hours of a day")
        date = timezone.now() - timezone.timedelta(hours=2)
        model = Tweet.objects.create(date=date)
        model.save()
        self.assertEqual(model.format_date(), "2hr")
    
    def test_format_date_with_same_month_day_diffrence(self):
        now = timezone.now()
        if (now.day<3):
            self.skipTest("Can't run test on the first 2 days of the month")
        model = Reply.objects.create(date=now - timezone.timedelta(days=2))
        model.save()
        months = {
            1:"Jan", 2:"Feb", 3:"Mar", 4:"Aprl",
            5:"May", 6:"Jun", 7:"Jul", 8:"Aug",
            9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"
        }
        self.assertEqual(model.format_date(),  f"{months[model.date.month]}. {model.date.day}")
    