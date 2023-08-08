from django.db import models
from django.contrib import admin


class TableNumberModel(models.Model):
    number = models.CharField(max_length=5, verbose_name="桌號", blank=False, null=False)
    is_send = models.BooleanField(verbose_name="是否已送出訂單", default=False)
    check_out = models.BooleanField(verbose_name="此桌是否已離場", default=False)
    create_at = models.DateTimeField(verbose_name="建立時間", auto_now_add=True)
    update_at = models.DateTimeField(verbose_name="資料更新時間", auto_now=True)

    class Meta:
        db_table = "Table_Number"

    def __str__(self):
        return f"{self.number}"


class TableNumberAdmin(admin.ModelAdmin):
    list_display = ("number", "check_out", "create_at", "update_at")
