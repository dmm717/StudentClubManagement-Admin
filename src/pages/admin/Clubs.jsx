import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic } from 'antd';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { clubs as initialClubs } from '../../data/mockData';
import { showDeleteConfirm, showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Clubs.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Clubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState(initialClubs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || club.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (club) => {
    const result = await showDeleteConfirm(club.name);
    if (result.isConfirmed) {
      setClubs(clubs.filter(c => c.id !== club.id));
      showSuccess(`Đã xóa câu lạc bộ "${club.name}" thành công!`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Mã CLB',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'Tên CLB',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Trưởng CLB',
      dataIndex: 'leader',
      key: 'leader'
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'foundedDate',
      key: 'foundedDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Số thành viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      align: 'center'
    },
    {
      title: 'Phí hoạt động',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => formatCurrency(fee)
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
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeIcon style={iconSm} />}
            onClick={() => navigate(`/admin/clubs/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<PencilIcon style={iconSm} />}
            onClick={() => navigate(`/admin/clubs/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<TrashIcon style={iconSm} />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  const activeClubs = clubs.filter(c => c.status === 'active').length;
  const inactiveClubs = clubs.filter(c => c.status === 'inactive').length;

  return (
    <div className="clubs-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <BuildingOfficeIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Quản lý Câu lạc bộ
          </Title>
          <Text type="secondary">Quản lý thông tin và hoạt động của các câu lạc bộ sinh viên</Text>
        </div>
        <Link to="/admin/clubs/new">
          <Button type="primary" size="large" icon={<PlusIcon style={iconSm} />}>
            Thêm CLB mới
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }} className="animate-slide-up">
        <Col xs={24} sm={6}>
          <Card className="card-hover">
            <Statistic
              title="Tổng số CLB"
              value={clubs.length}
              prefix={<BuildingOfficeIcon style={iconMd} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeClubs}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ngừng hoạt động"
              value={inactiveClubs}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Kết quả lọc"
              value={filteredClubs.length}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }} className="animate-slide-up">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={16}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc mã CLB..."
              allowClear
              enterButton={<MagnifyingGlassIcon style={iconSm} />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Trạng thái"
              size="large"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Clubs Table */}
      <Card className="animate-fade-in">
        <Table
          columns={columns}
          dataSource={filteredClubs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} CLB`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default Clubs;
