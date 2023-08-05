from django.contrib import admin
from .models import MenuModel, MenuAdmin


# Register your models here.
admin.site.register(MenuModel, MenuAdmin)
