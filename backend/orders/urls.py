from django.urls import path
from .views import OrderCreateView, OrderDetailView, RestaurantOrdersView

urlpatterns = [
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('restaurant/<int:restaurant_id>/orders/', RestaurantOrdersView.as_view(), name='restaurant-orders'),
]