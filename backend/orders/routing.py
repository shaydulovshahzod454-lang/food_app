from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/restaurant/(?P<restaurant_id>\d+)/$', consumers.RestaurantOrderConsumer.as_asgi()),
]