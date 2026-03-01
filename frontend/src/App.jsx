import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FiHome, FiCalendar, FiBarChart2, FiList, FiTarget, FiLogOut, FiRepeat, FiTrendingUp, FiRefreshCw, FiPlus, FiLock } from 'react-icons/fi';
import { getUserProfile, uploadProfilePicture } from './api';
import { useCurrency, CURRENCIES } from './context/CurrencyContext.jsx';
import Dashboard from './pages/Dashboard';
import WeeklyReport from './pages/WeeklyReport';
import MonthlyReport from './pages/MonthlyReport';
import Transactions from './pages/Transactions';
import RecurringTransactions from './pages/RecurringTransactions';
import FutureTrends from './pages/FutureTrends';
import Budgets from './pages/Budgets';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import QuickAddModal from './components/QuickAddModal';
import ChangePasswordModal from './components/ChangePasswordModal';

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('financeiq_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}



function Sidebar() {
  const navigate = useNavigate();
  const { currency, setCurrency, rate, rateLoading, rateError, lastUpdated, refreshRate } = useCurrency();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const username = sessionStorage.getItem('financeiq_username') || 'User';

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(err => console.error('Failed to fetch profile', err));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('financeiq_token');
    sessionStorage.removeItem('financeiq_username');
    navigate('/login');
  };

  const onAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const updatedProfile = await uploadProfilePicture(formData);
      setProfile(updatedProfile);
    } catch (err) {
      alert('Failed to upload profile picture');
      console.error(err);
    }
  };

  const navItems = [
    { to: '/', icon: <FiHome />, label: 'Dashboard' },
    { to: '/weekly', icon: <FiCalendar />, label: 'Weekly Report' },
    { to: '/monthly', icon: <FiBarChart2 />, label: 'Monthly Report' },
    { to: '/transactions', icon: <FiList />, label: 'Transactions' },
    { to: '/recurring-transactions', icon: <FiRepeat />, label: 'Recurring' },
    { to: '/future-trends', icon: <FiTrendingUp />, label: 'Future Trends' },
    { to: '/budgets', icon: <FiTarget />, label: 'Budgets' },
  ];

  const backendPort = import.meta.env.VITE_BACKEND_PORT || 8080;
  const baseUrl = `http://localhost:${backendPort}`;
  const avatarUrl = profile?.profilePictureUrl ? `${baseUrl}${profile.profilePictureUrl}` : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <div>
          <h1>FinanceIQ</h1>
          <span>Smart Finance Tracker</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Currency Selector */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Currency</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="form-select"
            style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
          >
            {Object.entries(CURRENCIES).map(([code, meta]) => (
              <option key={code} value={code}>{meta.symbol} {code} — {meta.label}</option>
            ))}
          </select>
          <button
            onClick={refreshRate}
            disabled={rateLoading || currency === 'INR'}
            title="Refresh live rate"
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
          >
            <FiRefreshCw size={13} style={{ animation: rateLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        <div style={{ marginTop: 5, fontSize: '0.7rem', color: rateError ? 'var(--danger)' : 'var(--text-muted)' }}>
          {rateLoading && '⏳ Fetching live rate…'}
          {!rateLoading && rateError && `⚠ ${rateError}`}
          {!rateLoading && !rateError && currency !== 'INR' && `1 INR = ${rate.toFixed(4)} ${currency}`}
          {!rateLoading && !rateError && currency !== 'INR' && lastUpdated && (
            <span style={{ marginLeft: 6, opacity: 0.6 }}>· {lastUpdated.toLocaleTimeString()}</span>
          )}
          {currency === 'INR' && <span style={{ color: 'var(--accent-green)' }}>Base currency</span>}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="user-avatar"
              onClick={onAvatarClick}
              style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Click to change profile picture"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="user-info">
              <div className="user-name" style={{ textTransform: 'capitalize' }}>{username}</div>
              <div className="user-role">Personal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <button onClick={() => setShowChangePassword(true)} title="Change Password" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8 }}>
              <FiLock size={16} />
            </button>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 8 }}>
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </aside>
  );
}


function MainLayout() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <div className="app-layout">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translate(-50%, -54%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fabPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weekly" element={<WeeklyReport />} />
            <Route path="/monthly" element={<MonthlyReport />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/recurring-transactions" element={<RecurringTransactions />} />
            <Route path="/future-trends" element={<FutureTrends />} />
            <Route path="/budgets" element={<Budgets />} />
          </Routes>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        title="Quick add transaction"
        style={{
          position: 'fixed', bottom: 32, right: 32,
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f8ef7, #7c5cf7)',
          border: 'none', color: '#fff', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(79,142,247,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', zIndex: 900,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,142,247,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(79,142,247,0.45)'; }}
      >
        <FiPlus size={24} />
      </button>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
