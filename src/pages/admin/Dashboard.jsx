import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag } from 'antd';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { getIconSize } from '../../utils/iconSizes';
import { clubsAPI, accountsAPI, activitiesAPI, clubLeaderRequestAPI } from '../../services/api';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const iconLg = getIconSize('lg');
  const iconMd = getIconSize('md');

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalAccounts: 0,
    totalActivities: 0,
    totalRevenue: 0,
    leaderRequests: {
      total: 0,
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
    },
    clubsOverview: {
      active: 0,
      inactive: 0,
    },
    activitiesOverview: {
      upcoming: 0,
      ongoing: 0,
      finished: 0,
    },
    accountsOverview: {
      active: 0,
      locked: 0,
      admins: 0,
    },
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true);
      try {
        const [clubsRes, accountsRes, activitiesRes, leaderStatsRes] = await Promise.all([
          clubsAPI
            .getAll()
            .catch(() => ({ data: [] })),
          accountsAPI
            .getAll()
            .catch(() => ({ data: [] })),
          activitiesAPI
            .getAll()
            .catch(() => ({ data: [] })),
          clubLeaderRequestAPI
            .getStats()
            .catch(() => ({ data: null })),
        ]);

        const clubs = Array.isArray(clubsRes.data) ? clubsRes.data : [];
        const accounts = Array.isArray(accountsRes.data) ? accountsRes.data : [];
        const activities = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];

        const leaderStats = leaderStatsRes.data || {};

        const totalRevenue = clubs.reduce((sum, club) => {
          const memberCount = club.memberCount || 0;
          const membershipFee = club.membershipFee || 0;
          return sum + memberCount * membershipFee;
        }, 0);

        const activeClubs = clubs.filter((c) => {
          const status = c.status?.toLowerCase();
          return status === 'danghoatdong' || status === 'active';
        }).length;
        const inactiveClubs = clubs.filter((c) => {
          const status = c.status?.toLowerCase();
          return status && status !== 'danghoatdong' && status !== 'active';
        }).length;

        const now = new Date();
        let upcoming = 0;
        let ongoing = 0;
        let finished = 0;

        activities.forEach((activity) => {
          const start = activity.startDate || activity.startTime || activity.start;
          const end = activity.endDate || activity.endTime || activity.end;

          const startDate = start ? new Date(start) : null;
          const endDate = end ? new Date(end) : null;

          if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
            if (now < startDate) {
              upcoming += 1;
            } else if (now >= startDate && now <= endDate) {
              ongoing += 1;
            } else if (now > endDate) {
              finished += 1;
            }
          }
        });

        let activeAccounts = 0;
        let lockedAccounts = 0;
        let adminAccounts = 0;

        accounts.forEach((account) => {
          const status = account.status?.toLowerCase();
          const isActive = account.isActive;
          const isLocked = account.isLocked;
          const roles = account.roles || account.roleNames || [];

          if (status === 'danghoatdong' || status === 'active' || isActive === true) {
            activeAccounts += 1;
          }

          if (status === 'bikhoa' || status === 'locked' || isLocked === true) {
            lockedAccounts += 1;
          }

          const rolesArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
          if (rolesArray.some((r) => String(r).toLowerCase().includes('admin'))) {
            adminAccounts += 1;
          }
        });

        setStats({
          totalClubs: clubs.length,
          totalAccounts: accounts.length,
          totalActivities: activities.length,
          totalRevenue,
          leaderRequests: {
            total: leaderStats.total || 0,
            totalPending: leaderStats.totalPending || 0,
            totalApproved: leaderStats.totalApproved || 0,
            totalRejected: leaderStats.totalRejected || 0,
          },
          clubsOverview: {
            active: activeClubs,
            inactive: inactiveClubs,
          },
          activitiesOverview: {
            upcoming,
            ongoing,
            finished,
          },
          accountsOverview: {
            active: activeAccounts,
            locked: lockedAccounts,
            admins: adminAccounts,
          },
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <HomeIcon
              style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }}
            />
            Trang tổng quan hệ thống
          </Title>
          <Text type="secondary">
            Xem nhanh tình hình câu lạc bộ, tài khoản, hoạt động và yêu cầu trở thành Leader.
          </Text>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="stats-grid">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card--clubs" loading={loading} bordered={false}>
            <Statistic
              title={<span className="stat-title">Tổng số CLB</span>}
              value={stats.totalClubs}
              prefix={<BuildingOfficeIcon style={iconMd} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card--accounts" loading={loading} bordered={false}>
            <Statistic
              title={<span className="stat-title">Tổng số tài khoản</span>}
              value={stats.totalAccounts}
              prefix={<UsersIcon style={iconMd} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card--activities" loading={loading} bordered={false}>
            <Statistic
              title={<span className="stat-title">Tổng số hoạt động</span>}
              value={stats.totalActivities}
              prefix={<CalendarIcon style={iconMd} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card--leader" loading={loading} bordered={false}>
            <Statistic
              title={<span className="stat-title">Yêu cầu Leader đang chờ</span>}
              value={stats.leaderRequests.totalPending}
              prefix={<DocumentTextIcon style={iconMd} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space align="center">
                <DocumentTextIcon style={iconMd} />
                <span>Thống kê yêu cầu trở thành Club Leader</span>
              </Space>
            }
            className="detail-card"
            loading={loading}
            bordered={false}
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Tổng số yêu cầu</Text>
                  <Text strong style={{ fontSize: 20 }}>
                    {stats.leaderRequests.total}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={4}>
                  <Text type="secondary">Đang chờ duyệt</Text>
                  <Space size={8}>
                    <Tag color="orange">Đang chờ</Tag>
                    <Text strong>{stats.leaderRequests.totalPending}</Text>
                  </Space>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                  <Text type="secondary">Đã duyệt</Text>
                  <Space size={8}>
                    <Tag color="green">Đã duyệt</Tag>
                    <Text strong>{stats.leaderRequests.totalApproved}</Text>
                  </Space>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                  <Text type="secondary">Đã từ chối</Text>
                  <Space size={8}>
                    <Tag color="red">Đã từ chối</Tag>
                    <Text strong>{stats.leaderRequests.totalRejected}</Text>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space align="center">
                <CurrencyDollarIcon style={iconMd} />
                <span>Tổng quan doanh thu</span>
              </Space>
            }
            className="detail-card"
            bordered={false}
          >
            <Text type="secondary">
              Doanh thu ước tính được tính dựa trên số lượng thành viên nhân với phí thành viên của
              từng CLB. Xem chi tiết hơn trong trang &quot;Báo cáo&quot;.
            </Text>
            <div style={{ marginTop: 12 }}>
              <Space direction="vertical" size={4}>
                <Text>Tổng doanh thu ước tính</Text>
                <Text strong style={{ fontSize: 22 }}>
                  {stats.totalRevenue.toLocaleString('vi-VN')} VND
                </Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card className="overview-card" bordered={false} title="Giám sát CLB">
            <Space direction="vertical" size={6}>
              <div className="overview-row">
                <Text type="secondary">Tổng số CLB</Text>
                <Text strong>{stats.totalClubs}</Text>
              </div>
              <Text type="secondary" style={{ marginTop: 4 }}>
                Đang hoạt động / Tạm dừng
              </Text>
              <Space size={12} wrap>
                <Tag color="green">
                  Đang hoạt động: <strong> {stats.clubsOverview.active}</strong>
                </Tag>
                <Tag color="default">
                  Tạm dừng: <strong> {stats.clubsOverview.inactive}</strong>
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="overview-card" bordered={false} title="Quản lý hoạt động">
            <Space direction="vertical" size={6}>
              <div className="overview-row">
                <Text type="secondary">Tổng số hoạt động</Text>
                <Text strong>{stats.totalActivities}</Text>
              </div>
              <Text type="secondary" style={{ marginTop: 4 }}>
                Trạng thái hoạt động
              </Text>
              <Space size={12} wrap>
                <Tag color="blue">
                  Sắp diễn ra: <strong> {stats.activitiesOverview.upcoming}</strong>
                </Tag>
                <Tag color="gold">
                  Đang diễn ra: <strong> {stats.activitiesOverview.ongoing}</strong>
                </Tag>
                <Tag color="red">
                  Đã kết thúc: <strong> {stats.activitiesOverview.finished}</strong>
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="overview-card" bordered={false} title="Quản lý tài khoản">
            <Space direction="vertical" size={6}>
              <div className="overview-row">
                <Text type="secondary">Tổng số tài khoản</Text>
                <Text strong>{stats.totalAccounts}</Text>
              </div>
              <Text type="secondary" style={{ marginTop: 4 }}>
                Trạng thái & vai trò
              </Text>
              <Space size={12} wrap>
                <Tag color="green">
                  Đang hoạt động: <strong> {stats.accountsOverview.active}</strong>
                </Tag>
                <Tag color="red">
                  Bị khóa: <strong> {stats.accountsOverview.locked}</strong>
                </Tag>
                <Tag color="purple">
                  Tài khoản Admin: <strong> {stats.accountsOverview.admins}</strong>
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;


