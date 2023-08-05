from django.urls import path
from Order import views as order_view


urlpatterns = [
    path('order/', order_view.OrderView.as_view()),
    path('tableNumbers/', order_view.TableNumberView.as_view()),
    path('send/', order_view.SendView.as_view()),
]
