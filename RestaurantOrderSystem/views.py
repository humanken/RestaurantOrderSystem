from django.shortcuts import render


def menu_order_view(request):
    return render(request, 'menu_order.html')


def waiting_view(request, tb_number_id):
    return render(request, 'wait_meals.html')


def error_view(request):
    return render(request, 'error.html')


def login_view(request):
    return render(request, 'login.html')
