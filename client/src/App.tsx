import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Home, Store, Phone, User, Package, LogOut, Shield, Layers } from 'lucide-react';
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
import { useSiteContent } from './lib/siteContent';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="theme-screen flex items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-[color:var(--gold-300)] border-t-[color:var(--gold-700)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[color:var(--surface-strong)]/92 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="relative flex flex-1 items-center gap-2 sm:gap-3" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex-shrink-0 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-2.5 text-[color:var(--text-primary)] transition hover:border-[color:var(--gold-500)] hover:text-[color:var(--gold-500)]"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <a href="/" className="flex min-w-0 items-center gap-2.5">
                <img
                  src={LOGO_URL}
                  alt="Never Before Cosmetics"
                  className="h-9 w-9 flex-shrink-0 rounded-full border border-[color:var(--gold-500)] object-cover shadow-[0_0_0_4px_rgba(212,175,55,0.12)]"
                />
                <div className="min-w-0">
                  <span className="brand-script block truncate text-[1.35rem] leading-none text-[color:var(--gold-500)] sm:text-[1.75rem]">
                    {content.brand_name}
                  </span>
                  <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[color:var(--text-muted)] sm:block">
                    curated beauty house
                  </span>
                </div>
              </a>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
                  >
                    <div className="border-b border-[color:var(--border-soft)] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Navigation</p>
                    </div>
                    <div className="py-2">
                      {menuItems.map((item) => {
                        const ItemIcon = item.icon;
                        return item.href ? (
                          <a
                            key={item.label}
                            href={item.href}
                            onClick={() => handleMenuItemClick(item)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--text-primary)] transition hover:bg-[color:var(--gold-100)]/50"
                          >
                            <ItemIcon className="h-4 w-4 text-[color:var(--gold-500)]" />
                            {item.label}
                          </a>
                        ) : (
                          <button
                            key={item.label}
                            onClick={() => handleMenuItemClick(item)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--text-primary)] transition hover:bg-[color:var(--gold-100)]/50"
                          >
                            <ItemIcon className="h-4 w-4 text-[color:var(--gold-500)]" />
                            {item.label}
                          </button>
                        );
                      })}
                      {user && isAdmin && (
                        <a
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--gold-500)] transition hover:bg-[color:var(--gold-100)]/50"
                        >
                          <Shield className="h-4.5 w-4.5" />
                          Site Admin
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="hidden items-center gap-1 md:flex">
                {desktopLinks.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--gold-100)]/60 hover:text-[color:var(--gold-700)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--gold-100)]/60 hover:text-[color:var(--gold-700)]"
                    >
                      {link.label}
                    </button>
                  )
                )}
                {user ? (
                  <>
                    <a href="/orders" className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--gold-100)]/60 hover:text-[color:var(--gold-700)]">
                      {content.navigation_orders}
                    </a>
                    {isAdmin && (
                      <a href="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--gold-500)] transition hover:bg-[color:var(--gold-100)]/60">
                        Site Admin
                      </a>
                    )}
                    <button
                      onClick={signOut}
                      className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--gold-100)]/60 hover:text-[color:var(--gold-700)]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a href="/auth" className="rounded-full border border-[color:var(--gold-500)] px-3 py-2 text-sm font-medium text-[color:var(--gold-500)] transition hover:bg-[color:var(--gold-500)] hover:text-black">
                    Sign In
                  </a>
                )}
              </nav>

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex-shrink-0 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-2.5 text-[color:var(--text-primary)] transition hover:border-[color:var(--gold-500)] hover:text-[color:var(--gold-500)]"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
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
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--gold-500)] text-xs font-semibold text-black shadow">
      {totalItems}
    </span>
  );
}

function AppLayout() {
  return (
    <div className="theme-screen">
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppLayout />
    </CartProvider>
  );
}

export default App;
