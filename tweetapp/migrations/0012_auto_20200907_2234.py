# Generated by Django 3.0.8 on 2020-09-07 22:34

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0011_auto_20200907_2224'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 7, 22, 34, 25, 809788, tzinfo=utc)),
        ),
    ]