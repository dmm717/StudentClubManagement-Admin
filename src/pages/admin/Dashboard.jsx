import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Table, Tag, Typography, Space, Button } from 'antd';
import {
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { clubs, members, joinRequests, fees } from '../../data/mockData';
import { getIconSize } from '../../utils/iconSizes';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClubs: 0,
    activeClubs: 0,
    totalMembers: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    pendingFees: 0
  });

  useEffect(() => {
    // Calculate statistics
    const activeClubs = clubs.filter(club => club.status === 'active').length;
    const pendingRequests = joinRequests.filter(req => req.status === 'pending').length;
    const completedFees = fees.filter(fee => fee.status === 'completed');
    const totalRevenue = completedFees.reduce((sum, fee) => sum + fee.amount, 0);
    const pendingFees = fees.filter(fee => fee.status === 'pending' || fee.status === 'overdue').length;

    setStats({
      totalClubs: clubs.length,
      activeClubs,
      totalMembers: members.length,
      pendingRequests,
      totalRevenue,
      pendingFees
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const iconXl = getIconSize('2xl'); // 48x48 for stat cards

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
      title: 'Tổng thành viên',
      value: stats.totalMembers,
      subtitle: 'Thành viên đang hoạt động',
      icon: <UsersIcon style={iconXl} />,
      color: '#52c41a',
      link: '/admin/members'
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: stats.pendingRequests,
      subtitle: 'Đơn gia nhập mới',
      icon: <DocumentTextIcon style={iconXl} />,
      color: '#faad14',
      link: '/admin/requests'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${stats.pendingFees} phí chưa thanh toán`,
      icon: <CurrencyDollarIcon style={iconXl} />,
      color: '#722ed1',
      link: '/admin/fees'
    }
  ];

  const iconMd = getIconSize('md');
  const iconSm = getIconSize('sm');
  const recentRequests = joinRequests.slice(0, 5);
  const recentFees = fees.slice(0, 5);

  const requestColumns = [
    {
      title: 'Sinh viên',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'CLB',
      dataIndex: 'clubName',
      key: 'clubName'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ duyệt' },
          approved: { color: 'green', text: 'Đã duyệt' },
          rejected: { color: 'red', text: 'Từ chối' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const feeColumns = [
    {
      title: 'Thành viên',
      dataIndex: 'memberName',
      key: 'memberName'
    },
    {
      title: 'CLB',
      dataIndex: 'clubName',
      key: 'clubName'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'green', text: 'Đã thanh toán' },
          pending: { color: 'orange', text: 'Chờ thanh toán' },
          overdue: { color: 'red', text: 'Quá hạn' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  return (
    <div className="dashboard" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="dashboard-header animate-fade-in">
        <Title level={2}>Trang chủ - Tổng quan hệ thống</Title>
        <Text type="secondary">Chào mừng bạn đến với hệ thống quản lý câu lạc bộ sinh viên</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Link to={stat.link}>
              <Card
                hoverable
                className="stat-card card-hover animate-scale-in"
                style={{ 
                  borderLeft: `4px solid ${stat.color}`,
                  animationDelay: `${index * 0.1}s`
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

      {/* Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DocumentTextIcon style={iconMd} />
                <span>Yêu cầu gia nhập gần đây</span>
              </Space>
            }
            extra={<Link to="/admin/requests">Xem tất cả →</Link>}
            className="card-hover animate-slide-up"
          >
            <Table
              dataSource={recentRequests}
              columns={requestColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CurrencyDollarIcon style={iconMd} />
                <span>Thanh toán phí gần đây</span>
              </Space>
            }
            extra={<Link to="/admin/fees">Xem tất cả →</Link>}
            className="card-hover animate-slide-up"
          >
            <Table
              dataSource={recentFees}
              columns={feeColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title={
          <Space>
            <ChartBarIcon style={iconMd} />
            <span>Thao tác nhanh</span>
          </Space>
        }
        className="animate-fade-in"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Link to="/admin/clubs/new">
              <Button type="primary" block icon={<PlusIcon style={iconSm} />} size="large">
                Thêm CLB mới
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/admin/members/new">
              <Button type="primary" block icon={<UserPlusIcon style={iconSm} />} size="large">
                Thêm thành viên
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/admin/requests">
              <Button type="default" block icon={<CheckBadgeIcon style={iconSm} />} size="large">
                Duyệt yêu cầu
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/admin/reports">
              <Button type="default" block icon={<ChartBarIcon style={iconSm} />} size="large">
                Xem báo cáo
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;

