from django.db import models
from django.contrib import admin
from TableNumber.models import TableNumberModel
from Menu.models import MenuModel


# Create your models here.
class OrderModel(models.Model):
    table_number = models.ForeignKey(TableNumberModel, on_delete=models.CASCADE, related_name='tb_number')
    detail = models.ForeignKey(MenuModel, verbose_name="餐點內容", on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField(verbose_name="餐點數量", blank=False, null=False)
    create_at = models.DateTimeField(verbose_name="建立時間", auto_now_add=True)
    update_at = models.DateTimeField(verbose_name="資料更新時間", auto_now=True)

    class Meta:
        db_table = "Order"

    def __str__(self):
        return f"{self.detail}, {self.quantity}"


class OrderAdmin(admin.ModelAdmin):
    list_display = ("table_number", "detail", "quantity", "create_at", "update_at")

