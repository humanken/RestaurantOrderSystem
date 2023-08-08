from django.contrib import admin
from .models import TableNumberModel, TableNumberAdmin


admin.site.register(TableNumberModel, TableNumberAdmin)
