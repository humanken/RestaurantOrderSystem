"""
URL configuration for RestaurantOrderSystem project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from Menu import views as menu_view
from TableNumber import views as tb_view


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', menu_view.menu_order_view),
    path('waiting/<int:tb_number_id>', menu_view.waiting_view),
    path('error/', menu_view.error_view),
    path('login/', tb_view.login_view),
    path('api/', include('TableNumber.urls')),
    path('api/', include('Menu.urls')),
    path('api/', include('Order.urls')),
    path('api/docs/', include_docs_urls(title="SHABU API文檔", description="錢源火鍋 REST framework")),
]
