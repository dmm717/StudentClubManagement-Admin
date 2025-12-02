import { useState, useMemo } from 'react';
import { Card, Tabs, Button, Typography, Row, Col, Statistic, Table, Tag, Progress, Select, DatePicker, Space } from 'antd';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { clubs, members, fees, joinRequests } from '../../data/mockData';
import { showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import dayjs from 'dayjs';
import './Reports.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, quarter, year, semester
  const [dateRange, setDateRange] = useState(null);
  const [semesterFilter, setSemesterFilter] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Calculate statistics
  const totalRevenue = fees.filter(f => f.status === 'completed').reduce((sum, f) => sum + f.amount, 0);
  const pendingRevenue = fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);
  
  // Club statistics
  const clubStats = clubs.map(club => {
    const clubMembers = members.filter(m => m.clubId === club.id);
    const clubFees = fees.filter(f => f.clubId === club.id);
    const revenue = clubFees.filter(f => f.status === 'completed').reduce((sum, f) => sum + f.amount, 0);
    const paidMembers = clubMembers.filter(m => m.feeStatus === 'paid').length;
    
    return {
      ...club,
      actualMembers: clubMembers.length,
      revenue,
      paidMembers,
      paymentRate: clubMembers.length > 0 ? ((paidMembers / clubMembers.length) * 100).toFixed(1) : 0
    };
  });

  // Fee status statistics
  const feeStats = {
    total: fees.length,
    completed: fees.filter(f => f.status === 'completed').length,
    pending: fees.filter(f => f.status === 'pending').length,
    overdue: fees.filter(f => f.status === 'overdue').length
  };

  // Member growth data (last 6 months)
  const memberGrowthData = useMemo(() => {
    const months = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');
      
      const newMembers = members.filter(m => {
        if (!m.joinDate) return false;
        const joinDate = dayjs(m.joinDate);
        return joinDate.isAfter(monthStart) && joinDate.isBefore(monthEnd);
      }).length;
      
      months.push({
        month: month.format('MM/YYYY'),
        members: newMembers,
        total: members.filter(m => {
          if (!m.joinDate) return false;
          return dayjs(m.joinDate).isBefore(monthEnd);
        }).length
      });
    }
    return months;
  }, []);

  // Revenue by month data
  const revenueByMonthData = useMemo(() => {
    const months = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');
      
      const monthRevenue = fees.filter(f => {
        if (!f.paymentDate) return false;
        const paymentDate = dayjs(f.paymentDate);
        return paymentDate.isAfter(monthStart) && paymentDate.isBefore(monthEnd) && f.status === 'completed';
      }).reduce((sum, f) => sum + f.amount, 0);
      
      months.push({
        month: month.format('MM/YYYY'),
        revenue: monthRevenue
      });
    }
    return months;
  }, []);

  // Member distribution by club (Pie chart data)
  const memberDistributionData = useMemo(() => {
    return clubs.map(club => {
      const clubMembers = members.filter(m => m.clubId === club.id);
      return {
        name: club.name,
        value: clubMembers.length
      };
    });
  }, []);

  // Request statistics
  const requestStats = useMemo(() => {
    const pending = joinRequests.filter(r => r.status === 'pending').length;
    const approved = joinRequests.filter(r => r.status === 'approved').length;
    const rejected = joinRequests.filter(r => r.status === 'rejected').length;
    
    // Requests by club
    const requestsByClub = clubs.map(club => {
      const clubRequests = joinRequests.filter(r => r.clubId === club.id);
      return {
        name: club.name,
        pending: clubRequests.filter(r => r.status === 'pending').length,
        approved: clubRequests.filter(r => r.status === 'approved').length,
        rejected: clubRequests.filter(r => r.status === 'rejected').length,
        total: clubRequests.length
      };
    });

    // Requests by month
    const requestsByMonth = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      const month = now.subtract(i, 'month');
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');
      
      const monthRequests = joinRequests.filter(r => {
        const requestDate = dayjs(r.requestDate);
        return requestDate.isAfter(monthStart) && requestDate.isBefore(monthEnd);
      });
      
      requestsByMonth.push({
        month: month.format('MM/YYYY'),
        pending: monthRequests.filter(r => r.status === 'pending').length,
        approved: monthRequests.filter(r => r.status === 'approved').length,
        rejected: monthRequests.filter(r => r.status === 'rejected').length,
        total: monthRequests.length
      });
    }

    return {
      pending,
      approved,
      rejected,
      total: joinRequests.length,
      approvalRate: joinRequests.length > 0 ? ((approved / joinRequests.length) * 100).toFixed(1) : 0,
      requestsByClub,
      requestsByMonth
    };
  }, []);

  // Semester statistics
  const semesterStats = useMemo(() => {
    const semesters = [...new Set(fees.map(f => f.semester))];
    return semesters.map(semester => {
      const semesterFees = fees.filter(f => f.semester === semester);
      const completed = semesterFees.filter(f => f.status === 'completed');
      const revenue = completed.reduce((sum, f) => sum + f.amount, 0);
      const pending = semesterFees.filter(f => f.status === 'pending' || f.status === 'overdue');
      const pendingAmount = pending.reduce((sum, f) => sum + f.amount, 0);
      
      return {
        semester,
        total: semesterFees.length,
        completed: completed.length,
        pending: pending.length,
        revenue,
        pendingAmount,
        paymentRate: semesterFees.length > 0 ? ((completed.length / semesterFees.length) * 100).toFixed(1) : 0
      };
    });
  }, []);

  // Top Rankings
  const topRankings = useMemo(() => {
    return {
      topMembers: [...clubStats].sort((a, b) => b.actualMembers - a.actualMembers).slice(0, 5),
      topRevenue: [...clubStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      topPaymentRate: [...clubStats].filter(c => c.actualMembers > 0).sort((a, b) => parseFloat(b.paymentRate) - parseFloat(a.paymentRate)).slice(0, 5),
      topRequests: [...requestStats.requestsByClub].sort((a, b) => b.total - a.total).slice(0, 5)
    };
  }, [clubStats, requestStats]);

  const handlePrint = () => {
    window.print();
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  
  const handleExport = () => {
    showSuccess('Xuất báo cáo thành công! (Chức năng demo)', 'Thành công');
  };

  const clubColumns = [
    {
      title: 'Mã CLB',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Tên CLB',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Trưởng CLB',
      dataIndex: 'leader',
      key: 'leader'
    },
    {
      title: 'Số thành viên',
      dataIndex: 'actualMembers',
      key: 'actualMembers',
      align: 'center'
    },
    {
      title: 'Đã đóng phí',
      dataIndex: 'paidMembers',
      key: 'paidMembers',
      align: 'center'
    },
    {
      title: 'Tỷ lệ (%)',
      dataIndex: 'paymentRate',
      key: 'paymentRate',
      align: 'center',
      render: (rate) => {
        const rateNum = parseFloat(rate);
        const color = rateNum >= 80 ? 'green' : rateNum >= 50 ? 'orange' : 'red';
        return <Tag color={color}>{rate}%</Tag>;
      }
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => formatCurrency(revenue)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      )
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <ChartBarIcon style={iconSm} />
          Tổng quan
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng số CLB"
                  value={clubs.length}
                  prefix={<BuildingOfficeIcon style={iconMd} />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {clubs.filter(c => c.status === 'active').length} đang hoạt động
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng thành viên"
                  value={members.length}
                  prefix={<UsersIcon style={iconMd} />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {members.filter(m => m.feeStatus === 'paid').length} đã đóng phí
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng doanh thu"
                  value={formatCurrency(totalRevenue)}
                  prefix={<CurrencyDollarIcon style={iconMd} />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {feeStats.completed} khoản thanh toán
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="card-hover">
                <Statistic
                  title="Chưa thu"
                  value={formatCurrency(pendingRevenue)}
                  prefix={<ClockIcon style={iconMd} />}
                  valueStyle={{ color: '#faad14' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {feeStats.pending + feeStats.overdue} khoản chưa thanh toán
                </Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Thống kê trạng thái thanh toán">
                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Đã thanh toán</Text>
                        <Text strong>{feeStats.completed}</Text>
                      </div>
                      <Progress
                        percent={parseFloat(((feeStats.completed / feeStats.total) * 100).toFixed(1))}
                        strokeColor="#52c41a"
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Chờ thanh toán</Text>
                        <Text strong>{feeStats.pending}</Text>
                      </div>
                      <Progress
                        percent={parseFloat(((feeStats.pending / feeStats.total) * 100).toFixed(1))}
                        strokeColor="#faad14"
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Quá hạn</Text>
                        <Text strong>{feeStats.overdue}</Text>
                      </div>
                      <Progress
                        percent={parseFloat(((feeStats.overdue / feeStats.total) * 100).toFixed(1))}
                        strokeColor="#ff4d4f"
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Tăng trưởng thành viên (6 tháng gần nhất)">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={memberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="total" stackId="1" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} name="Tổng thành viên" />
                    <Area type="monotone" dataKey="members" stackId="2" stroke="#52c41a" fill="#52c41a" fillOpacity={0.6} name="Thành viên mới" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'clubs',
      label: (
        <Space>
          <BuildingOfficeIcon style={iconSm} />
          Theo CLB
        </Space>
      ),
      children: (
        <Card>
          <Table
            columns={clubColumns}
            dataSource={clubStats}
            rowKey="id"
            pagination={false}
            summary={(pageData) => {
              const totalMembers = members.length;
              const totalPaid = members.filter(m => m.feeStatus === 'paid').length;
              const totalRate = ((totalPaid / totalMembers) * 100).toFixed(1);
              
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <Text strong>{totalMembers}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="center">
                      <Text strong>{totalPaid}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="center">
                      <Tag color="blue">{totalRate}%</Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <Text strong>{formatCurrency(totalRevenue)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      )
    },
    {
      key: 'revenue',
      label: (
        <Space>
          <CurrencyDollarIcon style={iconSm} />
          Doanh thu
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng doanh thu"
                  value={formatCurrency(totalRevenue)}
                  prefix={<CurrencyDollarIcon style={iconMd} />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {feeStats.completed} khoản đã thanh toán
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Doanh thu chưa thu"
                  value={formatCurrency(pendingRevenue)}
                  prefix={<ClockIcon style={iconMd} />}
                  valueStyle={{ color: '#faad14' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {feeStats.pending + feeStats.overdue} khoản chưa thanh toán
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Dự kiến tổng"
                  value={formatCurrency(totalRevenue + pendingRevenue)}
                  prefix={<CurrencyDollarIcon style={iconMd} />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Khi thu đủ toàn bộ
                </Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Doanh thu theo CLB">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {clubStats.sort((a, b) => b.revenue - a.revenue).map((club, index) => {
                    const maxRevenue = Math.max(...clubStats.map(c => c.revenue));
                    const percent = maxRevenue > 0 ? (club.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={club.id} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <Text strong>#{index + 1} {club.name}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>{club.code}</Text>
                          </div>
                          <Text strong>{formatCurrency(club.revenue)}</Text>
                        </div>
                        <Progress percent={percent} strokeColor="#52c41a" />
                      </div>
                    );
                  })}
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Doanh thu theo tháng (6 tháng gần nhất)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#52c41a" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'members',
      label: (
        <Space>
          <UsersIcon style={iconSm} />
          Thành viên
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng thành viên"
                  value={members.length}
                  prefix={<UsersIcon style={iconMd} />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {members.filter(m => m.feeStatus === 'paid').length} đã đóng phí
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Thành viên mới (tháng này)"
                  value={memberGrowthData[memberGrowthData.length - 1]?.members || 0}
                  prefix={<UserPlusIcon style={iconMd} />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tăng trưởng so với tháng trước
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="card-hover">
                <Statistic
                  title="Tỷ lệ đóng phí"
                  value={`${((members.filter(m => m.feeStatus === 'paid').length / members.length) * 100).toFixed(1)}%`}
                  prefix={<CurrencyDollarIcon style={iconMd} />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {members.filter(m => m.feeStatus === 'paid').length}/{members.length} thành viên
                </Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Tăng trưởng thành viên">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#1890ff" strokeWidth={2} name="Tổng thành viên" />
                    <Line type="monotone" dataKey="members" stroke="#52c41a" strokeWidth={2} name="Thành viên mới" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Phân bổ thành viên theo CLB">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={memberDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {memberDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'requests',
      label: (
        <Space>
          <DocumentTextIcon style={iconSm} />
          Yêu cầu
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card className="card-hover">
                <Statistic
                  title="Tổng yêu cầu"
                  value={requestStats.total}
                  prefix={<DocumentTextIcon style={iconMd} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="card-hover">
                <Statistic
                  title="Chờ duyệt"
                  value={requestStats.pending}
                  prefix={<ClockIcon style={iconMd} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="card-hover">
                <Statistic
                  title="Đã duyệt"
                  value={requestStats.approved}
                  prefix={<UsersIcon style={iconMd} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="card-hover">
                <Statistic
                  title="Tỷ lệ duyệt"
                  value={`${requestStats.approvalRate}%`}
                  prefix={<ArrowTrendingUpIcon style={iconMd} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Yêu cầu theo CLB">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requestStats.requestsByClub}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill="#faad14" name="Chờ duyệt" />
                    <Bar dataKey="approved" stackId="a" fill="#52c41a" name="Đã duyệt" />
                    <Bar dataKey="rejected" stackId="a" fill="#ff4d4f" name="Từ chối" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Yêu cầu theo tháng">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={requestStats.requestsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#faad14" fill="#faad14" fillOpacity={0.6} name="Chờ duyệt" />
                    <Area type="monotone" dataKey="approved" stackId="2" stroke="#52c41a" fill="#52c41a" fillOpacity={0.6} name="Đã duyệt" />
                    <Area type="monotone" dataKey="rejected" stackId="3" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.6} name="Từ chối" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'semester',
      label: (
        <Space>
          <CalendarIcon style={iconSm} />
          Học kỳ
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card>
                <Space style={{ marginBottom: 16 }}>
                  <Text strong>Lọc theo học kỳ:</Text>
                  <Select
                    style={{ width: 200 }}
                    value={semesterFilter}
                    onChange={setSemesterFilter}
                  >
                    <Option value="all">Tất cả học kỳ</Option>
                    {semesterStats.map(s => (
                      <Option key={s.semester} value={s.semester}>{s.semester}</Option>
                    ))}
                  </Select>
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            {semesterStats
              .filter(s => semesterFilter === 'all' || s.semester === semesterFilter)
              .map(semester => (
                <Col xs={24} sm={12} lg={8} key={semester.semester}>
                  <Card className="card-hover" title={semester.semester}>
                    <Statistic
                      title="Tổng khoản phí"
                      value={semester.total}
                      prefix={<CurrencyDollarIcon style={iconMd} />}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary">Đã thanh toán: </Text>
                      <Text strong style={{ color: '#52c41a' }}>{semester.completed}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Chờ thanh toán: </Text>
                      <Text strong style={{ color: '#faad14' }}>{semester.pending}</Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Doanh thu: </Text>
                      <Text strong>{formatCurrency(semester.revenue)}</Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Progress
                        percent={parseFloat(semester.paymentRate)}
                        strokeColor={parseFloat(semester.paymentRate) >= 80 ? '#52c41a' : parseFloat(semester.paymentRate) >= 50 ? '#faad14' : '#ff4d4f'}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tỷ lệ thanh toán: {semester.paymentRate}%
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      )
    },
    {
      key: 'rankings',
      label: (
        <Space>
          <TrophyIcon style={iconSm} />
          Top Rankings
        </Space>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="🏆 Top 5 CLB có nhiều thành viên nhất" className="card-hover">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {topRankings.topMembers.map((club, index) => (
                    <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: index === 0 ? '#f0f9ff' : '#fafafa', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <Text strong>{club.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{club.code}</Text>
                        </div>
                      </div>
                      <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
                        {club.actualMembers} thành viên
                      </Tag>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="💰 Top 5 CLB có doanh thu cao nhất" className="card-hover">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {topRankings.topRevenue.map((club, index) => (
                    <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: index === 0 ? '#f0f9ff' : '#fafafa', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <Text strong>{club.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{club.code}</Text>
                        </div>
                      </div>
                      <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                        {formatCurrency(club.revenue)}
                      </Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="✅ Top 5 CLB có tỷ lệ đóng phí tốt nhất" className="card-hover">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {topRankings.topPaymentRate.map((club, index) => (
                    <div key={club.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: index === 0 ? '#f0f9ff' : '#fafafa', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <Text strong>{club.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{club.code}</Text>
                        </div>
                      </div>
                      <Tag color={parseFloat(club.paymentRate) >= 80 ? 'green' : parseFloat(club.paymentRate) >= 50 ? 'orange' : 'red'} style={{ fontSize: 16, padding: '4px 12px' }}>
                        {club.paymentRate}%
                      </Tag>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="📝 Top 5 CLB được yêu cầu nhiều nhất" className="card-hover">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {topRankings.topRequests.map((club, index) => (
                    <div key={club.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: index === 0 ? '#f0f9ff' : '#fafafa', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <Text strong>{club.name}</Text>
                        </div>
                      </div>
                      <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
                        {club.total} yêu cầu
                      </Tag>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  return (
    <div className="reports-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <ChartBarIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Báo cáo & Thống kê
          </Title>
          <Text type="secondary">Tổng hợp và phân tích dữ liệu hệ thống</Text>
        </div>
        <Space>
          <Button
            icon={<ArrowDownTrayIcon style={iconSm} />}
            onClick={handleExport}
          >
            Xuất báo cáo
          </Button>
          <Button
            type="primary"
            icon={<PrinterIcon style={iconSm} />}
            onClick={handlePrint}
          >
            In báo cáo
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>
    </div>
  );
};

export default Reports;
