import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { apiFetch } from '../api'

const FRONTEND_BASE = window.location.origin

function TablesPage() {
  const [tables, setTables] = useState([])
  const [newNumber, setNewNumber] = useState('')

  const loadTables = () => {
    apiFetch('/tables/').then(res => res.json()).then(setTables)
  }

  useEffect(() => { loadTables() }, [])

  const addTable = async (e) => {
    e.preventDefault()
    if (!newNumber.trim()) return
    await apiFetch('/tables/', {
      method: 'POST',
      body: JSON.stringify({ number: newNumber })
    })
    setNewNumber('')
    loadTables()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Stollar va QR kodlar</h1>

      <form onSubmit={addTable} className="flex gap-2 mb-4 max-w-md">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Stol raqami"
          value={newNumber}
          onChange={e => setNewNumber(e.target.value)}
        />
        <button className="bg-green-700 text-white px-4 rounded">Qo'sh</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map(table => {
          const url = `${FRONTEND_BASE}/menu/${table.qr_token}`
          return (
            <div key={table.id} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="font-semibold mb-2">Stol {table.number}</p>
              <QRCodeSVG value={url} size={128} className="mx-auto" />
              <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-2 block break-all">
                {url}
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TablesPage