import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiFetch } from '../api'

function toISO(d) {
  return d.toISOString().split('T')[0]
}

function StatsPage() {
  const { restaurantId } = useParams()
  const [stats, setStats] = useState(null)
  const [range, setRange] = useState('7') // kunlar soni

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - (Number(range) - 1))

  useEffect(() => {
    apiFetch(`/restaurant/${restaurantId}/stats/range/?start=${toISO(startDate)}&end=${toISO(endDate)}`)
      .then(res => res.json())
      .then(setStats)
  }, [restaurantId, range])

  if (!stats) return <div className="p-8 text-center">Yuklanmoqda...</div>

  const chartData = stats.daily.map(d => ({
    day: d.day,
    daromad: Number(d.revenue || 0),
    buyurtma: d.orders_count,
  }))

  const exportCSV = () => {
    let csv = 'Sana,Buyurtmalar,Daromad\n'
    stats.daily.forEach(d => {
      csv += `${d.day},${d.orders_count},${d.revenue || 0}\n`
    })
    csv += '\nTaom,Miqdor,Summa\n'
    stats.top_items.forEach(i => {
      csv += `${i.menu_item__name},${i.total_qty},${i.total_sum}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statistika_${stats.start}_${stats.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Statistika</h1>
        <Link to={`/dashboard/${restaurantId}`} className="text-sm text-green-700 font-medium">← Panelga qaytish</Link>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { label: '7 kun', value: '7' },
          { label: '30 kun', value: '30' },
          { label: '90 kun', value: '90' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`px-4 py-2 rounded text-sm font-medium ${range === opt.value ? 'bg-green-700 text-white' : 'bg-white text-gray-700'}`}
          >
            {opt.label}
          </button>
        ))}
        <button onClick={exportCSV} className="ml-auto px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white">
          CSV yuklash
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Buyurtmalar</p>
          <p className="text-2xl font-bold">{stats.total_orders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Umumiy daromad</p>
          <p className="text-2xl font-bold">{Number(stats.total_revenue).toLocaleString()} so'm</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">O'rtacha chek</p>
          <p className="text-2xl font-bold">{Number(stats.avg_order_value).toLocaleString()} so'm</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Daromad dinamikasi</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="daromad" stroke="#15803d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-4 max-w-md">
        <h2 className="font-semibold mb-3">Top taomlar</h2>
        {stats.top_items.length === 0 ? (
          <p className="text-sm text-gray-400">Bu davrda buyurtma bo'lmagan</p>
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