from rest_framework import serializers
from .models import Restaurant, Table, MenuCategory, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_available']


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order', 'items']


class RestaurantMenuSerializer(serializers.ModelSerializer):
    """Mijoz QR skanerlaganda ko'radigan to'liq menyu"""
    categories = MenuCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'logo', 'categories']