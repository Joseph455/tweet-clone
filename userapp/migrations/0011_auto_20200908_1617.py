# Generated by Django 3.0.8 on 2020-09-08 16:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('userapp', '0010_auto_20200908_1604'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='notifier',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='userapp.Notifier'),
        ),
    ]