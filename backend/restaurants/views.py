from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Restaurant, Table
from .serializers import RestaurantMenuSerializer, RestaurantRegisterSerializer


class TableMenuView(APIView):
    """
    Mijoz QR kodni skanerlaganda shu endpoint chaqiriladi.
    URL: /api/table/<qr_token>/
    Bu stol qaysi restoranga tegishli ekanini aniqlab, shu restoran menyusini qaytaradi.
    """
    def get(self, request, qr_token):
        table = get_object_or_404(Table, qr_token=qr_token)
        serializer = RestaurantMenuSerializer(table.restaurant)
        data = serializer.data
        data['table_id'] = table.id
        data['table_number'] = table.number
        return Response(data)

class RestaurantRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RestaurantRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        refresh = RefreshToken.for_user(restaurant.owner)
        return Response({
            'restaurant_id': restaurant.id,
            'restaurant_name': restaurant.name,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=201)


class MyRestaurantView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restoran topilmadi'}, status=404)
        return Response({'id': restaurant.id, 'name': restaurant.name, 'slug': restaurant.slug})