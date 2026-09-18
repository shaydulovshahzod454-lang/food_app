from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
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

class OrderStatusUpdateView(UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer
    http_method_names = ['patch']

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Noto\'g\'ri status'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderDetailSerializer(order).data)
