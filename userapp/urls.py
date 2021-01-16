from django.urls import path
from userapp import views 

app_name = 'userapp'


urlpatterns = [
    path("account/", views.home, name="home"),
    path("account/login/", views.login_view, name="login"),
    path("account/logout/", views.logout_view, name="logout"),
    path("account/registration/", views.registration_view, name="register"),
    path("account/forgot-password/", views.forgot_password, name="forgot-password"),
    path("account/profile/edit/", views.edit_profile, name="edit-profile"),
    path("account/profile/<username>/<int:profile_id>/", views.view_profile, name="profile"),
    path("account/profile/<username>/<int:profile_id>/follow/", views.follow_profile, name="follow-profile"),
    path("account/profile/<username>/<int:profile_id>/t-<int:loadState>/", views.get_tweets, name="get-tweets"),
    path("account/profile/<username>/<int:profile_id>/r-<int:loadState>/", views.get_replies, name="get-replies"),
    path("account/profile/<username>/<int:profile_id>/l-<int:loadState>/", views.get_likes, name="get-likes"),
    path("account/profile/<username>/<int:profile_id>/m-<int:loadState>/", views.get_medias, name="get-medias"),
    path("account/profile/<username>/<int:profile_id>/F-<int:loadState>/", views.get_followers, name="get-followers"),
    path("account/profile/<username>/<int:profile_id>/f-<int:loadState>/", views.get_following, name="get-following"),
]