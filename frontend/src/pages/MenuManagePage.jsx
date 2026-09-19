import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

function MenuManagePage() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [newItem, setNewItem] = useState({ category: '', name: '', description: '', price: '' })

  const loadData = () => {
    apiFetch('/menu-categories/').then(res => res.json()).then(setCategories)
    apiFetch('/menu-items/').then(res => res.json()).then(setItems)
  }

  useEffect(() => { loadData() }, [])

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    await apiFetch('/menu-categories/', {
      method: 'POST',
      body: JSON.stringify({ name: newCategory, order: categories.length })
    })
    setNewCategory('')
    loadData()
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.category || !newItem.name || !newItem.price) return
    await apiFetch('/menu-items/', {
      method: 'POST',
      body: JSON.stringify({ ...newItem, is_available: true })
    })
    setNewItem({ category: '', name: '', description: '', price: '' })
    loadData()
  }

  const deleteItem = async (id) => {
    await apiFetch(`/menu-items/${id}/`, { method: 'DELETE' })
    loadData()
  }

  const toggleAvailable = async (item) => {
    await apiFetch(`/menu-items/${item.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: !item.is_available })
    })
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Menyuni boshqarish</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-4 max-w-md">
        <h2 className="font-semibold mb-2">Kategoriya qo'shish</h2>
        <form onSubmit={addCategory} className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Masalan: Issiq taomlar"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <button className="bg-green-700 text-white px-4 rounded">Qo'sh</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 max-w-md">
        <h2 className="font-semibold mb-2">Taom qo'shish</h2>
        <form onSubmit={addItem} className="space-y-2">
          <select
            className="w-full border rounded p-2"
            value={newItem.category}
            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
          >
            <option value="">Kategoriyani tanlang</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            className="w-full border rounded p-2"
            placeholder="Taom nomi"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            className="w-full border rounded p-2"
            placeholder="Tavsif (ixtiyoriy)"
            value={newItem.description}
            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
          />
          <input
            className="w-full border rounded p-2"
            placeholder="Narxi"
            type="number"
            value={newItem.price}
            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
          />
          <button className="w-full bg-green-700 text-white py-2 rounded">Qo'sh</button>
        </form>
      </div>

      <div className="max-w-md space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{Number(item.price).toLocaleString()} so'm</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailable(item)}
                className={`text-xs px-2 py-1 rounded ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
              >
                {item.is_available ? 'Mavjud' : 'Tugagan'}
              </button>
              <button onClick={() => deleteItem(item.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                O'chir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuManagePage