from django.urls import path
from .views import OrderCreateView, RangeStatsView, DailyStatsView, OrderDetailView, RestaurantOrdersView, OrderStatusUpdateView

urlpatterns = [
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
    path('restaurant/<int:restaurant_id>/orders/', RestaurantOrdersView.as_view(), name='restaurant-orders'),
    path('restaurant/<int:restaurant_id>/stats/daily/', DailyStatsView.as_view(), name='daily-stats'),
    path('restaurant/<int:restaurant_id>/stats/range/', RangeStatsView.as_view(), name='range-stats'),
]