import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import ShopPage from './pages/ShopPage' 
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import { OrderProvider } from './context/OrderContext'
import { Admin } from './pages/Admin'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import OrderDetails from './pages/OrderDetails'
import ProductDetails from './pages/ProductDetails' 
import Lookbook from './components/Lookbook'
import InquiryPage from './pages/InquiryPage'
import { Orders } from './pages/Orders'
import ProfilePage from './pages/Profile'
import AboutUs from './pages/AboutUs'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AuthPage from './pages/AuthPage'

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, adminStoreModeEnabled, loading } = useAuth();
  const adminLockedToDashboard = isAuthenticated && isAdmin && !adminStoreModeEnabled;
  const showShopUi = !isAdmin || adminStoreModeEnabled;

  if (!loading && adminLockedToDashboard && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <OrderProvider>
      <div className="flex min-h-screen flex-col bg-white dark:bg-black">
        <NavBar />
        <main className="flex-1">
          <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/shop' element={<ShopPage />} />
          <Route path='/lookbook' element={<Lookbook />} />
          <Route path='/product/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/admin' element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
          <Route path='/order/:id' element={<OrderDetails />} />
          <Route path='/contact' element={<InquiryPage />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          </Routes>
        </main>
        {showShopUi && <Footer />}
      </div>
    </OrderProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App