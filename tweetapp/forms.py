from django import forms
from tweetapp.models import Tweet, Reply, Message


class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ["content", "image"]

        error_messages =  {
            'name': {
                "max_length": "text too long ",
            }
        }

