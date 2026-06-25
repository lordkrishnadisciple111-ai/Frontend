import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const setAuth = useStore((s) => s.setAuth);
  const addToast = useStore((s) => s.addToast);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.login(data.email, data.password);
      if (res.success && res.token) {
        setAuth(res.user, res.token);
        addToast('success', 'Login successful!');

        const routes: Record<string, string> = {
          farmer: '/farmer/dashboard',
          buyer: '/marketplace',
          admin: '/admin',
        };
        navigate(routes[res.role] || '/');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <span className="brand-icon-lg">🌾</span>
          <h1>Welcome Back</h1>
          <p>Sign in to KisanSetu AI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="farmer@kisansetu.com"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="password123"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p>Demo accounts (password: password123)</p>
          <div className="demo-badges">
            <span>farmer@kisansetu.com</span>
            <span>buyer@kisansetu.com</span>
            <span>admin@kisansetu.com</span>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
