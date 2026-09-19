import { Routes, Route } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import OrderStatusPage from './pages/OrderStatusPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MenuManagePage from './pages/MenuManagePage'

function App() {
  return (
    <Routes>
      <Route path="/menu/:qrToken" element={<MenuPage />} />
      <Route path="/order/:orderId" element={<OrderStatusPage />} />
      <Route path="/" element={<div className="p-8 text-center">Restoran platformasi</div>} />
      <Route path="/dashboard/:restaurantId" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu-manage" element={<MenuManagePage />} />
    </Routes>
  )
}

export default App