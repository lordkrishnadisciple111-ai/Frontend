export default function SkeletonLoader({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'text' | 'chart' }) {
  return (
    <div className={`skeleton-grid skeleton-${type}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-item" />
      ))}
    </div>
  );
}
