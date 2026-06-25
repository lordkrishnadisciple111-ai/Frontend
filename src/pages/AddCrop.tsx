import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cropService } from '../services/cropService';
import { useStore } from '../store/useStore';
import type { CropListing } from '../services/cropService';

interface FormData {
  cropName: string;
  category: string;
  quantity: number;
  price: number;
  location: string;
  description: string;
}

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds'];

export default function AddCrop() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const user = useStore((s) => s.user);
  const addCropOptimistic = useStore((s) => s.addCropOptimistic);
  const addToast = useStore((s) => s.addToast);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageAdd = () => {
    if (imageInput.trim()) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Cloudinary upload via unsigned preset or direct URL fallback
      const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
      if (cloudinaryUrl) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'kisansetu');
        const res = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
          setImageUrls([...imageUrls, data.secure_url]);
          addToast('success', 'Image uploaded to Cloudinary');
        }
      } else {
        // Local preview fallback — use object URL for demo
        const localUrl = URL.createObjectURL(file);
        setImageUrls([...imageUrls, localUrl]);
        addToast('info', 'Image added locally (configure Cloudinary for cloud upload)');
      }
    } catch {
      addToast('error', 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const optimisticCrop: CropListing = {
        _id: `temp-${Date.now()}`,
        cropName: data.cropName,
        category: data.category,
        quantity: data.quantity,
        price: data.price,
        location: data.location,
        description: data.description,
        imageUrls,
        farmer: {
          _id: user?.id || '',
          name: user?.name || 'You',
          location: user?.location || '',
        },
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      addCropOptimistic(optimisticCrop);

      const res = await cropService.create({
        ...data,
        imageUrls,
      });

      if (res.success) {
        addToast('success', 'Crop listing created successfully!');
        reset();
        setImageUrls([]);
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  return (
    <div className="page add-crop-page">
      <div className="page-header">
        <h1>🌱 Add New Crop Listing</h1>
        <p>List your crop on the marketplace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-card glass">
        <div className="form-row">
          <div className="form-group">
            <label>Crop Name</label>
            <input {...register('cropName', { required: 'Required' })} placeholder="e.g. Premium Wheat" />
            {errors.cropName && <span className="error">{errors.cropName.message}</span>}
          </div>
          <div className="form-group">
            <label>Category</label>
            <select {...register('category', { required: 'Required' })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="error">{errors.category.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity (kg)</label>
            <input type="number" {...register('quantity', { required: 'Required', min: 1 })} placeholder="4500" />
            {errors.quantity && <span className="error">{errors.quantity.message}</span>}
          </div>
          <div className="form-group">
            <label>Price (₹/kg)</label>
            <input type="number" step="0.5" {...register('price', { required: 'Required', min: 1 })} placeholder="26" />
            {errors.price && <span className="error">{errors.price.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input {...register('location', { required: 'Required' })} placeholder="Ludhiana, Punjab" />
          {errors.location && <span className="error">{errors.location.message}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea {...register('description', { required: 'Required' })} rows={3} placeholder="Describe your crop quality..." />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        <div className="form-group">
          <label>Crop Images</label>
          <div className="image-upload-area">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            <div className="image-url-input">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Or paste image URL"
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleImageAdd}>Add</button>
            </div>
          </div>
          {imageUrls.length > 0 && (
            <div className="image-preview-grid">
              {imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`Crop ${i + 1}`} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting || uploading}>
          {isSubmitting ? 'Creating listing...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
