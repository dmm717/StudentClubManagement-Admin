import { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Row, Col, Statistic, Space, Button, Select, Typography, Spin, Tag } from 'antd';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { clubsAPI, activitiesAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Reports.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Component Reports - Báo cáo tổng hợp hệ thống
 * Hiển thị thống kê theo từng CLB: thành viên, hoạt động, doanh thu
 */
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [selectedClub, setSelectedClub] = useState('all');
  const [clubs, setClubs] = useState([]);
  
  // Tổng số liệu
  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalActivities: 0,
    totalRevenue: 0,
    totalClubs: 0
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange, selectedClub]);

  /**
   * Load dữ liệu báo cáo
   * Kết hợp data từ clubs và activities
   */
  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load clubs và activities
      const [clubsResponse, activitiesResponse] = await Promise.all([
        clubsAPI.getAll(),
        activitiesAPI.getAll()
      ]);

      const clubsData = clubsResponse.data || [];
      const activitiesData = activitiesResponse.data || [];
      
      setClubs(clubsData);

      // Tạo map để đếm activities cho mỗi club
      const activityCountMap = {};
      activitiesData.forEach(activity => {
        const clubId = activity.clubId;
        activityCountMap[clubId] = (activityCountMap[clubId] || 0) + 1;
      });

      // Tạo report data cho mỗi club
      const reports = clubsData.map(club => {
        const memberCount = club.memberCount || 0;
        const activityCount = activityCountMap[club.id] || 0;
        // Tính doanh thu = số thành viên * phí thành viên
        const revenue = memberCount * (club.membershipFee || 0);

        return {
          key: club.id,
          clubId: club.id,
          clubName: club.name,
          members: memberCount,
          activities: activityCount,
          revenue: revenue,
          status: club.status,
          establishedDate: club.establishedDate
        };
      });

      // Filter theo club nếu được chọn
      let filteredReports = reports;
      if (selectedClub !== 'all') {
        filteredReports = reports.filter(r => r.clubId === parseInt(selectedClub));
      }

      // Filter theo date range nếu có
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        
        filteredReports = filteredReports.filter(report => {
          if (!report.establishedDate) return false;
          const clubDate = new Date(report.establishedDate);
          return clubDate >= startDate.toDate() && clubDate <= endDate.toDate();
        });
      }

      setReportData(filteredReports);

      // Tính tổng
      const totals = filteredReports.reduce((acc, curr) => ({
        totalMembers: acc.totalMembers + curr.members,
        totalActivities: acc.totalActivities + curr.activities,
        totalRevenue: acc.totalRevenue + curr.revenue,
        totalClubs: acc.totalClubs + 1
      }), { totalMembers: 0, totalActivities: 0, totalRevenue: 0, totalClubs: 0 });

      setSummary(totals);

    } catch (error) {
      showError('Không thể tải dữ liệu báo cáo!', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export báo cáo ra CSV
   */
  const handleExport = () => {
    try {
      // Tạo CSV content
      const headers = ['CLB', 'Số thành viên', 'Số hoạt động', 'Doanh thu (VNĐ)', 'Trạng thái'];
      const rows = reportData.map(item => [
        item.clubName,
        item.members,
        item.activities,
        item.revenue.toLocaleString('vi-VN'),
        item.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Thêm BOM để Excel hiển thị tiếng Việt đúng
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `bao_cao_clb_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Đã xuất báo cáo thành công!');
    } catch (error) {
      showError('Không thể xuất báo cáo!', 'Lỗi xuất file');
    }
  };

  // Cấu hình columns cho table
  const columns = [
    {
      title: 'CLB',
      dataIndex: 'clubName',
      key: 'clubName',
      width: '25%',
      sorter: (a, b) => a.clubName.localeCompare(b.clubName),
    },
    {
      title: 'Số thành viên',
      dataIndex: 'members',
      key: 'members',
      align: 'center',
      sorter: (a, b) => a.members - b.members,
      render: (members) => {
        const iconSize = getIconSize('sm');
        return (
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <UsersIcon style={iconSize} /> {members}
          </Tag>
        );
      }
    },
    {
      title: 'Số hoạt động',
      dataIndex: 'activities',
      key: 'activities',
      align: 'center',
      sorter: (a, b) => a.activities - b.activities,
      render: (activities) => {
        const iconSize = getIconSize('sm');
        return (
          <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <CalendarDaysIcon style={iconSize} /> {activities}
          </Tag>
        );
      }
    },
    {
      title: 'Doanh thu (VNĐ)',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue) => (
        <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>
          {revenue.toLocaleString('vi-VN')}đ
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      filters: [
        { text: 'Đang hoạt động', value: 'Active' },
        { text: 'Tạm dừng', value: 'Unactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'default'}>
          {status === 'Active' ? 'Đang hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
  ];

  const statCards = [
    {
      title: 'Tổng số CLB',
      value: summary.totalClubs,
      color: '#1890ff',
      accent: 'rgba(24, 144, 255, 0.12)',
      icon: UsersIcon,
    },
    {
      title: 'Tổng thành viên',
      value: summary.totalMembers,
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)',
      icon: UsersIcon,
    },
    {
      title: 'Tổng hoạt động',
      value: summary.totalActivities,
      color: '#faad14',
      accent: 'rgba(250, 173, 20, 0.12)',
      icon: CalendarDaysIcon,
    },
    {
      title: 'Tổng doanh thu (VNĐ)',
      value: summary.totalRevenue.toLocaleString('vi-VN'),
      color: '#f5222d',
      accent: 'rgba(245, 34, 45, 0.12)',
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>Báo cáo tổng hợp</Title>
          <Text type="secondary">Thống kê thành viên, hoạt động và doanh thu theo CLB</Text>
        </div>
      </div>

      {/* Filters */}
      <Card className="filter-card" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Chọn CLB</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedClub}
                onChange={setSelectedClub}
                placeholder="Tất cả CLB"
              >
                <Option value="all">Tất cả CLB</Option>
                {clubs.map(club => (
                  <Option key={club.id} value={club.id}>
                    {club.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Khoảng thời gian</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ opacity: 0 }}>Actions</Text>
              <Space style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<ArrowPathIcon style={getIconSize('sm')} />}
                  onClick={loadReportData}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button
                  icon={<ArrowDownTrayIcon style={getIconSize('sm')} />}
                  onClick={handleExport}
                  disabled={reportData.length === 0}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card className="stat-card card-hover" bordered={false} key={item.title}>
              <div className="stat-icon" style={{ background: item.accent, color: item.color }}>
                <Icon style={getIconSize('md')} />
              </div>
              <div className="stat-content">
                <Text type="secondary">{item.title}</Text>
                <div className="stat-value" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={reportData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} CLB`
            }}
            locale={{
              emptyText: 'Không có dữ liệu báo cáo'
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Reports;
