import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminUser');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;


