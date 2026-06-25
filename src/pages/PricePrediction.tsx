import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SkeletonLoader from '../components/SkeletonLoader';
import { aiService } from '../services/aiService';
import { useStore } from '../store/useStore';

interface FormData {
  cropType: string;
  quantity: number;
  location: string;
  harvestDate: string;
  season: string;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toFixed(1)}{suffix}</span>;
}

export default function PricePrediction() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      cropType: 'Wheat',
      quantity: 4500,
      location: 'Punjab',
      harvestDate: '2026-04-15',
      season: 'Rabi',
    },
  });

  const predictionResult = useStore((s) => s.predictionResult);
  const setPredictionResult = useStore((s) => s.setPredictionResult);
  const addToast = useStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await aiService.predictPrice(data);
      if (res.success) {
        setPredictionResult(res.data as Record<string, unknown>);
        addToast('success', 'AI price prediction complete!');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const trendGraph = (predictionResult?.trendGraph as Array<{ month: string; price: number }>) || [];
  const maxPrice = Math.max(...trendGraph.map((t) => t.price), 1);

  return (
    <div className="page prediction-page">
      <div className="page-header">
        <h1>🤖 AI Price Prediction</h1>
        <p>Get fair market price estimates powered by ML</p>
      </div>

      <div className="prediction-grid">
        <form onSubmit={handleSubmit(onSubmit)} className="form-card glass">
          <div className="form-group">
            <label>Crop Type</label>
            <input {...register('cropType', { required: true })} placeholder="Wheat, Rice, Tomato..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input type="number" {...register('quantity', { required: true, min: 1 })} />
            </div>
            <div className="form-group">
              <label>Season</label>
              <select {...register('season')}>
                <option value="Rabi">Rabi</option>
                <option value="Kharif">Kharif</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input {...register('location', { required: true })} placeholder="Punjab" />
            </div>
            <div className="form-group">
              <label>Harvest Date</label>
              <input type="date" {...register('harvestDate', { required: true })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting || loading}>
            {loading ? 'Analyzing market data...' : 'Predict Price'}
          </button>
        </form>

        <div className="prediction-result glass">
          {loading ? (
            <SkeletonLoader count={2} type="chart" />
          ) : predictionResult ? (
            <>
              <div className="prediction-hero">
                <div className="prediction-price">
                  <span className="prediction-label">Predicted Price</span>
                  <span className="prediction-value">
                    ₹<AnimatedCounter value={predictionResult.predictedPrice as number} />
                    <span className="per-kg">/kg</span>
                  </span>
                </div>
                <div className="prediction-confidence">
                  <span className="prediction-label">Confidence</span>
                  <span className="confidence-value">
                    <AnimatedCounter value={predictionResult.confidence as number} suffix="%" />
                  </span>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${predictionResult.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {trendGraph.length > 0 && (
                <div className="trend-chart">
                  <h3>Market Trend (6 months)</h3>
                  <div className="line-chart">
                    {trendGraph.map((point) => (
                      <div key={point.month} className="trend-point">
                        <div
                          className="trend-bar"
                          style={{ height: `${(point.price / maxPrice) * 100}%` }}
                        />
                        <span>{point.month}</span>
                        <span className="trend-price">₹{point.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="prediction-empty">
              <span className="brand-icon-lg">🤖</span>
              <p>Enter crop details and click Predict Price to get AI-powered market estimates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
