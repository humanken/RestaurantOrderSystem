"""
WSGI config for RestaurantOrderSystem project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""
import sys
from pathlib import Path
sys.path.append(Path(__file__).resolve().parent.parent.__str__())
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RestaurantOrderSystem.settings')

application = get_wsgi_application()
