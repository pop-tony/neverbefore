import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';
const BG_URL   = '/photo_2026-07-17_01-18-30 copy.jpg';

type AuthMode = 'signup' | 'signin';

/* ── Field row ─────────────────────────────────────────────── */
interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function FormField({ id, label, type, value, onChange, autoComplete, showToggle, showPassword, onTogglePassword }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-widest uppercase text-white/80"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full h-10 rounded-full px-4 pr-10 text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.88)',
            border: '1.5px solid var(--color-gold)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-dark)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.97)';
            e.currentTarget.style.boxShadow  = '0 0 0 2px rgba(212,175,55,0.40)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
            e.currentTarget.style.boxShadow  = 'none';
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Logo badge ────────────────────────────────────────────── */
function LogoBadge() {
  return (
    <div
      className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl flex-shrink-0"
      style={{ border: '2.5px solid var(--color-gold)' }}
    >
      <img
        src={LOGO_URL}
        alt="Never Before Cosmetics"
        className="w-[88%] h-[88%] rounded-full object-cover"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 *  AuthPage
 * ══════════════════════════════════════════════════════════════ */
export function AuthPage() {
  const { signIn, signUp } = useAuth();

  const [mode,            setMode]            = useState<AuthMode>('signup');
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);

  const togglePw = () => setShowPassword((p) => !p);

  const signupFields: FieldProps[] = [
    { id: 'name',    label: 'Name :',             type: 'text',                              value: fullName,        onChange: setFullName,        autoComplete: 'name' },
    { id: 'email',   label: 'Email :',            type: 'email',                             value: email,           onChange: setEmail,           autoComplete: 'email' },
    { id: 'number',  label: 'Number :',           type: 'tel',                               value: phone,           onChange: setPhone,           autoComplete: 'tel' },
    { id: 'pw',      label: 'Password :',         type: showPassword ? 'text' : 'password',  value: password,        onChange: setPassword,        autoComplete: 'new-password',     showToggle: true, showPassword, onTogglePassword: togglePw },
    { id: 'cpw',     label: 'Confirm Password :', type: showPassword ? 'text' : 'password',  value: confirmPassword, onChange: setConfirmPassword, autoComplete: 'new-password' },
  ];

  const signinFields: FieldProps[] = [
    { id: 'email',   label: 'Email :',    type: 'email',                             value: email,    onChange: setEmail,    autoComplete: 'email' },
    { id: 'pw',      label: 'Password :', type: showPassword ? 'text' : 'password',  value: password, onChange: setPassword, autoComplete: 'current-password', showToggle: true, showPassword, onTogglePassword: togglePw },
  ];

  const fields = mode === 'signup' ? signupFields : signinFields;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName, phone);
      if (error) { setError(error.message); setLoading(false); return; }
      setError('Account created! You are now signed in.');
      setLoading(false);
    } else {
      const { error } = await signIn(email, password);
      if (error) { setError(error.message); setLoading(false); }
    }
  };

  const switchMode = () => { setMode((m) => (m === 'signup' ? 'signin' : 'signup')); setError(null); };

  const isSuccess = !!error && (error.includes('created') || error.includes('confirm'));

  return (
    /* ── Root: full-viewport background ── */
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:    `url("${BG_URL}")`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.35)' }} />

      {/* ── Frosted-glass card ── */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md rounded-3xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center gap-5"
        style={{
          background:          'rgba(255, 255, 255, 0.16)',
          backdropFilter:      'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          border:              '1px solid rgba(255,255,255,0.30)',
          boxShadow:           '0 8px 48px rgba(0,0,0,0.30)',
        }}
      >
        {/* Logo */}
        <LogoBadge />

        {/* Heading */}
        <h1
          className="text-4xl sm:text-5xl font-normal text-white text-center leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '0 2px 12px rgba(0,0,0,0.30)',
          }}
        >
          Welcome
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {fields.map((f) => <FormField key={f.id} {...f} />)}

          {/* Error / success banner */}
          {error && (
            <p
              className={`text-xs px-3 py-2 rounded-xl text-center font-medium ${
                isSuccess
                  ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/40'
                  : 'bg-rose-500/25 text-rose-100 border border-rose-400/40'
              }`}
            >
              {error}
            </p>
          )}

          {/* Switch mode link */}
          <p className="text-xs text-white/75 text-center mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-white font-semibold underline underline-offset-2 hover:text-white/90 focus-visible:outline-none"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 h-11 rounded-full text-base font-normal tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.98]"
            style={{
              background:  'var(--color-pink)',
              color:       'var(--color-dark)',
              fontFamily:  'var(--font-display)',
              boxShadow:   '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
