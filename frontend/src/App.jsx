import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiBarChart2, FiList, FiTarget, FiLogOut } from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import WeeklyReport from './pages/WeeklyReport';
import MonthlyReport from './pages/MonthlyReport';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('financeiq_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Sidebar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('financeiq_username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('financeiq_token');
    localStorage.removeItem('financeiq_username');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <FiHome />, label: 'Dashboard' },
    { to: '/weekly', icon: <FiCalendar />, label: 'Weekly Report' },
    { to: '/monthly', icon: <FiBarChart2 />, label: 'Monthly Report' },
    { to: '/transactions', icon: <FiList />, label: 'Transactions' },
    { to: '/budgets', icon: <FiTarget />, label: 'Budgets' },
  ];

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

      <div className="sidebar-footer">
        <div className="user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name" style={{ textTransform: 'capitalize' }}>{username}</div>
              <div className="user-role">Personal</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 8 }}>
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weekly" element={<WeeklyReport />} />
            <Route path="/monthly" element={<MonthlyReport />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
          </Routes>
        </div>
      </div>
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
