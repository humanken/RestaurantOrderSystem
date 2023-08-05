from django.db import models
from django.contrib import admin
from enum import Enum


class PotType(Enum):
    Classic = ("CLA", "經典涮肉火鍋")
    Premium = ("PRE", "特級涮肉火鍋")
    Flavor = ("FLA", "風味涮肉火鍋")
    Vegetarian = ("VEG", "風味素食火鍋")
    Land_And_Sea = ("LAS", "海陸雙饗火鍋")
    Sea_Food = ("SF", "原味海鮮火鍋")
    Side_Dish = ("SD", "附餐")
    Single = ("SG", "單點")


class PotMeat(Enum):
    General = ("GEN", "一般")
    Half = ("H", "+ 50 %")
    Double = ("D", "+ 100 %")
    Pork = ("P", "豬肉")
    Beef = ("B", "牛肉")
    Chicken = ("CHI", "雞肉")
    NoChose = ("NO", "不用選擇")


def food_img_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/food/<type>/<name>.png
    return 'food/{0}/{1}.png'.format(instance.type, instance.name)


# Create your models here.
class MenuModel(models.Model):
    type = models.CharField(
        choices=[tp.value for tp in PotType],
        max_length=8, verbose_name="火鍋種類",
        blank=False, null=False
    )
    meat = models.CharField(
        choices=[mt.value for mt in PotMeat],
        max_length=8, verbose_name="肉量選擇",
        blank=False, null=False
    )
    name = models.CharField(
        max_length=8,
        verbose_name="餐點名稱",
        db_index=True,
        blank=False, null=False
    )
    price = models.PositiveSmallIntegerField(verbose_name="餐點價格", blank=False, null=False)
    is_sold_out = models.BooleanField(verbose_name="餐點是否售完", default=False)
    image = models.ImageField(verbose_name="餐點圖片路徑", upload_to=food_img_path, blank=True, null=True)

    class Meta:
        db_table = "Menu"

    def __str__(self):
        if self.image:
            image_path = self.image
        else:
            image_path = None
        return "MenuModel(type={0}, meat={1}, name={2}, price={3}, is_sold_out={4}, image_path={5})".format(
            self.type, self.meat, self.name, self.price, self.is_sold_out, image_path
        )


class MenuAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "meat", "name", "price", "is_sold_out", "image")

