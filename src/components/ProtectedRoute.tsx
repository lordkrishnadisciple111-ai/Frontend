import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  allowedRoles?: ('farmer' | 'buyer' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const user = useStore((s) => s.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      farmer: '/farmer/dashboard',
      buyer: '/marketplace',
      admin: '/admin',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
}
