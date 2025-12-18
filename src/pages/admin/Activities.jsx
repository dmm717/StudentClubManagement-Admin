import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Modal, Descriptions } from 'antd';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { activitiesAPI, clubsAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Activities.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [filterClub]);

  const loadClubs = async () => {
    try {
      const response = await clubsAPI.getAll();
      setClubs(response.data || []);
    } catch (error) {
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      let response;
      if (filterClub === 'all') {
        response = await activitiesAPI.getAll();
      } else {
        response = await activitiesAPI.getByClub(parseInt(filterClub));
      }
      setActivities(response.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tải danh sách hoạt động!');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusLower = activity.status?.toLowerCase();
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'sapToi' && (statusLower === 'saptoi' || statusLower === 'upcoming')) ||
      (filterStatus === 'dangDienRa' && (statusLower === 'dangdienra' || statusLower === 'active')) ||
      (filterStatus === 'daHoanThanh' && (statusLower === 'dahoanthanh' || statusLower === 'completed')) ||
      (filterStatus === 'daHuy' && (statusLower === 'dahuy' || statusLower === 'cancelled')) ||
      activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = async (activityId) => {
    try {
      const response = await activitiesAPI.getById(activityId);
      setSelectedActivity(response.data);
      setShowDetailModal(true);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tải thông tin hoạt động!');
    }
  };



  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club?.name || `CLB ID: ${clubId}`;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'dangdienra' || statusLower === 'active' || statusLower === 'saptoi' || statusLower === 'upcoming') {
      return 'green';
    }
    if (statusLower === 'dahoanthanh' || statusLower === 'completed') {
      return 'blue';
    }
    if (statusLower === 'dahuy' || statusLower === 'cancelled') {
      return 'red';
    }
    return 'default';
  };

  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'dangdienra' || statusLower === 'active') {
      return 'Đang diễn ra';
    }
    if (statusLower === 'saptoi' || statusLower === 'upcoming') {
      return 'Sắp tới';
    }
    if (statusLower === 'dahoanthanh' || statusLower === 'completed') {
      return 'Đã hoàn thành';
    }
    if (statusLower === 'dahuy' || statusLower === 'cancelled') {
      return 'Đã hủy';
    }
    return status || 'N/A';
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');

  const columns = [
    {
      title: 'Tiêu đề',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.location || 'Chưa có địa điểm'}</Text>
        </div>
      )
    },
    {
      title: 'CLB',
      key: 'clubId',
      width: 150,
      render: (_, record) => (
        <Text>{getClubName(record.clubId)}</Text>
      )
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: (time) => time ? new Date(time).toLocaleString('vi-VN') : 'N/A'
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: (time) => time ? new Date(time).toLocaleString('vi-VN') : 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            size="middle"
            style={{ minWidth: 90, borderRadius: 999 }}
            icon={<EyeIcon style={iconSm} />}
            onClick={() => handleViewDetail(record.id)}
          >
            Xem
          </Button>
        </Space>
      )
    }
  ];

  const stats = {
    total: activities.length,
    upcoming: activities.filter(a => {
      const status = a.status?.toLowerCase();
      return status === 'saptoi' || status === 'upcoming';
    }).length,
    active: activities.filter(a => {
      const status = a.status?.toLowerCase();
      return status === 'dangdienra' || status === 'active';
    }).length,
    completed: activities.filter(a => {
      const status = a.status?.toLowerCase();
      return status === 'dahoanthanh' || status === 'completed';
    }).length,
  };

  const statCards = [
    {
      title: 'Tổng số hoạt động',
      value: stats.total,
      color: '#1890ff',
      accent: 'rgba(24, 144, 255, 0.12)',
      icon: CalendarIcon
    },
    {
      title: 'Sắp diễn ra',
      value: stats.upcoming,
      color: '#faad14',
      accent: 'rgba(250, 173, 20, 0.12)',
      icon: CalendarIcon
    },
    {
      title: 'Đang diễn ra',
      value: stats.active,
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)',
      icon: CalendarIcon
    },
    {
      title: 'Đã hoàn thành',
      value: stats.completed,
      color: '#722ed1',
      accent: 'rgba(114, 46, 209, 0.12)',
      icon: CalendarIcon
    }
  ];

  return (
    <div className="activities-page animate-fade-in">
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div className="header-content">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarIcon
                style={{
                  ...iconMd,
                  marginRight: 8,
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}
              />
              Quản lý Hoạt động
            </Title>
            <Text type="secondary">
              Xem danh sách, trạng thái và quản lý hoạt động của các câu lạc bộ
            </Text>
          </div>
        </div>
      </div>

      <div className="stat-grid animate-slide-up" style={{ marginBottom: 24 }}>
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card className="stat-card card-hover" bordered={false} key={item.title}>
              <div className="stat-icon" style={{ background: item.accent, color: item.color }}>
                <Icon style={iconMd} />
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

      <Card className="filter-card" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Tìm kiếm theo tiêu đề, mô tả, địa điểm..."
                allowClear
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                size="large" 
                icon={<MagnifyingGlassIcon style={iconSm} />}
                onClick={() => {}}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={filterClub}
              onChange={setFilterClub}
              placeholder="Tất cả CLB"
            >
              <Option value="all">Tất cả CLB</Option>
              {clubs.map(club => (
                <Option key={club.id} value={club.id.toString()}>{club.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="sapToi">Sắp tới</Option>
              <Option value="dangDienRa">Đang diễn ra</Option>
              <Option value="daHoanThanh">Đã hoàn thành</Option>
              <Option value="daHuy">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card className="activities-card">
        <div className="table-head">
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Danh sách hoạt động</Title>
            <Text type="secondary">Lọc và xem chi tiết hoạt động</Text>
          </div>
          <Tag color="blue">{filteredActivities.length} hoạt động</Tag>
        </div>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          size="middle"
          bordered
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hoạt động`
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <CalendarIcon style={iconMd} />
            Thông tin Hoạt động
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={
          <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
        }
        width={700}
      >
        {selectedActivity && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tiêu đề">{selectedActivity.title || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedActivity.description || <Text type="secondary" italic>Chưa có mô tả</Text>}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Câu lạc bộ">
              {getClubName(selectedActivity.clubId)}
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              {selectedActivity.location || <Text type="secondary" italic>Chưa có địa điểm</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {selectedActivity.startTime 
                ? new Date(selectedActivity.startTime).toLocaleString('vi-VN') 
                : <Text type="secondary" italic>Chưa có thông tin</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {selectedActivity.endTime 
                ? new Date(selectedActivity.endTime).toLocaleString('vi-VN') 
                : <Text type="secondary" italic>Chưa có thông tin</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedActivity.status)}>
                {getStatusLabel(selectedActivity.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </div>
  );
};

export default Activities;

