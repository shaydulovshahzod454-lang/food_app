import { Routes, Route } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import OrderStatusPage from './pages/OrderStatusPage'

function App() {
  return (
    <Routes>
      <Route path="/menu/:qrToken" element={<MenuPage />} />
      <Route path="/order/:orderId" element={<OrderStatusPage />} />
      <Route path="/" element={<div className="p-8 text-center">Restoran platformasi</div>} />
    </Routes>
  )
}

export default App