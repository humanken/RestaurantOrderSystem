from django.urls import path
from .views import TableNumber, TableNumberUser, LoginWithToken, ReLoginWithToken


# api/ +
urlpatterns = [
    path('login/', LoginWithToken.as_view()),
    path('reLogin/', ReLoginWithToken.as_view()),
    path('tableNumbers/', TableNumber.as_view()),
    path('tableNumbersUser/', TableNumberUser.as_view()),
]