from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    TableMenuView, RestaurantRegisterView, MyRestaurantView,
    MenuCategoryViewSet, MenuItemViewSet, TableViewSet
)
router = DefaultRouter()
router.register('menu-categories', MenuCategoryViewSet, basename='menu-category')
router.register('menu-items', MenuItemViewSet, basename='menu-item')
router.register('tables', TableViewSet, basename='table')

urlpatterns = [
    path('table/<uuid:qr_token>/', TableMenuView.as_view(), name='table-menu'),
    path('auth/register/', RestaurantRegisterView.as_view(), name='restaurant-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MyRestaurantView.as_view(), name='my-restaurant'),
] + router.urls