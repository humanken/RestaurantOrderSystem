from django.shortcuts import render, get_object_or_404
from django.http import Http404
from django.db.models import QuerySet
from django.contrib.auth.models import AnonymousUser, User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .forms import LoginForm
from .models import TableNumberModel


class Login(APIView):

    def get(self, request):
        resp = {'status': 0, 'message': ''}
        check_type = request.query_params.get('check')
        if check_type == 'login':
            resp['isLogin'] = False
            if isinstance(request.user, User):
                resp['isLogin'] = True
            return Response(data=resp, status=status.HTTP_200_OK)
        return Response(data=resp, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        print(f'post: {request.data}')
        resp = {'status': 0, 'message': ''}
        form = LoginForm(request.data)
        if form.is_valid():
            user = authenticate(request, username=request.data.get('username'), password=request.data.get('password'))
            if user:
                print(f'user: {user}')
                resp['status'] = 1
                return Response(data=resp, status=status.HTTP_200_OK)
            else:
                resp['message'] = '登入失敗'
                return Response(data=resp)
        resp['message'] = '帳號密碼格式錯誤'
        return Response(data=resp)


# @receiver(post_save, sender=)  # Django 信號機制
# def generate_token(sender, instance=None, created=False, **kwargs):
#     """
#     創建桌號時自動生成Token
#
#     :param sender:
#     :param instance:
#     :param created:
#     :param kwargs:
#     :return:
#     """
#     if created:
#         Token.objects.create(user=instance)


class TableNumberSerializer(serializers.ModelSerializer):
    tbNumber = serializers.CharField(source='number')
    isSend = serializers.BooleanField(source='is_send')
    checkOut = serializers.BooleanField(source='check_out')

    class Meta:
        model = TableNumberModel
        fields = ['id', 'tbNumber', 'isSend', 'checkOut']


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
