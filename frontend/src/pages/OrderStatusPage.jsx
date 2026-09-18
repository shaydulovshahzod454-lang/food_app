import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api'

const STATUS_LABELS = {
  pending: 'Kutilmoqda',
  preparing: 'Tayyorlanmoqda',
  ready: 'Tayyor',
  served: 'Berildi',
  cancelled: 'Bekor qilindi',
}

function OrderStatusPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = () => {
      fetch(`${API_BASE}/orders/${orderId}/`)
        .then(res => res.json())
        .then(setOrder)
    }
    fetchOrder()
    const interval = setInterval(fetchOrder, 5000) // har 5 sekundda tekshirib turadi
    return () => clearInterval(interval)
  }, [orderId])

  if (!order) return <div className="p-8 text-center">Yuklanmoqda...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow p-4 max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-2">Buyurtma #{order.id}</h1>
        <p className="text-sm text-gray-500 mb-4">Stol {order.table_number}</p>

        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-4">
          {STATUS_LABELS[order.status] || order.status}
        </div>

        <div className="space-y-2 border-t pt-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.menu_item_name}</span>
              <span>{Number(item.menu_item_price * item.quantity).toLocaleString()} so'm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderStatusPage