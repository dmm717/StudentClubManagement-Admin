import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ProtectedRoute } from '../components';

const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const Login = lazy(() => import('../pages/admin/Login'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Clubs = lazy(() => import('../pages/admin/Clubs'));
const Requests = lazy(() => import('../pages/admin/Requests'));
const Accounts = lazy(() => import('../pages/admin/Accounts'));
const Activities = lazy(() => import('../pages/admin/Activities'));
const Reports = lazy(() => import('../pages/admin/Reports'));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />

        <Route path="/admin/login" element={<Login />} />

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
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;


