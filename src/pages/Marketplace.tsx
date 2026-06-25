import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CropCard from '../components/CropCard';
import OfferModal from '../components/OfferModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { cropService, type CropListing } from '../services/cropService';
import { offerService } from '../services/offerService';
import { useStore } from '../store/useStore';

export default function Marketplace() {
  const crops = useStore((s) => s.crops);
  const setCrops = useStore((s) => s.setCrops);
  const addToast = useStore((s) => s.addToast);
  const user = useStore((s) => s.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ state: '', category: '', maxPrice: '', search: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchCrops = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await cropService.getAll({
        state: filters.state || undefined,
        category: filters.category || undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        search: debouncedSearch || undefined,
        page: pageNum,
        limit: 6,
      });

      if (res.success) {
        const newCrops = res.data as CropListing[];
        if (append) {
          const currentCrops = useStore.getState().crops;
          setCrops([...currentCrops, ...newCrops], res.pagination);
        } else {
          setCrops(newCrops, res.pagination);
        }
        setHasMore(pageNum < res.pagination.pages);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load crops');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters.state, filters.category, filters.maxPrice, debouncedSearch, setCrops, addToast]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCrops(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state, filters.category, filters.maxPrice, debouncedSearch]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCrops(nextPage, true);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchCrops]);

  const handleOffer = async (price: number) => {
    if (!selectedCrop) return;
    await offerService.create(selectedCrop._id, price);
    addToast('success', 'Offer submitted successfully!');
  };

  const handleContact = (crop: CropListing) => {
    const farmerId = crop.farmer?._id;
    if (farmerId) navigate(`/chat?contact=${farmerId}`);
  };

  return (
    <div className="page marketplace-page">
      <div className="page-header">
        <h1>🛒 Marketplace</h1>
        <p>Browse fresh crops from verified farmers</p>
      </div>

      <div className="filter-bar glass">
        <input
          type="text"
          placeholder="Search crops..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="State / Location"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Grains">Grains</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Pulses">Pulses</option>
        </select>
        <input
          type="number"
          placeholder="Max price ₹/kg"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="filter-input"
        />
      </div>

      {loading ? (
        <SkeletonLoader count={6} type="card" />
      ) : crops.length === 0 ? (
        <div className="empty-state glass">
          <p>No crops found matching your filters.</p>
        </div>
      ) : (
        <div className="crop-grid">
          {crops.map((crop) => (
            <CropCard
              key={crop._id}
              crop={crop}
              showActions={user?.role === 'buyer'}
              onMakeOffer={(c) => {
                setSelectedCrop(c);
                setOfferOpen(true);
              }}
              onContact={handleContact}
            />
          ))}
        </div>
      )}

      {loadingMore && <div className="loading-more">Loading more...</div>}
      <div ref={loadMoreRef} className="load-more-trigger" />

      <OfferModal
        crop={selectedCrop}
        isOpen={offerOpen}
        onClose={() => setOfferOpen(false)}
        onSubmit={handleOffer}
      />
    </div>
  );
}
