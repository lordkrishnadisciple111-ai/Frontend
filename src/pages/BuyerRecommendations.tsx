import { useEffect, useState } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { aiService } from '../services/aiService';
import { useStore } from '../store/useStore';

interface BuyerRecommendation {
  buyerId: string;
  name: string;
  location: string;
  reputationScore: number;
  distanceKm: number;
  transportCostPerKg: number;
  matchScore: number;
}

export default function BuyerRecommendations() {
  const buyerRecommendations = useStore((s) => s.buyerRecommendations);
  const setBuyerRecommendations = useStore((s) => s.setBuyerRecommendations);
  const addToast = useStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiService.getBestBuyers();
        if (res.success) setBuyerRecommendations(res.data as BuyerRecommendation[]);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setBuyerRecommendations, addToast]);

  if (loading) return <SkeletonLoader count={3} type="card" />;

  const buyers = buyerRecommendations as BuyerRecommendation[];

  return (
    <div className="page recommendations-page">
      <div className="page-header">
        <h1>🎯 Best Buyer Recommendations</h1>
        <p>AI-ranked buyers based on reputation, distance, and reliability</p>
      </div>

      {buyers.length === 0 ? (
        <div className="empty-state glass">
          <p>No buyer recommendations available.</p>
        </div>
      ) : (
        <div className="recommendation-grid">
          {buyers.map((buyer, index) => (
            <div
              key={buyer.buyerId}
              className={`recommendation-card glass ${index === 0 ? 'best-match' : ''}`}
            >
              {index === 0 && <span className="best-badge">Best Match</span>}
              <div className="rec-header">
                <div className="rec-avatar">{buyer.name[0]}</div>
                <div>
                  <h3>{buyer.name}</h3>
                  <p>📍 {buyer.location}</p>
                </div>
                <div className="match-score">
                  <span className="score-value">{buyer.matchScore}</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
              <div className="rec-details">
                <div className="rec-detail">
                  <span>Reputation</span>
                  <span>★ {buyer.reputationScore}</span>
                </div>
                <div className="rec-detail">
                  <span>Distance</span>
                  <span>{buyer.distanceKm} km</span>
                </div>
                <div className="rec-detail">
                  <span>Transport Cost</span>
                  <span>₹{buyer.transportCostPerKg}/kg</span>
                </div>
              </div>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${buyer.matchScore}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
