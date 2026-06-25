import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import AddCrop from './pages/AddCrop';
import FarmerDashboard from './pages/FarmerDashboard';
import Chat from './pages/Chat';
import PricePrediction from './pages/PricePrediction';
import BuyerRecommendations from './pages/BuyerRecommendations';
import AdminDashboard from './pages/AdminDashboard';
import { useStore } from './store/useStore';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function HomeRedirect() {
  const user = useStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  const routes: Record<string, string> = {
    farmer: '/farmer/dashboard',
    buyer: '/marketplace',
    admin: '/admin',
  };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <HomeRedirect /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <HomeRedirect /> : <Register />} />

        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <AppLayout><Marketplace /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AppLayout><FarmerDashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/add-crop"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AppLayout><AddCrop /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/ai-prediction"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AppLayout><PricePrediction /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/recommendations"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AppLayout><BuyerRecommendations /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'buyer']}>
              <AppLayout><Chat /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
