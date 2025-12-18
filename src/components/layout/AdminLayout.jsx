import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography, Space, Badge } from 'antd';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { showConfirm } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import { clubLeaderRequestAPI } from '../../services/api';
import { NotificationBell } from '../NotificationBell';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await clubLeaderRequestAPI.getPending();
        const requestsData = Array.isArray(response.data) ? response.data : [];
        setPendingRequestsCount(requestsData.length);
      } catch (error) {
        console.error('Error loading pending requests count:', error);
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, 15000);

    const handleRequestProcessed = () => {
      loadPendingCount();
    };
    window.addEventListener('requestProcessed', handleRequestProcessed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('requestProcessed', handleRequestProcessed);
    };
  }, []);

  const handleLogout = async () => {
    const result = await showConfirm('Bạn có chắc chắn muốn đăng xuất?', 'Xác nhận đăng xuất');
    if (result.isConfirmed) {
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const iconSize = getIconSize('md');

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <HomeIcon style={iconSize} />,
      label: 'Trang chủ',
    },
    {
      key: '/admin/requests',
      icon: <DocumentTextIcon style={iconSize} />,
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingRight: '8px',
          }}
        >
          <span style={{ flex: 1 }}>Duyệt yêu cầu Leader</span>
          {pendingRequestsCount > 0 && (
            <Badge
              count={pendingRequestsCount}
              style={{
                backgroundColor: '#ff4d4f',
                marginLeft: '8px',
                boxShadow: '0 0 0 1px #fff',
                fontSize: '12px',
                height: '20px',
                lineHeight: '20px',
                minWidth: '20px',
                borderRadius: '10px',
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: '/admin/clubs',
      icon: <BuildingOfficeIcon style={iconSize} />,
      label: 'Giám sát CLB',
    },
    {
      key: '/admin/activities',
      icon: <CalendarIcon style={iconSize} />,
      label: 'Quản lý Hoạt động',
    },
    {
      key: '/admin/accounts',
      icon: <UsersIcon style={iconSize} />,
      label: 'Quản lý Tài khoản',
    },
    {
      key: '/admin/reports',
      icon: <ChartBarIcon style={iconSize} />,
      label: 'Báo cáo tổng hợp',
    },
  ];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          transform: 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
        }}
      >
        <div className="sidebar-header">
          <div className="logo">
            {collapsed ? (
              <div className="logo-collapsed-container">
                <span className="logo-text-collapsed">SCM</span>
                <Button
                  type="text"
                  icon={<Bars3Icon style={iconSize} />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="sidebar-trigger-collapsed"
                />
              </div>
            ) : (
              <>
                <span className="logo-text">Student Club Management</span>
                <Button
                  type="text"
                  icon={<XMarkIcon style={iconSize} />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="sidebar-trigger"
                />
              </>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="sidebar-menu"
          onClick={handleMenuClick}
        />

        <div className="sidebar-footer">
          <Button
            type="text"
            danger
            icon={<ArrowRightOnRectangleIcon style={iconSize} />}
            onClick={handleLogout}
            className="logout-btn"
            block
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </div>
      </Sider>

      <Layout
        className="main-layout"
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: '100%',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Header className="admin-header">
          <div className="header-content">
            <Typography.Title
              level={4}
              style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 600 }}
            >
              Hệ thống Quản lý Câu lạc bộ Sinh viên
            </Typography.Title>
            <Space align="center" size="middle">
              <NotificationBell />
              <Avatar
                icon={<UserIcon style={getIconSize('sm')} />}
                style={{ display: 'flex', alignItems: 'center' }}
              />
              <Text style={{ color: '#fff', fontSize: '14px', lineHeight: '32px' }}>
                Quản trị viên
              </Text>
            </Space>
          </div>
        </Header>
        <Content className="page-content" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;


