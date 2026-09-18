from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderCreateView(APIView):
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        order_data = OrderDetailSerializer(order).data

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{order.table.restaurant_id}',
            {
                'type': 'new_order',
                'order': order_data,
            }
        )

        return Response(order_data, status=201)


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer


class RestaurantOrdersView(generics.ListAPIView):
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Order.objects.filter(table__restaurant_id=restaurant_id).order_by('-created_at')