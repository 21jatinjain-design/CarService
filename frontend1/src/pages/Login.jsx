import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      if (data.role === 'ADMIN') navigate('/dashboard/admin');
      else if (data.role === 'MANAGER') navigate('/dashboard/manager');
      else navigate('/dashboard/user');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚗 Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Email" type="email" required
            onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={styles.input} placeholder="Password" type="password" required
            onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={styles.btn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={styles.footer}>Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link></p>
        <p style={styles.footer}><Link to="/" style={styles.link}>← Back to Home</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1d3557, #457b9d)' },
  card: { background: '#fff', padding: 40, borderRadius: 16, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', marginBottom: 24, color: '#1d3557' },
  input: { width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontWeight: 700 },
  error: { background: '#ffe0e0', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' },
  link: { color: '#e63946', fontWeight: 600, textDecoration: 'none' },
};
