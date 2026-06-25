import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';

interface FormData {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'buyer';
  location: string;
}

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { role: 'farmer', location: 'Punjab, India' },
  });
  const addToast = useStore((s) => s.addToast);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.register(data);
      if (res.success) {
        addToast('success', 'Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <span className="brand-icon-lg">🌾</span>
          <h1>Create Account</h1>
          <p>Join the KisanSetu marketplace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input {...register('name', { required: 'Name is required' })} placeholder="Your name" />
            {errors.name && <span className="error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} placeholder="email@example.com" />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              placeholder="Min 6 characters"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select {...register('role')}>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input {...register('location')} placeholder="Punjab, India" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
