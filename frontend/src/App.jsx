import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiBarChart2, FiList, FiTarget, FiDollarSign } from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import WeeklyReport from './pages/WeeklyReport';
import MonthlyReport from './pages/MonthlyReport';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';

function Sidebar() {
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
        <div className="user-card">
          <div className="user-avatar">U</div>
          <div className="user-info">
            <div className="user-name">User</div>
            <div className="user-role">Personal Account</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
