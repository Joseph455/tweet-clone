# Generated by Django 3.0.8 on 2020-09-06 15:20

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0002_auto_20200905_1845'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 6, 15, 20, 8, 945639, tzinfo=utc)),
        ),
    ]