import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_COLORS = { PENDING: '#f4a261', ASSIGNED: '#457b9d', IN_PROGRESS: '#2a9d8f', COMPLETED: '#2d6a4f' };
const NEXT_STATUS = { ASSIGNED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/bookings').then(r => setBookings(r.data)); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setMsg('✅ Status updated!');
      const r = await api.get('/bookings');
      setBookings(r.data);
    } catch { setMsg('❌ Failed to update'); }
  };

  const stats = {
    total: bookings.length,
    inProgress: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  return (
    <div style={S.page}>
      <div style={S.sidebar}>
        <div style={S.logo}>🚗 AutoService</div>
        <div style={S.userBox}>
          <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={S.uname}>{user?.name}</div>
          <div style={S.urole}>Manager</div>
        </div>
        <div style={{ ...S.sBtn, ...S.sBtnA }}>📋 My Bookings</div>
        <button style={S.logout} onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
      </div>

      <div style={S.main}>
        <button style={S.homeBtn} onClick={() => navigate('/')}>← Home</button>
        <h2 style={S.title}>Manager Dashboard</h2>

        {msg && <div style={{ ...S.msg, background: msg.startsWith('✅') ? '#e0ffe0' : '#ffe0e0', color: msg.startsWith('✅') ? '#080' : '#c00' }}>{msg}</div>}

        <div style={S.statsRow}>
          {[['Total Assigned', stats.total, '#457b9d'], ['In Progress', stats.inProgress, '#2a9d8f'], ['Completed', stats.completed, '#2d6a4f']].map(([l, v, c]) => (
            <div key={l} style={{ ...S.statCard, borderLeft: `4px solid ${c}` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{l}</div>
            </div>
          ))}
        </div>

        <h3 style={{ marginBottom: 16, color: '#1d3557' }}>Assigned Bookings</h3>
        {bookings.length === 0 ? <p>No bookings assigned.</p> : bookings.map(b => (
          <div key={b.id} style={S.card}>
            <div style={S.cardHead}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{b.carModel} — {b.carNumber}</span>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Customer: {b.user.name} | 📞 {b.user.phone}</div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Services: {b.services.map(s => s.name).join(', ')}</div>
              </div>
              <span style={{ ...S.badge, background: STATUS_COLORS[b.status] }}>{b.status}</span>
            </div>
            {NEXT_STATUS[b.status] && (
              <button style={S.actionBtn} onClick={() => updateStatus(b.id, NEXT_STATUS[b.status])}>
                Mark as {NEXT_STATUS[b.status].replace('_', ' ')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
  sidebar: { width: 220, background: '#1d3557', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8 },
  logo: { color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 16, textAlign: 'center' },
  userBox: { textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.2)' },
  avatar: { width: 52, height: 52, borderRadius: '50%', background: '#2a9d8f', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  uname: { color: '#fff', fontWeight: 600, fontSize: 15 },
  urole: { color: '#a8c8e8', fontSize: 12, marginTop: 2 },
  sBtn: { color: '#a8c8e8', padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 },
  sBtnA: { background: 'rgba(255,255,255,0.15)', color: '#fff' },
  logout: { background: '#e63946', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 'auto', fontWeight: 600 },
  main: { flex: 1, padding: 32, background: '#f4f6fb' },
  homeBtn: { background: 'transparent', border: '1px solid #ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 20, color: '#555' },
  title: { fontSize: 24, fontWeight: 700, color: '#1d3557', marginBottom: 20 },
  msg: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  statCard: { background: '#fff', borderRadius: 10, padding: '16px 24px', flex: 1, minWidth: 120, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  badge: { color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  actionBtn: { background: '#2a9d8f', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};
