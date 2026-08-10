import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Package, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="h-28" style={{ background: 'linear-gradient(135deg, var(--color-pink-light) 0%, var(--color-gold-light) 100%)' }} />
        <div className="px-6 sm:px-8 pb-8 -mt-12">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-4" style={{ border: '3px solid var(--color-gold)' }}>
            <User className="w-10 h-10" style={{ color: 'var(--color-gold)' }} />
          </div>

          <h1 className="text-2xl font-light text-stone-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {user.full_name || 'My Account'}
          </h1>
          <div className="flex items-center gap-2 text-stone-500 mb-6">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{user.email}</span>
          </div>

          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'var(--rose-50)', color: 'var(--rose-500)' }}>
              <Shield className="w-3.5 h-3.5" />
              Administrator
            </div>
          )}

          <div className="space-y-3">
            <a
              href="/orders"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--rose-50)' }}>
                <Package className="w-5 h-5" style={{ color: 'var(--rose-400)' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">Transaction History</p>
                <p className="text-xs text-stone-500">View your past orders</p>
              </div>
            </a>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--rose-50)' }}>
                <LogOut className="w-5 h-5" style={{ color: 'var(--rose-400)' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-800">Sign Out</p>
                <p className="text-xs text-stone-500">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
