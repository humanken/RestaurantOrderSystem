from django.urls import path
from .views import Order, Send


# api/ +
urlpatterns = [
    path('order/', Order.as_view()),
    path('send/', Send.as_view()),
]
