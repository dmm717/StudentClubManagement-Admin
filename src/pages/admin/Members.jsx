import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic } from 'antd';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { members as initialMembers } from '../../data/mockData';
import { showDeleteConfirm, showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Members.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('all');
  const [filterFeeStatus, setFilterFeeStatus] = useState('all');

  // Get unique clubs for filter
  const clubs = [...new Set(members.map(m => m.clubName))];

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === 'all' || member.clubName === filterClub;
    const matchesFeeStatus = filterFeeStatus === 'all' || member.feeStatus === filterFeeStatus;
    return matchesSearch && matchesClub && matchesFeeStatus;
  });

  const handleDelete = async (member) => {
    const result = await showDeleteConfirm(member.fullName);
    if (result.isConfirmed) {
      setMembers(members.filter(m => m.id !== member.id));
      showSuccess(`Đã xóa thành viên "${member.fullName}" thành công!`);
    }
  };

  const columns = [
    {
      title: 'MSSV',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 100
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
      ellipsis: true,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubName',
      key: 'clubName',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={role === 'Trưởng CLB' ? 'blue' : 'default'}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái phí',
      dataIndex: 'feeStatus',
      key: 'feeStatus',
      width: 120,
      render: (status) => {
        const statusConfig = {
          paid: { color: 'green', text: 'Đã thanh toán' },
          pending: { color: 'orange', text: 'Chờ thanh toán' },
          overdue: { color: 'red', text: 'Quá hạn' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeIcon style={iconSm} />}
            onClick={() => navigate(`/admin/members/${record.id}`)}
            style={{ padding: 0 }}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PencilIcon style={iconSm} />}
            onClick={() => navigate(`/admin/members/${record.id}/edit`)}
            style={{ padding: 0 }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<TrashIcon style={iconSm} />}
            onClick={() => handleDelete(record)}
            style={{ padding: 0 }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const paidMembers = members.filter(m => m.feeStatus === 'paid').length;
  const pendingMembers = members.filter(m => m.feeStatus === 'pending').length;
  const overdueMembers = members.filter(m => m.feeStatus === 'overdue').length;

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');

  return (
    <div className="members-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <UsersIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Quản lý Thành viên
          </Title>
          <Text type="secondary">Quản lý thông tin thành viên các câu lạc bộ</Text>
        </div>
        <Link to="/admin/members/new">
          <Button type="primary" size="large" icon={<PlusIcon style={iconSm} />}>
            Thêm thành viên
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }} className="animate-slide-up">
        <Col xs={24} sm={6}>
          <Card className="card-hover">
            <Statistic
              title="Tổng thành viên"
              value={members.length}
              prefix={<UsersIcon style={iconMd} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="card-hover">
            <Statistic
              title="Đã thanh toán"
              value={paidMembers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="card-hover">
            <Statistic
              title="Chờ thanh toán"
              value={pendingMembers}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="card-hover">
            <Statistic
              title="Quá hạn"
              value={overdueMembers}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }} className="animate-slide-up">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên, MSSV, email..."
              allowClear
              enterButton={<MagnifyingGlassIcon style={iconSm} />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Câu lạc bộ"
              size="large"
              style={{ width: '100%' }}
              value={filterClub}
              onChange={setFilterClub}
            >
              <Option value="all">Tất cả</Option>
              {clubs.map(club => (
                <Option key={club} value={club}>{club}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Trạng thái phí"
              size="large"
              style={{ width: '100%' }}
              value={filterFeeStatus}
              onChange={setFilterFeeStatus}
            >
              <Option value="all">Tất cả</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Members Table */}
      <Card className="animate-fade-in" style={{ overflow: 'hidden', width: '100%' }}>
        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} thành viên`
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          style={{ width: '100%' }}
        />
      </Card>
    </div>
  );
};

export default Members;
