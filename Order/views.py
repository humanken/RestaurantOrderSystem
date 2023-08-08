import requests
from collections import defaultdict
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes, authentication_classes
from Menu.models import PotMeat
from Menu.views import MenuSerializer, MenuModel
from .models import TableNumberModel, OrderModel


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

