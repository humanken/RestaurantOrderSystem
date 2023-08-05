from django.contrib import admin
from .models import TableNumberModel, OrderModel, TableNumberAdmin, OrderAdmin


# Register your models here.
admin.site.register(TableNumberModel, TableNumberAdmin)
admin.site.register(OrderModel, OrderAdmin)
