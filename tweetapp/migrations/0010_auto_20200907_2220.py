# Generated by Django 3.0.8 on 2020-09-07 22:20

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0009_auto_20200907_2205'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 7, 22, 20, 43, 719979, tzinfo=utc)),
        ),
    ]