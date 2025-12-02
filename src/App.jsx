import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Clubs from './pages/admin/Clubs';
import ClubForm from './pages/admin/ClubForm';
import Members from './pages/admin/Members';
import MemberForm from './pages/admin/MemberForm';
import Fees from './pages/admin/Fees';
import Requests from './pages/admin/Requests';
import Reports from './pages/admin/Reports';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminUser');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <ConfigProvider>
      <Router>
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
          
          {/* Clubs Routes */}
          <Route path="clubs" element={<Clubs />} />
          <Route path="clubs/new" element={<ClubForm />} />
          <Route path="clubs/:id/edit" element={<ClubForm />} />
          
          {/* Members Routes */}
          <Route path="members" element={<Members />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="members/:id/edit" element={<MemberForm />} />
          
          {/* Other Routes */}
          <Route path="requests" element={<Requests />} />
          <Route path="fees" element={<Fees />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
