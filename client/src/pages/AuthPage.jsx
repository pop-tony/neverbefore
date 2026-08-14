import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    number: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await login(loginForm.identifier, loginForm.password);
      if (res.success) {
        toast.success('Welcome back!');
        const isAdmin = res.user?.isAdmin || res.user?.role === 'admin';
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.number) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await register(
        registerForm.name,
        registerForm.username,
        registerForm.email,
        registerForm.password,
        registerForm.number
      );
      if (res.success) {
        toast.success('Account created! Welcome to Miz J Boutique.');
        navigate(from);
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 pl-11 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500";

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <img
            src={logo}
            alt="Never Before Cosmetics logo"
            className="mx-auto mb-5 h-28 w-28 rounded-full border-4 border-white bg-white object-cover p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">NEVER BEFORE</p>
          <h1 className="mt-2 font-serif text-4xl font-light text-zinc-900 dark:text-white">
            Cosmetic <span className="text-[#C5A059]">Atelier</span>
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8 grid grid-cols-2 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/30'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
              mode === 'register'
                ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/30'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="you@example.com or admin"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C5A059] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#C5A059]/30 transition hover:bg-[#B08D4F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="jane_doe"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    placeholder="+233 000 000 000"
                    value={registerForm.number}
                    onChange={(e) => setRegisterForm({ ...registerForm, number: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C5A059] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#C5A059]/30 transition hover:bg-[#B08D4F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <Link to="/" className="transition hover:text-[#C5A059]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}