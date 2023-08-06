from django.urls import path
from Order import views as order_view


urlpatterns = [
    path('order/', order_view.Order.as_view()),
    path('tableNumbers/', order_view.TableNumber.as_view()),
    path('send/', order_view.Send.as_view()),
]
