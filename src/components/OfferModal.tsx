import { useState } from 'react';
import type { CropListing } from '../services/cropService';

interface Props {
  crop: CropListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number) => Promise<void>;
}

export default function OfferModal({ crop, isOpen, onClose, onSubmit }: Props) {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !crop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (!numPrice || numPrice <= 0) return;

    setLoading(true);
    try {
      await onSubmit(numPrice);
      setPrice('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <h2>Make an Offer</h2>
        <p className="modal-subtitle">{crop.cropName} — Listed at ₹{crop.price}/kg</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Offer Price (₹/kg)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter your offer price"
              min="1"
              step="0.5"
              required
            />
          </div>

          {price && (
            <p className="offer-total">
              Total for {crop.quantity} kg: ₹{(parseFloat(price) * crop.quantity).toLocaleString()}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
