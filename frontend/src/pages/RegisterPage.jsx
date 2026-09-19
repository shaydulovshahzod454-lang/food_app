import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, setTokens } from '../api'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', restaurant_name: '', slug: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(Object.values(data).flat().join(', '))
      setTokens(data.access, data.refresh)
      navigate(`/dashboard/${data.restaurant_id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Restoran ro'yxatdan o'tish</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <input name="restaurant_name" className="w-full border rounded p-2 mb-3" placeholder="Restoran nomi" onChange={handleChange} />
        <input name="slug" className="w-full border rounded p-2 mb-3" placeholder="URL nomi (masalan: mening-restoranim)" onChange={handleChange} />
        <input name="username" className="w-full border rounded p-2 mb-3" placeholder="Username" onChange={handleChange} />
        <input name="password" type="password" className="w-full border rounded p-2 mb-4" placeholder="Parol" onChange={handleChange} />
        <button className="w-full bg-green-700 text-white py-2 rounded font-medium">Ro'yxatdan o'tish</button>
      </form>
    </div>
  )
}

export default RegisterPage