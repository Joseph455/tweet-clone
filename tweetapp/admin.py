from django.contrib import admin
from tweetapp.models import *
# Register your models here.

admin.site.register(Message)
admin.site.register(Tweet)
admin.site.register(Reply)
admin.site.register(Conversation)
admin.site.register(ConversationInvite)

