import { useEffect, useState } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { adminService } from '../services/adminService';
import { useStore } from '../store/useStore';

export default function AdminDashboard() {
  const adminAnalytics = useStore((s) => s.adminAnalytics);
  const setAdminAnalytics = useStore((s) => s.setAdminAnalytics);
  const addToast = useStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getAnalytics();
        if (res.success) setAdminAnalytics(res.data);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setAdminAnalytics, addToast]);

  if (loading) return <SkeletonLoader count={4} type="chart" />;

  const data = adminAnalytics || {};
  const analytics = (data.analytics as Record<string, number>) || {};
  const monthlySales = (data.monthlySales as Array<{ month: string; revenue: number; deals: number }>) || [];
  const cropCategories = (data.cropCategories as Array<{ name: string; value: number }>) || [];
  const suspiciousUsers = (data.suspiciousUsers as Array<{
    name: string;
    email: string;
    role: string;
    reputationScore: number;
    reason: string;
  }>) || [];

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Platform analytics and monitoring</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass admin-stat">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{analytics.totalUsers || 0}</span>
        </div>
        <div className="stat-card glass admin-stat">
          <span className="stat-label">Farmers</span>
          <span className="stat-value">{analytics.totalFarmers || 0}</span>
        </div>
        <div className="stat-card glass admin-stat">
          <span className="stat-label">Buyers</span>
          <span className="stat-value">{analytics.totalBuyers || 0}</span>
        </div>
        <div className="stat-card glass admin-stat">
          <span className="stat-label">Listings</span>
          <span className="stat-value">{analytics.totalListings || 0}</span>
        </div>
        <div className="stat-card glass admin-stat">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{analytics.totalTransactions || 0}</span>
        </div>
        <div className="stat-card glass admin-stat warning">
          <span className="stat-label">Suspicious Users</span>
          <span className="stat-value">{analytics.suspiciousUsersCount || 0}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card glass">
          <h3>Monthly Revenue</h3>
          <div className="bar-chart">
            {monthlySales.map((item) => (
              <div key={item.month} className="bar-item">
                <div className="bar admin-bar" style={{ height: `${(item.revenue / maxRevenue) * 100}%` }} />
                <span className="bar-label">{item.month}</span>
                <span className="bar-value">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass">
          <h3>Crop Categories</h3>
          <div className="category-chart">
            {cropCategories.map((cat) => (
              <div key={cat.name} className="category-item">
                <div className="category-bar-wrap">
                  <div className="category-bar" style={{ width: `${cat.value}%` }} />
                </div>
                <span>{cat.name}</span>
                <span>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="suspicious-card glass">
        <h3>⚠️ Suspicious Users</h3>
        {suspiciousUsers.length === 0 ? (
          <p className="empty-text">No suspicious users detected</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Score</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousUsers.map((u, i) => (
                <tr key={i}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.reputationScore}</td>
                  <td>{u.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
