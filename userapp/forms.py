from django import forms
from django.contrib.auth.models import User
from userapp.models import Profile

class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]


class LoginForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email", "password"]


class ForgotPasswordForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email"]


class ProfileUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name"]

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["image", "cover", "bio", "location", "website", "date_of_birth"]
