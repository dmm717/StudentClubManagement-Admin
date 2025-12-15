import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions, Form, DatePicker } from 'antd';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { activitiesAPI, clubsAPI } from '../../services/api';
import { showConfirm, showSuccess, showError } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import dayjs from 'dayjs';
import './Activities.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Component Activities - Quản lý hoạt động của các câu lạc bộ
 * Chức năng: Xem danh sách, xem chi tiết, cập nhật, xóa activities
 */
const Activities = () => {
  // State quản lý danh sách activities và clubs
  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State quản lý modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [updateForm] = Form.useForm();

  // Load danh sách clubs khi component mount
  useEffect(() => {
    loadClubs();
  }, []);

  // Load activities khi filterClub thay đổi
  useEffect(() => {
    // Khi filterClub thay đổi, reload activities với API tương ứng
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClub]);

  /**
   * Hàm load danh sách clubs để hiển thị trong dropdown filter
   * API: GET /api/clubs
   */
  const loadClubs = async () => {
    try {
      const response = await clubsAPI.getAll();
      setClubs(response.data || []);
    } catch (error) {
      // Silent fail for clubs loading
    }
  };

  /**
   * Hàm load danh sách activities
   * API 1: GET /api/activities - Lấy tất cả activities (khi filterClub === 'all')
   * API 3: GET /api/activities/club/{clubId} - Lấy activities theo club (khi chọn club cụ thể)
   */
  const loadActivities = async () => {
    setLoading(true);
    try {
      let response;
      if (filterClub === 'all') {
        // Sử dụng API 1: Lấy tất cả activities
        response = await activitiesAPI.getAll();
      } else {
        // Sử dụng API 3: Lấy activities theo club
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
    // Filter theo search term (client-side vì API không hỗ trợ search)
    const matchesSearch = 
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter theo status (client-side)
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    // Club filter đã được xử lý ở API level (API 1 hoặc API 3)
    return matchesSearch && matchesStatus;
  });

  /**
   * Hàm xem chi tiết activity
   * API 4: GET /api/activities/{id}
   * @param {number} activityId - ID của activity cần xem chi tiết
   */
  const handleViewDetail = async (activityId) => {
    try {
      const response = await activitiesAPI.getById(activityId);
      setSelectedActivity(response.data);
      setShowDetailModal(true);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tải thông tin hoạt động!');
    }
  };

  const handleUpdate = (activity) => {
    setSelectedActivity(activity);
    updateForm.setFieldsValue({
      title: activity.title,
      description: activity.description,
      location: activity.location,
      status: activity.status,
      startTime: activity.startTime ? dayjs(activity.startTime) : null,
      endTime: activity.endTime ? dayjs(activity.endTime) : null,
    });
    setShowUpdateModal(true);
  };

  /**
   * Hàm xử lý submit form cập nhật activity
   * API: PUT /api/activities/{id}
   * @param {object} values - Giá trị từ form (title, description, location, status, startTime, endTime)
   */
  const handleUpdateSubmit = async (values) => {
    try {
      // Convert dayjs date objects to ISO string
      const updateData = {
        ...values,
        startTime: values.startTime ? values.startTime.toISOString() : null,
        endTime: values.endTime ? values.endTime.toISOString() : null,
      };
      await activitiesAPI.update(selectedActivity.id, updateData);
      showSuccess('Đã cập nhật hoạt động thành công!');
      setShowUpdateModal(false);
      updateForm.resetFields();
      loadActivities();  // Reload danh sách sau khi cập nhật
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể cập nhật hoạt động!');
    }
  };

  /**
   * Hàm xử lý xóa activity
   * API: DELETE /api/activities/{id}
   * @param {object} activity - Activity cần xóa
   */
  const handleDelete = async (activity) => {
    const result = await showConfirm(
      `Bạn có chắc chắn muốn xóa hoạt động "${activity.title}"? Hành động này không thể hoàn tác!`,
      'Xác nhận xóa hoạt động'
    );
    
    if (result.isConfirmed) {
      try {
        await activitiesAPI.delete(activity.id);
        showSuccess('Đã xóa hoạt động thành công!');
        loadActivities();  // Reload danh sách sau khi xóa
      } catch (error) {
        showError(error.response?.data?.message || 'Không thể xóa hoạt động!');
      }
    }
  };

  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club?.name || `CLB ID: ${clubId}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'upcoming':
        return 'green';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Đang diễn ra';
      case 'upcoming':
        return 'Sắp tới';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'N/A';
    }
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconXl = getIconSize('xl');

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
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeIcon style={iconSm} />}
            onClick={() => handleViewDetail(record.id)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PencilIcon style={iconSm} />}
            onClick={() => handleUpdate(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
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

  const stats = {
    total: activities.length,
    upcoming: activities.filter(a => a.status?.toLowerCase() === 'upcoming').length,
    active: activities.filter(a => a.status?.toLowerCase() === 'active').length,
    completed: activities.filter(a => a.status?.toLowerCase() === 'completed').length,
  };

  return (
    <div className="activities-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="header-content">
          <div>
            <Title level={2}>Quản lý Hoạt động</Title>
            <Text type="secondary">Xem và quản lý tất cả hoạt động của các câu lạc bộ</Text>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hoạt động"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={stats.upcoming}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
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
              <Option value="upcoming">Sắp tới</Option>
              <Option value="active">Đang diễn ra</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Activities Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hoạt động`
          }}
        />
      </Card>

      {/* Detail Modal */}
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

      {/* Update Modal */}
      <Modal
        title={
          <Space>
            <PencilIcon style={iconMd} />
            Cập nhật Hoạt động
          </Space>
        }
        open={showUpdateModal}
        onCancel={() => {
          setShowUpdateModal(false);
          updateForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateSubmit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề hoạt động" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả hoạt động" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Địa điểm"
          >
            <Input placeholder="Nhập địa điểm" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="Thời gian bắt đầu"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian bắt đầu"
            />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="Thời gian kết thúc"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian kết thúc"
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="upcoming">Sắp tới</Option>
              <Option value="active">Đang diễn ra</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowUpdateModal(false);
                updateForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Activities;

