from django.urls import path
from Menu import views as menu_view


urlpatterns = [
    path('pot_type/', menu_view.PotTypeView.as_view()),
    path('pot_meat/', menu_view.PotMeatView.as_view()),
    path('menu/', menu_view.MenuView.as_view()),
]
