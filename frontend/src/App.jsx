import { Routes, Route } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import OrderStatusPage from './pages/OrderStatusPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/menu/:qrToken" element={<MenuPage />} />
      <Route path="/order/:orderId" element={<OrderStatusPage />} />
      <Route path="/" element={<div className="p-8 text-center">Restoran platformasi</div>} />
      <Route path="/dashboard/:restaurantId" element={<DashboardPage />} />
    </Routes>
  )
}

export default App