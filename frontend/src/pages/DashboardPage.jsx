import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import { Link } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api'
const WS_BASE = 'ws://127.0.0.1:8000'

const STATUS_LABELS = {
  pending: 'Kutilmoqda',
  preparing: 'Tayyorlanmoqda',
  ready: 'Tayyor',
  served: 'Berildi',
  cancelled: 'Bekor qilindi',
}

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'served', 'cancelled']

function DashboardPage() {
  const { restaurantId } = useParams()
  const [orders, setOrders] = useState([])
  const wsRef = useRef(null)

  useEffect(() => {
  apiFetch(`/restaurant/${restaurantId}/orders/`)
    .then(res => res.json())
    .then(setOrders)

    const ws = new WebSocket(`${WS_BASE}/ws/restaurant/${restaurantId}/`)
    ws.onmessage = (e) => {
      const newOrder = JSON.parse(e.data)
      setOrders(prev => [newOrder, ...prev])
    }
    wsRef.current = ws

    return () => ws.close()
  }, [restaurantId])

    const updateStatus = async (orderId, newStatus) => {
  try {
    const res = await apiFetch(`/orders/${orderId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
      if (!res.ok) throw new Error('Xatolik')
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      alert(err.message)
    }
  }

  const nextStatus = (current) => {
    const idx = STATUS_ORDER.indexOf(current)
    return STATUS_ORDER[idx + 1] || null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
  <h1 className="text-xl font-bold">Buyurtmalar paneli</h1>
  <Link to="/menu-manage" className="text-sm text-green-700 font-medium">Menyuni boshqarish →</Link>
  <Link to="/tables" className="text-sm text-green-700 font-medium">Stollar →</Link>
</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Stol {order.table_number}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{STATUS_LABELS[order.status]}</span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map(item => (
                <div key={item.id} className="text-sm">
                  {item.quantity}x {item.menu_item_name}
                  {item.note && <span className="text-gray-500 italic"> ({item.note})</span>}
                </div>
              ))}
            </div>
            {nextStatus(order.status) && (
              <button
                onClick={() => updateStatus(order.id, nextStatus(order.status))}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium"
              >
                → {STATUS_LABELS[nextStatus(order.status)]}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage