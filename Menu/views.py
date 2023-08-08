from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PotType, PotMeat, MenuModel


# Create your views here.
def menu_order_view(request):
    return render(request, 'menu_order.html')


def waiting_view(request, tb_number_id):
    return render(request, 'wait_meals.html')


def error_view(request):
    return render(request, 'error.html')


class MenuSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = MenuModel
        fields = '__all__'


class Menu(APIView):

    def get(self, request):
        menu_db = MenuModel.objects.all()
        tp = request.query_params.get('type')
        meat = request.query_params.get('meat')
        name = request.query_params.get('name')
        is_sold_out = request.query_params.get('isSoldOut')
        if tp is not None:
            menu_db = menu_db.filter(type=tp)
        if meat is not None:
            menu_db = menu_db.filter(meat=meat)
        if name is not None:
            menu_db = menu_db.filter(name=name)
        if is_sold_out is not None:
            menu_db = menu_db.filter(is_sold_out=is_sold_out)
        s = MenuSerializer(instance=menu_db, many=True)
        return Response(data=s.data, status=status.HTTP_200_OK)


class PotTypeAPI(APIView):
    def get(self, request):
        pot_type = {tp.value[0]: tp.value[1] for tp in PotType}
        return Response(data=pot_type, status=status.HTTP_200_OK)


class PotMeatAPI(APIView):
    def get(self, request):
        pot_meat = {meat.value[0]: meat.value[1] for meat in PotMeat}
        return Response(data=pot_meat, status=status.HTTP_200_OK)
