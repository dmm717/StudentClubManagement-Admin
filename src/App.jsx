import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Clubs from './pages/admin/Clubs';
import Requests from './pages/admin/Requests';
import Accounts from './pages/admin/Accounts';
import Activities from './pages/admin/Activities';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminUser');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <ConfigProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <Routes>
        {/* Redirect root to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="requests" element={<Requests />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="activities" element={<Activities />} />
        </Route>
      </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
