# Generated by Django 3.0.8 on 2020-09-07 22:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('userapp', '0005_auto_20200907_2205'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notifier',
            name='profile',
        ),
        migrations.AddField(
            model_name='notifier',
            name='content',
            field=models.CharField(max_length=40, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='notifier',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='userapp.Notifier'),
        ),
    ]
