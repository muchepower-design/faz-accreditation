import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);

  // Mount Google button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id || !googleButtonRef.current) return;

    const handleCredential = async (response) => {
      setLoading(true);
      const result = await loginWithGoogle(response.credential);
      setLoading(false);
      if (result.success) navigate('/apply');
    };

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 340,
      text: 'continue_with',
      shape: 'rectangular',
    });
  }, [loginWithGoogle, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { success } = await login(form.email, form.password);
    setLoading(false);
    if (success) navigate('/apply');
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="glass p-8">
        <h1 className="text-2xl font-bold gradient-text mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to apply for accreditation.</p>

        {GOOGLE_CLIENT_ID ? (
          <div className="mb-5 flex justify-center">
            <div ref={googleButtonRef}></div>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-500 mb-4">
            (Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in)
          </p>
        )}

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/register" className="text-faz-orange font-medium hover:underline">Register</Link>
        </p>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Same account works across FAZ Tickets, Shop, and Accreditation.
        </p>
      </div>
    </div>
  );
}