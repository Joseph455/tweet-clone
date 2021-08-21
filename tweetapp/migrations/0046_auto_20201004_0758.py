# Generated by Django 3.0.9 on 2020-10-04 07:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tweetapp', '0045_conversation_directmessage'),
    ]

    operations = [
        migrations.RenameField(
            model_name='conversation',
            old_name='parties',
            new_name='members',
        ),
        migrations.CreateModel(
            name='ConversationInvite',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accepted', models.BooleanField(default=False)),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('conversation', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='tweetapp.Conversation')),
                ('creator', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('recipent', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invitation_set', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]