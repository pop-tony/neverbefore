import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, Settings2 } from 'lucide-react';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'content', label: 'Site Content', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Never Before Cosmetics" className="h-8 w-8 rounded-full object-cover border" style={{ borderColor: 'var(--color-gold)' }} />
            <span className="figma-logo-text" style={{ fontSize: '1.3rem' }}>
              never before
              <span className="cosmetics-text">cosmetics</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-stone-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-stone-200 z-50 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Never Before Cosmetics" className="h-10 w-10 rounded-full object-cover border" style={{ borderColor: 'var(--color-gold)' }} />
              <div>
                <h1 className="figma-logo-text" style={{ fontSize: '1.4rem' }}>
                  never before
                  <span className="cosmetics-text">cosmetics</span>
                </h1>
                <p className="text-xs text-stone-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-stone-100">
            <div className="px-4 py-2 mb-4">
              <p className="text-sm font-medium text-stone-800">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
