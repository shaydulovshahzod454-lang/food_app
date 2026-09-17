from rest_framework import serializers
from .models import Order, OrderItem
from restaurants.models import MenuItem


class OrderItemCreateSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True, default='')


class OrderCreateSerializer(serializers.Serializer):
    table_id = serializers.IntegerField()
    items = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        table_id = validated_data['table_id']
        items_data = validated_data['items']

        order = Order.objects.create(table_id=table_id)
        for item in items_data:
            OrderItem.objects.create(
                order=order,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity'],
                note=item.get('note', '')
            )
        return order


class OrderItemDetailSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_price', 'quantity', 'note']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemDetailSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source='table.number', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'status', 'items', 'created_at']