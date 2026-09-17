from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderCreateView(APIView):
    """Mijoz buyurtma yuborganda shu endpoint chaqiriladi. POST /api/orders/"""
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=201)


class OrderDetailView(generics.RetrieveAPIView):
    """Mijoz yoki oshxona buyurtma holatini ko'rish uchun. GET /api/orders/<id>/"""
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer


class RestaurantOrdersView(generics.ListAPIView):
    """Oshxona ekrani uchun: shu restorandagi barcha buyurtmalar. GET /api/restaurant/<restaurant_id>/orders/"""
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Order.objects.filter(table__restaurant_id=restaurant_id).order_by('-created_at')