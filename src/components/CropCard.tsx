import type { CropListing } from '../services/cropService';

interface Props {
  crop: CropListing;
  onMakeOffer?: (crop: CropListing) => void;
  onContact?: (crop: CropListing) => void;
  showActions?: boolean;
}

export default function CropCard({ crop, onMakeOffer, onContact, showActions = true }: Props) {
  const imageUrl = crop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="crop-card glass">
      <div className="crop-card-image">
        <img src={imageUrl} alt={crop.cropName} loading="lazy" />
        <span className="crop-category">{crop.category}</span>
      </div>
      <div className="crop-card-body">
        <h3>{crop.cropName}</h3>
        <p className="crop-location">📍 {crop.location}</p>
        <p className="crop-desc">{crop.description}</p>
        <div className="crop-meta">
          <span className="crop-price">₹{crop.price}/kg</span>
          <span className="crop-qty">{crop.quantity} kg</span>
        </div>
        {crop.farmer && (
          <div className="crop-farmer">
            <span>By {crop.farmer.name}</span>
            {crop.farmer.reputationScore && (
              <span className="rep-score">★ {crop.farmer.reputationScore}</span>
            )}
          </div>
        )}
        {showActions && (
          <div className="crop-actions">
            {onMakeOffer && (
              <button className="btn btn-primary" onClick={() => onMakeOffer(crop)}>
                Make Offer
              </button>
            )}
            {onContact && (
              <button className="btn btn-secondary" onClick={() => onContact(crop)}>
                Contact Farmer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
