import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚗 Create Account</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Full Name" required onChange={f('name')} />
          <input style={styles.input} placeholder="Email" type="email" required onChange={f('email')} />
          <input style={styles.input} placeholder="Phone Number" required onChange={f('phone')} />
          <input style={styles.input} placeholder="Password (min 6 chars)" type="password" minLength={6} required onChange={f('password')} />
          <button style={styles.btn}>Create Account</button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Sign In</Link></p>
        <p style={styles.footer}><Link to="/" style={styles.link}>← Back to Home</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1d3557, #457b9d)' },
  card: { background: '#fff', padding: 40, borderRadius: 16, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', marginBottom: 24, color: '#1d3557' },
  input: { width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontWeight: 700 },
  error: { background: '#ffe0e0', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 },
  success: { background: '#e0ffe0', color: '#080', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 },
  footer: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' },
  link: { color: '#e63946', fontWeight: 600, textDecoration: 'none' },
};
