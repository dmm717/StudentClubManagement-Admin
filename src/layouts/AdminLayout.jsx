import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography, Space } from 'antd';
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
  CalendarIcon
} from '@heroicons/react/24/outline';
import { showConfirm } from '../utils/notifications';
import { getIconSize } from '../utils/iconSizes';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await showConfirm('Bạn có chắc chắn muốn đăng xuất?', 'Xác nhận đăng xuất');
    if (result.isConfirmed) {
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const iconSize = getIconSize('md'); // 20x20 for menu icons

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <HomeIcon style={iconSize} />,
      label: 'Trang chủ'
    },
    {
      key: '/admin/requests',
      icon: <DocumentTextIcon style={iconSize} />,
      label: 'Duyệt yêu cầu Leader'
    },
    {
      key: '/admin/clubs',
      icon: <BuildingOfficeIcon style={iconSize} />,
      label: 'Giám sát CLB'
    },
    {
      key: '/admin/activities',
      icon: <CalendarIcon style={iconSize} />,
      label: 'Quản lý Hoạt động'
    },
    {
      key: '/admin/accounts',
      icon: <UsersIcon style={iconSize} />,
      label: 'Quản lý Tài khoản'
    }
  ];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
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
          zIndex: 1000
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
          marginLeft: collapsed ? 80 : 250,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: '100%',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Header className="admin-header">
          <div className="header-content">
            <Typography.Title level={4} style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 600 }}>
              Hệ thống Quản lý Câu lạc bộ Sinh viên
            </Typography.Title>
            <Space>
              <Avatar icon={<UserIcon style={getIconSize('sm')} />} />
              <Text style={{ color: '#fff', fontSize: '14px' }}>Quản trị viên</Text>
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

