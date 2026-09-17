from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Restaurant, Table
from .serializers import RestaurantMenuSerializer


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