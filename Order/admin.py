from django.contrib import admin
from .models import OrderModel, OrderAdmin


admin.site.register(OrderModel, OrderAdmin)
