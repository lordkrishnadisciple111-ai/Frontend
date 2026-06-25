import { useEffect, useState } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { farmerService } from '../services/adminService';
import { offerService } from '../services/offerService';
import { useStore } from '../store/useStore';

export default function FarmerDashboard() {
  const dashboardData = useStore((s) => s.dashboardData);
  const setDashboardData = useStore((s) => s.setDashboardData);
  const addToast = useStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await farmerService.getDashboard();
        if (res.success) setDashboardData(res.data);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setDashboardData, addToast]);

  const handleOfferAction = async (offerId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(offerId);
    try {
      await offerService.updateStatus(offerId, status);
      addToast('success', `Offer ${status}!`);
      const res = await farmerService.getDashboard();
      if (res.success) setDashboardData(res.data);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <SkeletonLoader count={4} type="chart" />;

  const data = dashboardData || {};
  const salesChart = (data.salesChart as Array<{ month: string; sales: number }>) || [];
  const buyerOffers = (data.buyerOffers as Array<{
    _id: string;
    crop: { cropName: string; price: number };
    buyer: { name: string; location: string };
    offeredPrice: number;
    createdAt: string;
  }>) || [];
  const recentTransactions = (data.recentTransactions as Array<{
    cropName: string;
    buyerName: string;
    totalAmount: number;
    date: string;
  }>) || [];

  const maxSales = Math.max(...salesChart.map((s) => s.sales), 1);

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>🌾 Farmer Dashboard</h1>
        <p>Your farm business at a glance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <span className="stat-label">Active Listings</span>
          <span className="stat-value">{data.activeListings as number || 0}</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-label">Pending Offers</span>
          <span className="stat-value">{data.pendingOffersCount as number || 0}</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">₹{(data.revenue as number || 0).toLocaleString()}</span>
        </div>
        <div className="stat-card glass">
          <span className="stat-label">Total Stock (kg)</span>
          <span className="stat-value">{(data.totalCropsQty as number || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card glass">
          <h3>Monthly Sales</h3>
          <div className="bar-chart">
            {salesChart.map((item) => (
              <div key={item.month} className="bar-item">
                <div
                  className="bar"
                  style={{ height: `${(item.sales / maxSales) * 100}%` }}
                />
                <span className="bar-label">{item.month}</span>
                <span className="bar-value">₹{item.sales.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="offers-card glass">
          <h3>Buyer Offers</h3>
          {buyerOffers.length === 0 ? (
            <p className="empty-text">No pending offers</p>
          ) : (
            <div className="offers-list">
              {buyerOffers.map((offer) => (
                <div key={offer._id} className="offer-item">
                  <div className="offer-info">
                    <strong>{offer.crop?.cropName}</strong>
                    <span>{offer.buyer?.name} — ₹{offer.offeredPrice}/kg</span>
                    <span className="offer-listed">Listed: ₹{offer.crop?.price}/kg</span>
                  </div>
                  <div className="offer-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === offer._id}
                      onClick={() => handleOfferAction(offer._id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={actionLoading === offer._id}
                      onClick={() => handleOfferAction(offer._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="transactions-card glass">
        <h3>Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p className="empty-text">No transactions yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, i) => (
                <tr key={i}>
                  <td>{tx.cropName}</td>
                  <td>{tx.buyerName}</td>
                  <td>₹{tx.totalAmount.toLocaleString()}</td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
