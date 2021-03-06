# Generated by Django 3.0.8 on 2020-09-08 13:49

import datetime
from django.db import migrations, models
import django.db.models.deletion
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0019_auto_20200908_1343'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 8, 13, 49, 40, 274880, tzinfo=utc)),
        ),
        migrations.AlterField(
            model_name='reply',
            name='replies',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replies_set', to='tweetapp.Reply'),
        ),
    ]
