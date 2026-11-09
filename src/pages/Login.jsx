import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="input-field" />
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