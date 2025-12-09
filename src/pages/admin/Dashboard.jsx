import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Spin } from 'antd';
import {
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { clubsAPI, clubLeaderRequestAPI, accountsAPI } from '../../services/api';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getIconSize } from '../../utils/iconSizes';
import './Dashboard.css';

const { Title, Text } = Typography;

/**
 * Component Dashboard - Trang chủ quản trị hệ thống
 * Hiển thị tổng quan thống kê và các quick actions
 */
const Dashboard = () => {
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);
  
  // State lưu trữ các thống kê chính
  const [stats, setStats] = useState({
    totalClubs: 0,           // Tổng số câu lạc bộ
    activeClubs: 0,          // Số CLB đang hoạt động
    totalAccounts: 0,        // Tổng số tài khoản
    pendingRequests: 0,      // Số yêu cầu chờ duyệt
    totalRevenue: 0          // Tổng doanh thu
  });

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Hàm load dữ liệu dashboard từ các API
   * Gọi đồng thời 3 API: clubs, requests, accounts
   */
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load data from available APIs
      const [clubsResponse, requestsResponse, accountsResponse] = await Promise.all([
        clubsAPI.getAll().catch(() => ({ data: [] })),
        clubLeaderRequestAPI.getPending().catch(() => ({ data: [] })),
        accountsAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const clubs = clubsResponse.data || [];
      const requests = requestsResponse.data || [];
      const accounts = accountsResponse.data || [];
      
      // TODO: Backend chưa có API revenue
      // const revenueResponse = await clubsAPI.getAllRevenue().catch(() => ({ data: { total: 0 } }));
      const revenue = 0; // revenueResponse.data?.total || 0;

      setStats({
        totalClubs: clubs.length || 0,
        activeClubs: clubs.filter(c => c.isActive).length || 0,
        totalAccounts: accounts.length || 0,
        pendingRequests: requests.length || 0,
        totalRevenue: revenue
      });
    } catch (error) {
      // Silent fail for dashboard data loading
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm format số tiền theo định dạng VND
   * @param {number} amount - Số tiền cần format
   * @returns {string} - Chuỗi đã format (ví dụ: "1.000.000 ₫")
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const iconXl = getIconSize('2xl');

  /**
   * Mảng cấu hình các card thống kê
   * Mỗi card hiển thị một chỉ số quan trọng với icon và link đến trang chi tiết
   */
  const statsCards = [
    {
      title: 'Tổng số CLB',
      value: stats.totalClubs,
      subtitle: `${stats.activeClubs} đang hoạt động`,
      icon: <BuildingOfficeIcon style={iconXl} />,
      color: '#1890ff',
      link: '/admin/clubs'
    },
    {
      title: 'Tổng tài khoản',
      value: stats.totalAccounts,
      subtitle: 'Tất cả tài khoản hệ thống',
      icon: <UserCircleIcon style={iconXl} />,
      color: '#52c41a',
      link: '/admin/accounts'
    },
    {
      title: 'Yêu cầu Club Leader',
      value: stats.pendingRequests,
      subtitle: 'Chờ duyệt',
      icon: <DocumentTextIcon style={iconXl} />,
      color: '#faad14',
      link: '/admin/requests'
    },
    {
      title: 'Tổng doanh thu phí',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Tất cả câu lạc bộ',
      icon: <CurrencyDollarIcon style={iconXl} />,
      color: '#52c41a',
      link: '/admin/clubs'
    }
  ];
  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large">
          <div style={{ padding: '50px' }}>
            <Text>Đang tải dữ liệu...</Text>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <Title level={2}>Trang chủ - Quản trị hệ thống</Title>
        <Text type="secondary">Tổng quan và thống kê hệ thống quản lý câu lạc bộ sinh viên</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Link to={stat.link}>
              <Card
                hoverable
                className="stat-card"
                style={{ 
                  borderLeft: `4px solid ${stat.color}`
                }}
              >
                <Space size="large" style={{ width: '100%' }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>{stat.title}</Text>
                    <Title level={3} style={{ margin: '8px 0 4px 0' }}>
                      {stat.value}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{stat.subtitle}</Text>
                  </div>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Link to="/admin/accounts">
            <Card
              hoverable
              style={{ height: '100%', minHeight: '120px' }}
            >
              <Space>
                <UserCircleIcon style={iconXl} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>Quản lý Tài khoản</Title>
                  <Text type="secondary">Phân quyền và quản lý người dùng</Text>
                </div>
              </Space>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={8}>
          <Link to="/admin/requests">
            <Card
              hoverable
              style={{ height: '100%', minHeight: '120px' }}
            >
              <Space>
                <DocumentTextIcon style={iconXl} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>Duyệt yêu cầu</Title>
                  <Text type="secondary">Xét duyệt Club Leader</Text>
                </div>
              </Space>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={8}>
          <Link to="/admin/clubs">
            <Card
              hoverable
              style={{ height: '100%', minHeight: '120px' }}
            >
              <Space>
                <BuildingOfficeIcon style={iconXl} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>Giám sát CLB</Title>
                  <Text type="secondary">Quản lý câu lạc bộ</Text>
                </div>
              </Space>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

