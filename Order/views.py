from collections import defaultdict
import requests
from django.http import Http404, JsonResponse
from django.db.models import QuerySet
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.shortcuts import get_object_or_404, render
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes, authentication_classes
from Menu.models import PotMeat
from Menu.views import MenuSerializer, MenuModel
from .models import TableNumberModel, OrderModel


@receiver(post_save, sender=TableNumberModel)  # Django 信號機制
def generate_token(sender, instance=None, created=False, **kwargs):
    """
    創建桌號時自動生成Token

    :param sender:
    :param instance:
    :param created:
    :param kwargs:
    :return:
    """
    if created:
        Token.objects.create(user=instance)


class TableNumberSerializer(serializers.ModelSerializer):
    tbNumber = serializers.CharField(source='number')
    isSend = serializers.BooleanField(source='is_send')
    checkOut = serializers.BooleanField(source='check_out')

    class Meta:
        model = TableNumberModel
        fields = ['id', 'tbNumber', 'isSend', 'checkOut']


class OrderSerializer(serializers.ModelSerializer):
    tbNumberID = serializers.PrimaryKeyRelatedField(queryset=TableNumberModel.objects.all(), source='table_number')
    menuID = serializers.PrimaryKeyRelatedField(queryset=MenuModel.objects.all(), source='detail')

    class Meta:
        model = OrderModel
        fields = ['tbNumberID', 'menuID', 'quantity']

    def create(self, validated_data):
        tb_number_obj = validated_data.pop('table_number')
        menu_obj = validated_data.pop('detail')
        return OrderModel.objects.create(table_number=tb_number_obj, detail=menu_obj, **validated_data)

    def to_representation(self, instance):
        data = defaultdict(dict)
        if isinstance(instance, OrderModel):
            data = {
                instance.table_number.number: {
                    'meals': {'detail': MenuSerializer(instance=instance.detail).data, 'quantity': instance.quantity},
                    'checkOut': instance.table_number.check_out
                }
            }
            return data

        for order in instance:
            number = order.table_number.number
            check_out = order.table_number.check_out
            meal = {'detail': MenuSerializer(instance=order.detail).data, 'quantity': order.quantity}
            data[number]['meals'] = data[number].get('meals', []) + [meal]
            data[number]['checkOut'] = check_out
        return data


class Order(APIView):

    def get(self, request):
        """
        根據桌號 取得目前點餐資料
        :param request: { tbNumberID: 桌號ID(Int) }
        """
        if request.query_params:
            order = OrderModel.objects.filter(table_number=request.query_params.get('tbNumberID')).all()
        else:
            order = OrderModel.objects.all()

        if order:
            s = OrderSerializer(instance=order)
            return Response(data=s.data, status=status.HTTP_200_OK)
        else:
            tb_number = TableNumberModel.objects.get(
                number=request.query_params.get('tbNumberID'),
                check_out=False
            )
            data = {
                f'{tb_number.number}': {'meals': [], 'checkOut': tb_number.check_out}
            }
            return JsonResponse(data=data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        添加 點餐資料

        :param request: { 'tbNumberID': 桌號ID(Int), 'menuID': 餐點ID(Int), 'quantity': 餐點數量(Int) }
        """

        """ 取得點餐obj，若沒有 -> 創建新資料； 若有 -> 報錯，請使用Put或Patch或Delete方法 """
        try:
            get_object_or_404(OrderModel, table_number=request.data.get('tbNumberID'), detail=request.data.get('menuID'))
        except Http404:
            order_s = OrderSerializer(data=request.data)
            if order_s.is_valid():
                order_s.save()
                return Response(
                    data=order_s.data,
                    status=status.HTTP_200_OK
                )
            else:
                print(f'invalid: {order_s.errors}')
                return Response(data=order_s.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data="order item is existed", status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def put(self, request):
        """
        更新 點餐資料

        :param request: { 'tbNumberID': 桌號ID(Int), 'menuID': 餐點ID(Int), 'quantity': 餐點數量(Int) }
        """
        """ 取得點餐obj，若沒有 -> 報錯； 若有 -> 更新資料 """
        order = get_object_or_404(OrderModel, table_number=request.data.get('tbNumberID'), detail=request.data.get('menuID'))
        # partial=False -> 需要完整參數進行驗證
        order_s = OrderSerializer(data=request.data, instance=order, partial=False)
        if order_s.is_valid():
            order_s.save()
            return Response(data=order_s.data, status=status.HTTP_200_OK)
        return Response(data="order item put invalid", status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        刪除 指定的點餐資料

        :param request: { 'tbNumberID': 桌號ID(Int), 'menuID': 餐點ID(Int) }
        """

        """ 取得點餐obj，若沒有 -> 報錯； 若有 -> 刪除資料 """
        order_obj = get_object_or_404(
            OrderModel,
            table_number=request.data.get('tbNumberID'),
            detail=request.data.get('menuID')
        )
        # order_obj = get_object_or_404(OrderModel, table_number=tb_number_obj, detail=menu_obj)
        # 刪除
        order_obj.delete()
        return Response(data=OrderSerializer(instance=order_obj).data, status=status.HTTP_204_NO_CONTENT)


class TableNumber(APIView):

    def get(self, request):
        """
        取得 桌號
        :param request: { 'tbNumber' or 'tbNumberID': 桌號(str)/桌號ID(Int), 'isSend': 是否送出訂單(Bool), 'checkOut': 是否結算離場(Bool) }
        """
        tb_number = request.query_params.get('tbNumber')
        tb_number_id = request.query_params.get('tbNumberID')
        if tb_number:
            number = TableNumberModel.objects.filter(number=tb_number)
            is_send = request.query_params.get('isSend')
            if is_send is not None:
                number = number.filter(is_send=False if is_send == "false" else True)
            check_out = request.query_params.get('checkOut')
            if check_out is not None:
                number = number.filter(check_out=False if check_out == "false" else True)
            number = number.all()
        else:
            if tb_number_id:
                number = get_object_or_404(TableNumberModel, id=tb_number_id)
            else:
                number = TableNumberModel.objects.all()
        if number is not None:
            s = TableNumberSerializer(instance=number, many=True if isinstance(number, QuerySet) else False)
            return Response(data=s.data, status=status.HTTP_200_OK)
        return render(request, 'error.html')

    def post(self, request):
        """
        添加 桌號

        :param request: { 'tbNumber': 桌號(str), 'isSend': 是否送出訂單(Bool), 'checkOut': 是否離場(Bool) }
        """
        try:
            get_object_or_404(TableNumberModel, number=request.data.get('tbNumber'), is_send=False, check_out=False)
        except Http404:
            number_s = TableNumberSerializer(data=request.data)
            if number_s.is_valid():
                number_s.save()
                return Response(
                    data=number_s.data,
                    status=status.HTTP_200_OK
                )
            else:
                print(f'invalid: {number_s.errors}')
                return Response(data=number_s.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data="table number in use", status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def patch(self, request):
        """
        部分更新 桌號 訂單是否送出/離場狀態

        :param request: { 'tbNumberID': 桌號ID(Int), 'isSend': 是否送出訂單(Bool), 'checkOut': 是否離場(Bool) }
        """
        """ 取得點餐obj，若沒有 -> 報錯； 若有 -> 更新部分資料 """
        tb_number = get_object_or_404(TableNumberModel, id=request.data.pop('tbNumberID'))

        # partial=True -> 部分參數進行驗證
        number_s = TableNumberSerializer(data=request.data, instance=tb_number, partial=True)
        if number_s.is_valid():
            number_s.save()
            return Response(data=number_s.data, status=status.HTTP_200_OK)
        return Response(data="table number patch invalid", status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        刪除 指定的桌號資料

        :param request: { 'tbNumberID': 桌號ID(Int) }
        """
        get_object_or_404(TableNumberModel, id=request.data.get('tbNumberID')).delete()
        return Response(data='delete success', status=status.HTTP_204_NO_CONTENT)


class Send(APIView):

    def get(self, request):
        return Response(status=status.HTTP_200_OK)

    def post(self, request):
        """
        發送 訂單訊息

        :param request: { 'tbNumberID': 桌號(Int), 'checkOut': 是否離場(Bool) }
        """
        line_url = "https://maker.ifttt.com/trigger/SHABU/with/key/c_vY5C1k3xa2bISR8DLigH"
        pot_meat = {meat.value[0]: meat.value[1] for meat in PotMeat}
        tb_number_id = request.data.get('tbNumberID')
        order = OrderModel.objects.filter(table_number_id=tb_number_id, table_number__check_out=False).all()
        params = {
            'eventName': 'SHABU 點餐系統',
            'value1': f'桌號 : {order[0].table_number.number}',
            'value2': '\n'.join([
                '{0}.\t{1} - (肉: {2})\tx{3}'.format(
                    i, meat.detail.name, pot_meat[meat.detail.meat], meat.quantity
                ) for i, meat in enumerate(order, 1)
            ]),
            'value3':
                f'總數量 :\t{request.data.get("grandTotalQuantity")}\n總金額 :\t$ {request.data.get("grandTotalPrice")}',
            'OccurredAt': ''
        }
        response = requests.get(line_url, params=params)
        return Response(data=params, status=status.HTTP_200_OK)

