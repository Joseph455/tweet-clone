# Generated by Django 3.0.8 on 2020-09-08 13:28

import datetime
from django.db import migrations, models
import django.db.models.deletion
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0013_auto_20200908_1318'),
    ]

    operations = [
        migrations.AddField(
            model_name='tweet',
            name='retweet',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='tweetapp.Tweet'),
        ),
        migrations.AlterField(
            model_name='message',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2020, 9, 8, 13, 28, 32, 779569, tzinfo=utc)),
        ),
        migrations.DeleteModel(
            name='Retweet',
        ),
    ]
