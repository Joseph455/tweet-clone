# Generated by Django 3.0.8 on 2020-09-07 21:23

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0005_auto_20200907_2120'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 7, 21, 23, 27, 443239, tzinfo=utc)),
        ),
    ]
