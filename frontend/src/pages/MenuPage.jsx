import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api'

function MenuPage() {
  const { qrToken } = useParams()
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/table/${qrToken}/`)
      .then(res => {
        if (!res.ok) throw new Error('Menyu topilmadi')
        return res.json()
      })
      .then(data => {
        setMenu(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [qrToken])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">{menu.name}</h1>
        <p className="text-sm text-gray-500">Stol {menu.table_number}</p>
      </div>

      <div className="p-4 space-y-6">
        {menu.categories.map(category => (
          <div key={category.id}>
            <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
            <div className="space-y-3">
              {category.items.filter(i => i.is_available).map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow p-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-green-700 font-semibold mt-1">{Number(item.price).toLocaleString()} so'm</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Qo'sh
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{cart.reduce((s, i) => s + i.quantity, 0)} taom — {cartTotal.toLocaleString()} so'm</span>
            <button className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              Buyurtma berish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuPage