# Generated by Django 3.0.8 on 2020-09-07 21:35

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0006_auto_20200907_2123'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 7, 21, 35, 44, 267574, tzinfo=utc)),
        ),
    ]
