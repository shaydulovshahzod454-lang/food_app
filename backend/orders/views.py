from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from .models import Order, OrderItem
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
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        # Faqat shu buyurtma tegishli restoran egasi o'zgartira oladi
        if order.table.restaurant.owner != request.user:
            return Response({'error': 'Ruxsat yo\'q'}, status=403)
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Noto\'g\'ri status'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderDetailSerializer(order).data)


class RestaurantOrdersView(generics.ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        # Faqat o'z restoranining buyurtmalarini ko'ra oladi
        return Order.objects.filter(
            table__restaurant_id=restaurant_id,
            table__restaurant__owner=self.request.user
        ).order_by('-created_at')

class DailyStatsView(APIView):
    """
    GET /api/restaurant/<restaurant_id>/stats/daily/?date=2026-09-19
    date parametri berilmasa, bugungi kun olinadi.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, restaurant_id):
        target_date_str = request.query_params.get('date')
        target_date = date.fromisoformat(target_date_str) if target_date_str else date.today()

        orders_qs = Order.objects.filter(
            table__restaurant_id=restaurant_id,
            table__restaurant__owner=request.user,
            created_at__date=target_date,
        ).exclude(status='cancelled')

        total_orders = orders_qs.count()

        items_qs = OrderItem.objects.filter(order__in=orders_qs)

        total_revenue = items_qs.aggregate(
            total=Sum(F('quantity') * F('menu_item__price'))
        )['total'] or 0

        top_items = items_qs.values('menu_item__name').annotate(
            total_qty=Sum('quantity'),
            total_sum=Sum(F('quantity') * F('menu_item__price'))
        ).order_by('-total_qty')[:5]

        return Response({
            'date': target_date.isoformat(),
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'top_items': list(top_items),
        })

class RangeStatsView(APIView):
    """
    GET /api/restaurant/<restaurant_id>/stats/range/?start=2026-09-01&end=2026-09-19
    Har kun uchun buyurtmalar soni va daromadni qaytaradi + davr bo'yicha umumiy top taomlar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, restaurant_id):
        start_str = request.query_params.get('start')
        end_str = request.query_params.get('end')
        end_date = date.fromisoformat(end_str) if end_str else date.today()
        start_date = date.fromisoformat(start_str) if start_str else end_date - timedelta(days=6)

        orders_qs = Order.objects.filter(
            table__restaurant_id=restaurant_id,
            table__restaurant__owner=request.user,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        ).exclude(status='cancelled')

        daily = orders_qs.annotate(day=TruncDate('created_at')).values('day').annotate(
            orders_count=Count('id', distinct=True),
            revenue=Sum(F('items__quantity') * F('items__menu_item__price'))
        ).order_by('day')

        items_qs = OrderItem.objects.filter(order__in=orders_qs)
        top_items = items_qs.values('menu_item__name').annotate(
            total_qty=Sum('quantity'),
            total_sum=Sum(F('quantity') * F('menu_item__price'))
        ).order_by('-total_qty')[:10]

        total_orders = orders_qs.count()
        total_revenue = items_qs.aggregate(
            total=Sum(F('quantity') * F('menu_item__price'))
        )['total'] or 0
        avg_order_value = (total_revenue / total_orders) if total_orders else 0

        return Response({
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'avg_order_value': round(avg_order_value, 2),
            'daily': list(daily),
            'top_items': list(top_items),
        })