from django.urls import path
from Menu import views as menu_view


urlpatterns = [
    path('pot_type/', menu_view.PotTypeAPI.as_view()),
    path('pot_meat/', menu_view.PotMeatAPI.as_view()),
    path('menu/', menu_view.Menu.as_view()),
]
