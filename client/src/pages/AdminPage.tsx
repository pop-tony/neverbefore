import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminOrders } from './admin/AdminOrders';
import { AdminContent } from './admin/AdminContent';
import { useSiteContent } from '../lib/siteContent';

export function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { content, loading: contentLoading } = useSiteContent();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
      }}>
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-11a3 3 0 00-3 3v1a3 3 0 003 3h0a3 3 0 003-3V7a3 3 0 00-3-3zm6 9a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{content.admin_access_title}</h1>
          <p className="text-stone-600 mb-6">
            {content.admin_access_message}
          </p>
          <p className="text-sm text-stone-500">
            {content.admin_access_note}
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'content':
        return <AdminContent />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}
