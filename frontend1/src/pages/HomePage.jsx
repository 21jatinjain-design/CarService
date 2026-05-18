import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

const services = [
  { icon: '🔧', title: 'Engine Repair', desc: 'Full engine diagnostics and repair' },
  { icon: '🛞', title: 'Tyre Service', desc: 'Balancing, rotation & replacement' },
  { icon: '🛢️', title: 'Oil Change', desc: 'Quick oil & filter replacement' },
  { icon: '🚿', title: 'Car Wash', desc: 'Interior & exterior deep clean' },
  { icon: '❄️', title: 'AC Service', desc: 'AC gas refill & repair' },
  { icon: '🔋', title: 'Battery Check', desc: 'Battery test & replacement' },
];

const floatingIcons = [
  { icon: '🚗', size: 40, left: '5%',  duration: '6s',  delay: '0s' },
  { icon: '🔧', size: 30, left: '15%', duration: '8s',  delay: '1s' },
  { icon: '🛞', size: 35, left: '25%', duration: '7s',  delay: '2s' },
  { icon: '⚙️', size: 28, left: '38%', duration: '9s',  delay: '0.5s' },
  { icon: '🔋', size: 32, left: '50%', duration: '6.5s',delay: '1.5s' },
  { icon: '🛢️', size: 30, left: '62%', duration: '8.5s',delay: '3s' },
  { icon: '🚗', size: 38, left: '72%', duration: '7.5s',delay: '0.8s' },
  { icon: '⚙️', size: 34, left: '82%', duration: '6s',  delay: '2.5s' },
  { icon: '🔧', size: 26, left: '90%', duration: '9s',  delay: '1.2s' },
  { icon: '🛞', size: 36, left: '95%', duration: '7s',  delay: '0.3s' },
];

function Reveal({ children, delay = '0s' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        } else {
          // reset when scrolled out so it re-animates on scroll back
          el.style.opacity = '0';
          el.style.transform = 'translateY(40px)';
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: 0,
      transform: 'translateY(40px)',
      transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
    }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (user.role === 'ADMIN') navigate('/dashboard/admin');
    else if (user.role === 'MANAGER') navigate('/dashboard/manager');
    else navigate('/dashboard/user');
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-150px) rotate(360deg); opacity: 0; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gearSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes gearSpinReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .floating-icon {
          position: absolute;
          animation: floatUp linear infinite;
          pointer-events: none;
          user-select: none;
        }
        .gear-spin   { animation: gearSpin 8s linear infinite; }
        .gear-spin-r { animation: gearSpinReverse 6s linear infinite; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>🚗 AutoService</div>
        <div style={styles.navLinks}>
          <a href="#services" style={styles.navLink}>Services</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
          {user ? (
            <>
              <button style={styles.btnOutline} onClick={goToDashboard}>Dashboard</button>
              <button style={styles.btnRed} onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <button style={styles.btnOutline} onClick={() => navigate('/login')}>Sign In</button>
              <button style={styles.btnPrimary} onClick={() => navigate('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        {floatingIcons.map((item, i) => (
          <span key={i} className="floating-icon" style={{
            left: item.left, bottom: '-60px',
            fontSize: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}>{item.icon}</span>
        ))}
        <span className="gear-spin"   style={{ position: 'absolute', top: 30,    right: 80, fontSize: 80, opacity: 0.08 }}>⚙️</span>
        <span className="gear-spin-r" style={{ position: 'absolute', top: 70,    right: 40, fontSize: 50, opacity: 0.08 }}>⚙️</span>
        <span className="gear-spin"   style={{ position: 'absolute', bottom: 30, left: 60,  fontSize: 70, opacity: 0.08 }}>⚙️</span>
        <span className="gear-spin-r" style={{ position: 'absolute', bottom: 60, left: 20,  fontSize: 40, opacity: 0.08 }}>⚙️</span>

        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Professional Car Service<br />You Can Trust</h1>
          <p style={styles.heroSub}>Expert mechanics, transparent pricing, and fast turnaround — all in one place.</p>
          {user ? (
            <button style={styles.heroBtn} onClick={goToDashboard}>Go to Dashboard →</button>
          ) : (
            <button style={styles.heroBtn} onClick={() => navigate('/register')}>Book a Service →</button>
          )}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={styles.serviceSection}>
        <div style={styles.bgOverlay} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
          <Reveal>
            <h2 style={styles.sectionTitle}>Our Services</h2>
          </Reveal>
          <div style={styles.grid}>
            {services.map((s, i) => (
              <Reveal key={i} delay={`${i * 0.1}s`}>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>{s.icon}</div>
                  <h3 style={styles.cardTitle}>{s.title}</h3>
                  <p style={styles.cardDesc}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={styles.aboutSection}>
        <div style={styles.aboutBgOverlay} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '60px 40px', textAlign: 'center' }}>
          <Reveal>
            <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
          </Reveal>
          <div style={styles.grid3}>
            {[
              { icon: '✅', title: 'Certified Mechanics', desc: 'All our staff are professionally trained and certified.' },
              { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges. Pay only what you see.' },
              { icon: '⚡', title: 'Fast Turnaround', desc: 'Most services completed within the same day.' },
            ].map((item, i) => (
              <Reveal key={i} delay={`${i * 0.15}s`}>
                <div style={styles.featureCard}>
                  <div style={{ fontSize: 36 }}>{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p style={{ color: '#666' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT + MAP */}
      <section id="contact" style={styles.contactSection}>
        <div style={styles.contactBgOverlay} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
          <Reveal>
            <h2 style={styles.sectionTitle}>Find Us</h2>
          </Reveal>
          <div style={styles.contactRow}>
            <Reveal delay="0.1s">
              <div style={styles.contactInfo}>
                <h3 style={{ marginBottom: 16 }}>Contact Details</h3>
                <p style={styles.contactItem}>📍 7, Nanda Nagar Main Rd, Subhash Nagar, Indore - 452011</p>
                <p style={styles.contactItem}>📞 <a href="tel:+919131818942" style={styles.link}>+91 91318 18942</a></p>
                <p style={styles.contactItem}>📧 <a href="mailto:21jatinjain@gmail.com" style={styles.link}>21jatinjain@gmail.com</a></p>
                <p style={styles.contactItem}>🕐 Mon–Sat: 8:00 AM – 8:00 PM</p>
                <p style={styles.contactItem}>🕐 Sunday: 9:00 AM – 5:00 PM</p>
                <div style={{ marginTop: 24 }}>
                  {!user && (
                    <button style={styles.btnPrimary} onClick={() => navigate('/register')}>
                      Book Appointment
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
            <Reveal delay="0.2s">
              <div style={styles.mapContainer}>
                <iframe
                  title="Service Center Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.8!2d75.8704882!3d22.7443084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd611a8aec7f%3A0xc1b025cd9b624189!2s7%2C%20Nanda%20Nagar%20Main%20Rd%2C%20Patnipura%20Square%2C%20Subhash%20Nagar%2C%20Pardesipura%2C%20Indore%2C%20Madhya%20Pradesh%20452011!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="200%"
                  height="400"
                  style={{ border: 0, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 AutoService. All rights reserved.</p>
        <p style={{ marginTop: 4, color: '#aaa' }}>📞 +91 91318 18942 &nbsp;|&nbsp; 📍 Indore, India</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Segoe UI, sans-serif', margin: 0, padding: 0, background: '#f9f9f9' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 40px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: 22, fontWeight: 700, color: '#e63946' },
  navLinks: { display: 'flex', gap: 12, alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#333', fontWeight: 500, padding: '6px 10px' },
  btnPrimary: { background: '#e63946', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  btnOutline: { background: 'transparent', color: '#e63946', border: '2px solid #e63946', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  btnRed: { background: '#333', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(270deg, #1d3557, #457b9d, #1d3557, #e63946)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 10s ease infinite',
    color: '#fff', padding: '120px 40px', textAlign: 'center',
  },
  heroContent: { maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 2 },
  heroTitle: { fontSize: 48, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 },
  heroSub: { fontSize: 18, opacity: 0.9, marginBottom: 32 },
  heroBtn: { background: '#e63946', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 20px rgba(230,57,70,0.5)' },
  serviceSection: {
    position: 'relative',
    background: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(29,53,87,0.03) 8px, rgba(29,53,87,0.03) 10px),
      repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(29,53,87,0.03) 8px, rgba(29,53,87,0.03) 10px), #f8f9ff`,
  },
  bgOverlay: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `radial-gradient(circle, rgba(29,53,87,0.04) 1px, transparent 1px)`,
    backgroundSize: '30px 30px',
  },
  aboutSection: {
    position: 'relative',
    background: `linear-gradient(rgba(69,123,157,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(69,123,157,0.05) 1px, transparent 1px), #fff`,
    backgroundSize: '40px 40px',
  },
  aboutBgOverlay: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse at top left, rgba(230,57,70,0.04) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(29,53,87,0.05) 0%, transparent 60%)',
  },
  contactSection: {
    position: 'relative',
    background: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(29,53,87,0.04) 19px, rgba(29,53,87,0.04) 20px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(29,53,87,0.04) 19px, rgba(29,53,87,0.04) 20px), #f4f6fb`,
  },
  contactBgOverlay: { position: 'absolute', inset: 0, zIndex: 0 },
  sectionTitle: { textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 40, color: '#1d3557' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#1d3557' },
  cardDesc: { color: '#666', fontSize: 14 },
  featureCard: { padding: 24, borderRadius: 12, background: 'rgba(240,244,255,0.8)', backdropFilter: 'blur(4px)' },
  contactRow: { display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' },
  contactInfo: { flex: 1, minWidth: 260 },
  contactItem: { marginBottom: 12, fontSize: 15, color: '#444' },
  link: { color: '#e63946', textDecoration: 'none', fontWeight: 600 },
  mapContainer: { flex: 2, minWidth: 300 },
  footer: { background: '#1d3557', color: '#fff', textAlign: 'center', padding: '24px 40px' },
};
