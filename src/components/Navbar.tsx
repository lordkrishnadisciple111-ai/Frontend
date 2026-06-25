import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🌾</span>
        <span>KisanSetu AI</span>
      </Link>

      <div className="navbar-links">
        {user?.role === 'farmer' && (
          <>
            <Link to="/farmer/dashboard">Dashboard</Link>
            <Link to="/farmer/add-crop">Add Crop</Link>
            <Link to="/farmer/ai-prediction">AI Price</Link>
            <Link to="/farmer/recommendations">Buyers</Link>
            <Link to="/chat">Chat</Link>
          </>
        )}
        {user?.role === 'buyer' && (
          <>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/chat">Chat</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin">Admin Panel</Link>
        )}
      </div>

      {user && (
        <div className="navbar-user">
          <span className="user-badge">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
