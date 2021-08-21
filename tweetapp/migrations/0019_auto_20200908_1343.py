# Generated by Django 3.0.8 on 2020-09-08 13:43

import datetime
from django.db import migrations, models
import django.db.models.deletion
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0018_auto_20200908_1340'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 8, 13, 43, 1, 804663, tzinfo=utc)),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='message',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='tweetapp.Message'),
        ),
    ]