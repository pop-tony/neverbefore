import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { AuthPage } from './pages/AuthPage';
import { ProductCatalog, CartSidebar } from './pages/ProductCatalog';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Menu, X, Home, Store, Phone, User, Package, LogOut, Shield, Layers } from 'lucide-react';
import { useSiteContent } from './lib/siteContent';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-gold-light)', borderTopColor: 'var(--color-gold)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/* ── Figma Navbar ─────────────────────────────────────────── */
/* Hamburger (left) · script logo (center) · nav links (right)  */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { content } = useSiteContent();

  const desktopLinks = [
    { label: content.navigation_home, href: '/', icon: Home },
    { label: content.navigation_shop, href: '/', icon: Store },
    { label: content.navigation_cart, action: () => setCartOpen(true), icon: ShoppingBag },
    { label: content.navigation_contact, href: '#contact', icon: Phone },
  ];

  const menuItems = user
    ? [
        { label: 'Profile', href: '/profile', icon: User },
        { label: content.navigation_shop, href: '/', icon: Store },
        { label: content.navigation_orders, href: '/orders', icon: Package },
        { label: content.navigation_categories, href: '/categories', icon: Layers },
        { label: 'Sign Out', action: () => { signOut(); navigate('/'); }, icon: LogOut },
      ]
    : [
        { label: content.navigation_shop, href: '/', icon: Store },
        { label: content.navigation_categories, href: '/categories', icon: Layers },
        { label: 'Sign In', href: '/auth', icon: User },
      ];

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    setMenuOpen(false);
    if (item.action) item.action();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: 'var(--stone-200)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 relative" ref={menuRef}>
            {/* Left: hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-lg hover:bg-stone-100 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" style={{ color: 'var(--color-dark)' }} /> : <Menu className="w-6 h-6" style={{ color: 'var(--color-dark)' }} />}
            </button>

            {/* Brand: logo image + "never before cosmetics" */}
            <a href="/" className="flex items-center gap-2 min-w-0">
              <img src={LOGO_URL} alt="Never Before Cosmetics" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border flex-shrink-0" style={{ borderColor: 'var(--color-gold)' }} />
              <span className="figma-logo-text">{content.brand_name}</span>
            </a>

            {/* Hamburger dropdown menu */}
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border fade-in z-50 overflow-hidden" style={{ borderColor: 'var(--stone-200)' }}>
                <div className="py-2">
                  {menuItems.map((item) =>
                    item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => handleMenuItemClick(item)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-rose-50 transition-colors"
                        style={{ color: 'var(--color-dark)' }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                        {item.label}
                      </a>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => handleMenuItemClick(item)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-rose-50 transition-colors"
                        style={{ color: 'var(--color-dark)' }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                        {item.label}
                      </button>
                    )
                  )}
                  {user && isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-rose-50 transition-colors"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      <Shield className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                      Site Admin
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

            {/* Right: nav links + cart badge */}
            <div className="flex items-center gap-1 sm:gap-4">
              <nav className="hidden md:flex items-center gap-1">
                {desktopLinks.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
                      style={{ color: 'var(--color-dark)' }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
                      style={{ color: 'var(--color-dark)' }}
                    >
                      {link.label}
                    </button>
                  )
                )}
                {user ? (
                  <>
                    <a href="/orders" className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--color-dark)' }}>
                      {content.navigation_orders}
                    </a>
                    {isAdmin && (
                      <a href="/admin" className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--color-gold)' }}>
                        Site Admin
                      </a>
                    )}
                    <button
                      onClick={signOut}
                      className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
                      style={{ color: 'var(--color-dark)' }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a href="/auth" className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--color-gold)' }}>
                    Sign In
                  </a>
                )}
              </nav>

              {/* Cart icon with badge */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-stone-100 transition-colors flex-shrink-0"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-dark)' }} />
                <CartBadge />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate('/checkout'); }} />
    </>
  );
}

function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-white text-xs font-medium" style={{ background: 'var(--color-pink-bg)' }}>
      {totalItems}
    </span>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-off-white)' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductCatalog />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
        <CartProvider>
          <Routes>
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </CartProvider>
  );
}

export default App;
