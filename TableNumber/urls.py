from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)
from .views import TableNumber, Login


# api/ +
urlpatterns = [
    path('token/', Login.as_view()),
    path('tableNumbers/', TableNumber.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
]