# Generated by Django 3.0.8 on 2020-09-08 17:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userapp', '0011_auto_20200908_1617'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='bio',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='date_of_birth',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='location',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='website',
            field=models.URLField(null=True),
        ),
    ]