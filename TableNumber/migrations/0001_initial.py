# Generated by Django 4.2.3 on 2023-08-08 18:41

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TableNumberModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=5, verbose_name='桌號')),
                ('is_send', models.BooleanField(default=False, verbose_name='是否已送出訂單')),
                ('check_out', models.BooleanField(default=False, verbose_name='此桌是否已離場')),
                ('create_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('update_at', models.DateTimeField(auto_now=True, verbose_name='資料更新時間')),
            ],
            options={
                'db_table': 'Table_Number',
            },
        ),
    ]
