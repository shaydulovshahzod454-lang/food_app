import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE, setTokens } from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error('Login yoki parol noto\'g\'ri')
      const data = await res.json()
      setTokens(data.access, data.refresh)

      const meRes = await fetch(`${API_BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      })
      const me = await meRes.json()
      navigate(`/dashboard/${me.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Restoran uchun kirish</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <input
          className="w-full border rounded p-2 mb-3"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded p-2 mb-4"
          type="password"
          placeholder="Parol"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-700 text-white py-2 rounded font-medium">Kirish</button>
        <p className="text-sm text-gray-500 mt-3 text-center">
          Akkaunt yo'qmi? <Link to="/register" className="text-green-700 font-medium">Ro'yxatdan o'tish</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage