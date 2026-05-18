//import qrImage from '../../jatinqr.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_COLORS = { PENDING: '#f4a261', ASSIGNED: '#457b9d', IN_PROGRESS: '#2a9d8f', COMPLETED: '#2d6a4f' };

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('book');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ carModel: '', carNumber: '', notes: '', serviceIds: [] });
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data));
    api.get('/bookings/my').then(r => setBookings(r.data));
    api.get('/bills/my').then(r => setBills(r.data));
    api.get('/users/me').then(r => setProfile({ name: r.data.name, phone: r.data.phone }));
  }, []);

  const toggleService = (id) => setForm(f => ({
    ...f,
    serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter(s => s !== id) : [...f.serviceIds, id]
  }));

  const submitBooking = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/bookings', form);
      setMsg('✅ Booking created!');
      setForm({ carModel: '', carNumber: '', notes: '', serviceIds: [] });
      const r = await api.get('/bookings/my');
      setBookings(r.data);
      setTab('bookings');
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed')); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try { await api.put('/users/me', profile); setMsg('✅ Profile updated!'); }
    catch { setMsg('❌ Update failed'); }
  };

  return (
    <div style={S.page}>
      <div style={S.sidebar}>
        <div style={S.logo}>🚗 AutoService</div>
        <div style={S.userBox}>
          <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={S.uname}>{user?.name}</div>
          <div style={S.urole}>Customer</div>
        </div>
        {[['book','🔧 Book Service'],['bookings','📋 My Bookings'],['bills','🧾 My Bills'],['profile','👤 Profile']].map(([k,l]) => (
          <button key={k} style={{ ...S.sBtn, ...(tab===k ? S.sBtnA : {}) }} onClick={() => { setTab(k); setMsg(''); }}>{l}</button>
        ))}
        <button style={S.logout} onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
      </div>

      <div style={S.main}>
        <button style={S.homeBtn} onClick={() => navigate('/')}>← Home</button>
        {msg && <div style={{ ...S.msg, background: msg.startsWith('✅') ? '#e0ffe0' : '#ffe0e0', color: msg.startsWith('✅') ? '#080' : '#c00' }}>{msg}</div>}

        {/* BOOK SERVICE */}
        {tab === 'book' && (
          <div>
            <h2 style={S.title}>Book a Service</h2>
            <form onSubmit={submitBooking} style={S.form}>
              <input style={S.input} placeholder="Car Model (e.g. Honda City)" required value={form.carModel}
                onChange={e => setForm({ ...form, carModel: e.target.value })} />
              <input style={S.input} placeholder="Car Number (e.g. MH01AB1234)" required value={form.carNumber}
                onChange={e => setForm({ ...form, carNumber: e.target.value })} />
              <textarea style={{ ...S.input, height: 70 }} placeholder="Notes (optional)" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
              <p style={{ fontWeight: 600, marginBottom: 10 }}>Select Services:</p>
              <div style={S.sGrid}>
                {services.map(s => (
                  <div key={s.id} style={{ ...S.sCard, ...(form.serviceIds.includes(s.id) ? S.sCardSel : {}) }}
                    onClick={() => toggleService(s.id)}>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ color: '#e63946', fontWeight: 600 }}>₹{s.price}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.durationHours}h</div>
                  </div>
                ))}
              </div>
              {form.serviceIds.length > 0 && (
                <div style={S.total}>Total: ₹{services.filter(s => form.serviceIds.includes(s.id)).reduce((a, s) => a + s.price, 0)}</div>
              )}
              <button style={S.btn} disabled={form.serviceIds.length === 0}>Confirm Booking</button>
            </form>
          </div>
        )}

        {/* MY BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <h2 style={S.title}>My Bookings</h2>
            {bookings.length === 0 ? <p>No bookings yet.</p> : bookings.map(b => (
              <div key={b.id} style={S.card}>
                <div style={S.cardHead}>
                  <span style={{ fontWeight: 700 }}>{b.carModel} — {b.carNumber}</span>
                  <span style={{ ...S.badge, background: STATUS_COLORS[b.status] }}>{b.status}</span>
                </div>
                <div style={S.cardSub}>Services: {b.services.map(s => s.name).join(', ')}</div>
                <div style={S.cardSub}>Total: ₹{b.totalAmount} | {new Date(b.createdAt).toLocaleDateString()}</div>
                {b.manager && <div style={{ ...S.cardSub, color: '#457b9d' }}>Manager: {b.manager.name}</div>}
              </div>
            ))}
          </div>
        )}

        {/* MY BILLS */}
        {tab === 'bills' && (
          <div>
            <h2 style={S.title}>My Bills</h2>
            {bills.length === 0 ? <p>No bills yet.</p> : bills.map(b => (
              <div key={b.id} style={S.card}>
                <div style={S.cardHead}>
                  <span style={{ fontWeight: 700 }}>{b.booking.carModel} — {b.booking.carNumber}</span>
                  <span style={{ ...S.badge, background: b.isPaid ? '#2d6a4f' : '#e63946' }}>
                    {b.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                <div style={S.cardSub}>Services: {b.booking.services.map(s => s.name).join(', ')}</div>
                <div style={S.cardSub}>Subtotal: ₹{b.subtotal} | Tax (18% GST): ₹{b.tax} | <strong>Total: ₹{b.total}</strong></div>
                <div style={{ ...S.cardSub, color: '#888' }}>Generated: {new Date(b.generatedAt).toLocaleDateString()}</div>

                {!b.isPaid && (
                  <div style={payS.payBox}>
                    <h3 style={payS.payTitle}>💳 Pay Now</h3>
                    <div style={payS.payRow}>
                      <div style={payS.qrBox}>
                        <p style={payS.label}>Scan QR to Pay</p>
                        <img
                          src="/jatinqr.png"
                          alt="Scan to Pay"
                         style={{ width: 220, height: 220, borderRadius: 8, objectFit: 'contain', display: 'block' }}
                        />

                        <p style={payS.qrNote}>Scan with any UPI app</p>
                      </div>
                      <div style={payS.divider}>
                        <div style={payS.dividerLine} />
                        <span style={payS.dividerText}>OR</span>
                        <div style={payS.dividerLine} />
                      </div>
                      <div style={payS.manualBox}>
                        <p style={payS.label}>Pay via UPI / Phone</p>
                        <div style={payS.phoneBox}>
                          <div style={payS.phoneNum}>📞 +91 91318 18942</div>
                          <div style={payS.upiId}>UPI: 9131818942@ybl</div>
                        </div>
                        <div style={payS.appRow}>
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                            <span key={app} style={payS.appBadge}>{app}</span>
                          ))}
                        </div>
                        <div style={payS.amountBox}>
                          Amount to Pay: <strong>₹{b.total}</strong>
                        </div>
                        <p style={payS.note}>After payment, share screenshot with admin to confirm.</p>
                      </div>
                    </div>
                  </div>
                )}

                {b.isPaid && (
                  <div style={payS.paidBox}>✅ Payment received. Thank you!</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div>
            <h2 style={S.title}>My Profile</h2>
            <form onSubmit={updateProfile} style={{ ...S.form, maxWidth: 400 }}>
              <input style={S.input} placeholder="Full Name" value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })} />
              <input style={S.input} placeholder="Phone Number" value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              <button style={S.btn}>Update Profile</button>
            </form>
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
  avatar: { width: 52, height: 52, borderRadius: '50%', background: '#e63946', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  uname: { color: '#fff', fontWeight: 600, fontSize: 15 },
  urole: { color: '#a8c8e8', fontSize: 12, marginTop: 2 },
  sBtn: { background: 'transparent', color: '#a8c8e8', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500 },
  sBtnA: { background: 'rgba(255,255,255,0.15)', color: '#fff' },
  logout: { background: '#e63946', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 'auto', fontWeight: 600 },
  main: { flex: 1, padding: 32, background: '#f4f6fb', overflowY: 'auto' },
  homeBtn: { background: 'transparent', border: '1px solid #ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 20, color: '#555' },
  title: { fontSize: 24, fontWeight: 700, color: '#1d3557', marginBottom: 20 },
  msg: { padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  input: { width: '100%', padding: '11px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  btn: { background: '#e63946', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15 },
  sGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 16 },
  sCard: { border: '2px solid #ddd', borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'center' },
  sCardSel: { border: '2px solid #e63946', background: '#fff5f5' },
  total: { background: '#f0f4ff', padding: '10px 16px', borderRadius: 8, fontWeight: 700, marginBottom: 16, color: '#1d3557' },
  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#555', marginTop: 4 },
  badge: { color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
};

const payS = {
  payBox: { marginTop: 16, background: '#f8f9ff', border: '1px solid #e0e4ff', borderRadius: 12, padding: 20 },
  payTitle: { fontSize: 16, fontWeight: 700, color: '#1d3557', marginBottom: 16, textAlign: 'center' },
  payRow: { display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  qrBox: { textAlign: 'center', background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  qrNote: { fontSize: 11, color: '#888', marginTop: 8 },
  divider: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  dividerLine: { width: 1, height: 60, background: '#ddd' },
  dividerText: { fontSize: 12, color: '#999', fontWeight: 600 },
  manualBox: { flex: 1, minWidth: 200, background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  label: { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10, textAlign: 'center' },
  phoneBox: { background: '#f0f4ff', borderRadius: 8, padding: '10px 14px', marginBottom: 12, textAlign: 'center' },
  phoneNum: { fontSize: 18, fontWeight: 800, color: '#1d3557' },
  upiId: { fontSize: 13, color: '#457b9d', marginTop: 4 },
  appRow: { display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  appBadge: { background: '#e63946', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  amountBox: { background: '#1d3557', color: '#fff', padding: '8px 14px', borderRadius: 8, textAlign: 'center', fontSize: 14, marginBottom: 10 },
  note: { fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 1.5 },
  paidBox: { marginTop: 12, background: '#e0ffe0', color: '#2d6a4f', padding: '10px 16px', borderRadius: 8, fontWeight: 600, textAlign: 'center' },
};

