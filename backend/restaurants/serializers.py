from rest_framework import serializers
from .models import Restaurant, Table, MenuCategory, MenuItem
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


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

class RestaurantRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    restaurant_name = serializers.CharField()
    slug = serializers.SlugField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu username band")
        return value

    def validate_slug(self, value):
        if Restaurant.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Bu slug band")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        restaurant = Restaurant.objects.create(
            owner=user,
            name=validated_data['restaurant_name'],
            slug=validated_data['slug']
        )
        return restaurant

class MenuItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'category', 'name', 'description', 'price', 'image', 'is_available']


class MenuCategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = ['id', 'restaurant', 'name', 'order']
        read_only_fields = ['restaurant']