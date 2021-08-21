# Generated by Django 3.0.9 on 2020-10-04 07:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tweetapp', '0046_auto_20201004_0758'),
        ('userapp', '0026_auto_20201003_2120'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='media',
            name='message',
        ),
        migrations.AddField(
            model_name='media',
            name='reply',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='tweetapp.Reply'),
        ),
        migrations.AddField(
            model_name='media',
            name='tweet',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='tweetapp.Tweet'),
        ),
    ]