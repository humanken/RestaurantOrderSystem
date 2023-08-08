from django.urls import path
from .views import TableNumber, Login


# api/ +
urlpatterns = [
    path('login/', Login.as_view()),
    path('tableNumbers/', TableNumber.as_view()),
]