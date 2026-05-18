import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_COLORS = { PENDING: '#f4a261', ASSIGNED: '#457b9d', IN_PROGRESS: '#2a9d8f', COMPLETED: '#2d6a4f' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [bills, setBills] = useState([]);
  const [msg, setMsg] = useState('');
  const [newMgr, setNewMgr] = useState({ name: '', email: '', phone: '', password: '' });

  const load = async () => {
    const [b, u, m, bi] = await Promise.all([
      api.get('/bookings'), api.get('/users'), api.get('/users/managers'), api.get('/bills')
    ]);
    setBookings(b.data); setUsers(u.data); setManagers(m.data); setBills(bi.data);
  };

  useEffect(() => { load(); }, []);

  const assignManager = async (bookingId, managerId) => {
    try { await api.put(`/bookings/${bookingId}/assign`, { managerId: Number(managerId) }); setMsg('✅ Manager assigned!'); load(); }
    catch { setMsg('❌ Failed to assign'); }
  };

  const generateBill = async (serviceRequestId) => {
    try { await api.post('/bills', { serviceRequestId }); setMsg('✅ Bill generated!'); load(); }
    catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed')); }
  };

  const createManager = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/manager', newMgr);
      setMsg('✅ Manager created!');
      setNewMgr({ name: '', email: '', phone: '', password: '' });
      load();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed')); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); setMsg('✅ Deleted!'); load(); }
    catch { setMsg('❌ Delete failed'); }
  };

  const markPaid = async (billId) => {
    try {
      await api.put(`/bills/${billId}/paid`);
      setMsg('✅ Marked as paid!');
      load();
    } catch { setMsg('❌ Failed to mark paid'); }
  };

  const stats = {
    users: users.filter(u => u.role === 'USER').length,
    managers: managers.length,
    bookings: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    revenue: bills.reduce((a, b) => a + b.total, 0),
  };

  const tabs = [['overview','📊 Overview'],['bookings','📋 All Bookings'],['users','👥 Users'],['bills','🧾 Bills']];

  return (
    <div style={S.page}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logo}>🚗 AutoService</div>
        <div style={S.userBox}>
          <div style={{ ...S.avatar, background: '#e63946' }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={S.uname}>{user?.name}</div>
          <div style={S.urole}>Administrator</div>
        </div>
        {tabs.map(([k, l]) => (
          <button key={k} style={{ ...S.sBtn, ...(tab === k ? S.sBtnA : {}) }}
            onClick={() => { setTab(k); setMsg(''); }}>{l}</button>
        ))}
        <button style={S.logout} onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        <button style={S.homeBtn} onClick={() => navigate('/')}>← Home</button>
        {msg && (
          <div style={{ ...S.msg, background: msg.startsWith('✅') ? '#e0ffe0' : '#ffe0e0', color: msg.startsWith('✅') ? '#080' : '#c00' }}>
            {msg}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h2 style={S.title}>Admin Overview</h2>
            <div style={S.statsRow}>
              {[
                ['👥 Users', stats.users, '#457b9d'],
                ['🔧 Managers', stats.managers, '#2a9d8f'],
                ['📋 Bookings', stats.bookings, '#f4a261'],
                ['⏳ Pending', stats.pending, '#e63946'],
                ['💰 Revenue', `₹${stats.revenue.toFixed(0)}`, '#2d6a4f'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ ...S.statCard, borderLeft: `4px solid ${c}` }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <h2 style={S.title}>All Bookings</h2>
            {bookings.length === 0 ? <p>No bookings yet.</p> : bookings.map(b => (
              <div key={b.id} style={S.card}>
                <div style={S.cardHead}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{b.carModel} — {b.carNumber}</span>
                    <div style={S.cardSub}>Customer: {b.user.name} | 📞 {b.user.phone}</div>
                    <div style={S.cardSub}>Services: {b.services.map(s => s.name).join(', ')} | Total: ₹{b.totalAmount}</div>
                    {b.manager && <div style={{ ...S.cardSub, color: '#457b9d' }}>Manager: {b.manager.name}</div>}
                  </div>
                  <span style={{ ...S.badge, background: STATUS_COLORS[b.status] }}>{b.status}</span>
                </div>
                {b.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
                    <select style={S.select} defaultValue=""
                      onChange={e => e.target.value && assignManager(b.id, e.target.value)}>
                      <option value="" disabled>Assign Manager...</option>
                      {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                )}
                {b.status === 'COMPLETED' && !bills.find(bi => bi.booking?.id === b.id) && (
                  <button style={{ ...S.actionBtn, background: '#2d6a4f', marginTop: 10 }}
                    onClick={() => generateBill(b.id)}>
                    🧾 Generate Bill
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h2 style={S.title}>Users & Managers</h2>
            <div style={S.card}>
              <h3 style={{ marginBottom: 16, color: '#1d3557' }}>➕ Create New Manager</h3>
              <form onSubmit={createManager} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={S.input} placeholder="Full Name" required value={newMgr.name}
                  onChange={e => setNewMgr({ ...newMgr, name: e.target.value })} />
                <input style={S.input} placeholder="Email" type="email" required value={newMgr.email}
                  onChange={e => setNewMgr({ ...newMgr, email: e.target.value })} />
                <input style={S.input} placeholder="Phone" required value={newMgr.phone}
                  onChange={e => setNewMgr({ ...newMgr, phone: e.target.value })} />
                <input style={S.input} placeholder="Password" type="password" minLength={6} required value={newMgr.password}
                  onChange={e => setNewMgr({ ...newMgr, password: e.target.value })} />
                <button style={{ ...S.actionBtn, gridColumn: 'span 2' }}>Create Manager</button>
              </form>
            </div>
            <h3 style={{ margin: '20px 0 12px', color: '#1d3557' }}>All Users</h3>
            {users.map(u => (
              <div key={u.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{u.name}</span>
                  <span style={{ ...S.badge, background: u.role === 'ADMIN' ? '#e63946' : u.role === 'MANAGER' ? '#2a9d8f' : '#457b9d', marginLeft: 10 }}>{u.role}</span>
                  <div style={S.cardSub}>📧 {u.email} | 📞 {u.phone}</div>
                </div>
                {u.role !== 'ADMIN' && (
                  <button style={{ ...S.actionBtn, background: '#e63946' }} onClick={() => deleteUser(u.id)}>🗑 Delete</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BILLS */}
        {tab === 'bills' && (
          <div>
            <h2 style={S.title}>All Bills</h2>
            {bills.length === 0 ? <p>No bills generated yet.</p> : bills.map(b => (
              <div key={b.id} style={S.card}>
                <div style={S.cardHead}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{b.booking.carModel} — {b.booking.carNumber}</span>
                    <div style={S.cardSub}>Customer: {b.booking.customer.name} | 📞 {b.booking.customer.phone}</div>
                    <div style={S.cardSub}>
                      Subtotal: ₹{b.subtotal} | Tax: ₹{b.tax} | <strong>Total: ₹{b.total}</strong>
                    </div>
                    <div style={{ ...S.cardSub, color: '#888' }}>
                      Generated by: {b.generatedBy.name} | {new Date(b.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ ...S.badge, background: b.isPaid ? '#2d6a4f' : '#e63946' }}>
                    {b.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                {!b.isPaid && (
                  <button style={{ ...S.actionBtn, background: '#2d6a4f', marginTop: 10 }}
                    onClick={() => markPaid(b.id)}>
                    ✅ Mark as Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
  sidebar: { width: 220, background: '#1d3557', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8 },
  logo: { color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 16, textAlign: 'center' },
  userBox: { textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.2)' },
  avatar: { width: 52, height: 52, borderRadius: '50%', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  uname: { color: '#fff', fontWeight: 600, fontSize: 15 },
  urole: { color: '#a8c8e8', fontSize: 12, marginTop: 2 },
  sBtn: { background: 'transparent', color: '#a8c8e8', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500 },
  sBtnA: { background: 'rgba(255,255,255,0.15)', color: '#fff' },
  logout: { background: '#e63946', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 'auto', fontWeight: 600 },
  main: { flex: 1, padding: 32, background: '#f4f6fb', overflowY: 'auto' },
  homeBtn: { background: 'transparent', border: '1px solid #ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 20, color: '#555' },
  title: { fontSize: 24, fontWeight: 700, color: '#1d3557', marginBottom: 20 },
  msg: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  statCard: { background: '#fff', borderRadius: 10, padding: '16px 24px', flex: 1, minWidth: 120, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardSub: { fontSize: 13, color: '#555', marginTop: 4 },
  badge: { color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  actionBtn: { background: '#2a9d8f', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' },
  input: { padding: '11px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', width: '100%' },
};
