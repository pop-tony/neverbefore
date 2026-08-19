import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, UserCircle2, ShieldCheck, PackageCheck, Save, PencilLine } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    number: user?.number || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const initials = useMemo(() => (user?.name || user?.username || 'User')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(), [user]);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not available';

  const profileCompletion = useMemo(() => {
    const fields = [user?.name, user?.username, user?.email, user?.number];
    const completedFields = fields.filter((value) => value !== undefined && value !== null && String(value).trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
      const apiUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;

      const res = await axios.put(`${apiUrl}/user/update`, {
        name: form.name,
        username: form.username,
        email: form.email,
        number: form.number,
      }, { withCredentials: true });

      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Unable to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to update profile right now.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C5A059]">Account</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-900 dark:text-white sm:text-4xl">Your Profile</h1>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
              return;
            }
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(197,160,89,0.3)] transition hover:bg-[#B68D3D] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving || !user}
        >
          {isEditing ? <Save className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
          {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Edit profile'}
        </button>
      </div>

      {message.text ? (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'}`}>
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(24,24,27,0.06)] dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-24 bg-gradient-to-r from-[#C5A059]/25 via-[#F5E7C8] to-[#F7F4EC] dark:from-[#C5A059]/20 dark:via-zinc-800 dark:to-zinc-900" />

          <div className="px-6 pb-6 pt-0 sm:px-8">
            <div className="-mt-10 flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#C5A059] text-xl font-black text-white shadow-md dark:border-zinc-900">
                  {initials}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{user?.name || 'Your Name'}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">@{user?.username || 'username'}</p>
                </div>
              </div>

              {user?.isAdmin && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B6D36] dark:text-[#E8D29E]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {isEditing ? (
                <>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Full name</span>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Username</span>
                    <input
                      value={form.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Phone</span>
                    <input
                      value={form.number}
                      onChange={(e) => handleChange('number', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Mail className="h-4 w-4 text-[#C5A059]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Email</span>
                    </div>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white">{user?.email || 'No email provided'}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Phone className="h-4 w-4 text-[#C5A059]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Phone</span>
                    </div>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white">{user?.number || 'Not provided'}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <UserCircle2 className="h-4 w-4 text-[#C5A059]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Username</span>
                    </div>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white">{user?.username || 'Not available'}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <PackageCheck className="h-4 w-4 text-[#C5A059]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Member Since</span>
                    </div>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white">{joinedDate}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(24,24,27,0.04)] dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Quick actions</p>
            <div className="mt-5 space-y-3">
              <Link
                to="/orders"
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
              >
                <span>View my orders</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-white"
              >
                <span>Continue shopping</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-[#C5A059]/35 bg-[#F9F5EF] p-6 dark:border-[#C5A059]/30 dark:bg-[#1C1917]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B6D36] dark:text-[#E8D29E]">Account status</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {profileCompletion === 100 ? 'Profile complete' : 'Profile incomplete'}
              </span>
              <span className={`text-sm font-black ${profileCompletion === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#C5A059]'}`}>
                {profileCompletion}%
              </span>
            </div>
            {profileCompletion < 100 && (
              <p className="mt-3 text-xs text-[#8B6D36] dark:text-[#E8D29E]">Add your missing profile details to complete your account.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
