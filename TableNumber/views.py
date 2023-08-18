import base64
from django.shortcuts import render, get_object_or_404
from django.http import Http404
from django.db.models import QuerySet
from django.contrib.auth.models import User
from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import TableNumberModel


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(CustomTokenObtainPairSerializer, cls).get_token(user=user)
        return token

    def validate(self, attrs):
        try:
            ori_data = super().validate(attrs=attrs)
        except Exception as e:
            error_msg = str(e)
            if str(e) == "No active account found with the given credentials":
                error_msg = "帳號或密碼錯誤"
            raise serializers.ValidationError({'errors': error_msg})

        return {
            'status': True,
            'message': '登入成功',
            'token': ori_data
        }


class LoginWithToken(APIView):

    @staticmethod
    def is_token_expired(request):
        """
        token 是否已過期

        :param request:
        :return:
        """
        authorization = request.META.get('HTTP_AUTHORIZATION', None)
        token = authorization.split(' ')[1]
        if token is None:
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            AccessToken(token=token)
            return False    # token未過期
        except TokenError:
            return True     # token已過期

    def get(self, request):
        """
        判斷 token 是否過期

        :param request:
        :return: 已超時 -> status=True, 登入中 -> status=False
        """
        check_type = request.query_params.get('check')
        if check_type == 'token_exp':
            if self.is_token_expired(request=request):
                return Response(
                    data={'status': True, 'message': '已超時'}
                )
            return Response(
                data={'status': False, 'message': '可使用中'},
                status=status.HTTP_200_OK
            )
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        s_token = CustomTokenObtainPairSerializer(instance=User, data=request.data)
        if s_token.is_valid():
            return Response(data=s_token.validated_data, status=status.HTTP_200_OK)
        return Response(data={'status': False, 'message': list(s_token.errors.values())[0][0]})


class ReLoginWithToken(TokenRefreshView):

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            if e.args[0] == 'Token is invalid or expired':
                return Response(data={'status': False, 'message': e.args[0]})
            raise serializers.ValidationError(e.args[0])

        return Response(
            data={'status': True, 'token': serializer.validated_data},
            status=status.HTTP_200_OK
        )


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


class TableNumberUser(APIView):
    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsAuthenticated, ]

    def post(self, request):
        """
        添加 桌號

        :param request: { 'tbNumber': 桌號(str) }
        """
        tb_number = request.data.get('tbNumber')
        try:
            get_object_or_404(TableNumberModel, number=tb_number, is_send=False, check_out=False)
        except Http404:
            number_s = TableNumberSerializer(data={'tbNumber': tb_number, 'isSend': False, 'checkOut': False})
            if number_s.is_valid():
                tbn_obj = number_s.save()
                encode_params = base64.b64encode(
                    f'tbNumberID={tbn_obj.id}'.encode('UTF-8')
                ).decode('UTF-8')
                url = f'{request.scheme}://{request.get_host()}/'
                return Response(
                    data={'url': f'{url}?{encode_params}', 'tbNumber': tbn_obj.number},
                    status=status.HTTP_200_OK
                )
            else:
                print(f'invalid: {number_s.errors}')
                return Response(data=number_s.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data="table number in use", status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def delete(self, request):
        """
        刪除 指定的桌號資料

        :param request: { 'tbNumberID': 桌號ID(Int) }
        """
        get_object_or_404(TableNumberModel, id=request.data.get('tbNumberID')).delete()
        return Response(data='delete success', status=status.HTTP_204_NO_CONTENT)
