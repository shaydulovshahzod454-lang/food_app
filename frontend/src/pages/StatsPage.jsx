import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../api'

function StatsPage() {
  const { restaurantId } = useParams()
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    apiFetch(`/restaurant/${restaurantId}/stats/daily/?date=${selectedDate}`)
      .then(res => res.json())
      .then(setStats)
  }, [restaurantId, selectedDate])

  if (!stats) return <div className="p-8 text-center">Yuklanmoqda...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Statistika</h1>
        <Link to={`/dashboard/${restaurantId}`} className="text-sm text-green-700 font-medium">← Panelga qaytish</Link>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="border rounded p-2 mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Buyurtmalar</p>
          <p className="text-2xl font-bold">{stats.total_orders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Umumiy daromad</p>
          <p className="text-2xl font-bold">{Number(stats.total_revenue).toLocaleString()} so'm</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 max-w-md">
        <h2 className="font-semibold mb-3">Top taomlar</h2>
        {stats.top_items.length === 0 ? (
          <p className="text-sm text-gray-400">Bu kunda buyurtma bo'lmagan</p>
        ) : (
          <div className="space-y-2">
            {stats.top_items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{idx + 1}. {item.menu_item__name}</span>
                <span className="text-gray-500">{item.total_qty} ta — {Number(item.total_sum).toLocaleString()} so'm</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPage