import { useState } from 'react';
import { Card, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions } from 'antd';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { joinRequests as initialRequests } from '../../data/mockData';
import { showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Requests.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Requests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.clubName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApprove = async (id) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: 'approved' }
        : req
    ));
    setShowDetailModal(false);
    showSuccess('Đã duyệt yêu cầu thành công!');
  };

  const handleReject = async (id) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: 'rejected' }
        : req
    ));
    setShowDetailModal(false);
    showSuccess('Đã từ chối yêu cầu!');
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="requests-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DocumentTextIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Duyệt yêu cầu gia nhập
          </Title>
          <Text type="secondary">Xét duyệt đơn đăng ký tham gia câu lạc bộ của sinh viên</Text>
        </div>
      </div>

      {/* Request Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }} className="animate-slide-up">
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Chờ duyệt"
              value={pendingCount}
              prefix={<ClockIcon style={iconMd} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Đã duyệt"
              value={approvedCount}
              prefix={<CheckCircleIcon style={iconMd} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Từ chối"
              value={rejectedCount}
              prefix={<XCircleIcon style={iconMd} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }} className="animate-slide-up">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={16}>
            <Search
              placeholder="Tìm kiếm theo tên, MSSV, CLB..."
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
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Requests Grid */}
      <Row gutter={[16, 16]}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Col xs={24} sm={12} lg={8} key={request.id}>
              <Card
                hoverable
                className={`request-card ${request.status}`}
                actions={[
                  <Button
                    type="link"
                    icon={<EyeIcon className="w-4 h-4" />}
                    onClick={() => handleViewDetail(request)}
                  >
                    Xem chi tiết
                  </Button>,
                  ...(request.status === 'pending' ? [
                    <Button
                      type="link"
                      danger
                      icon={<XCircleIcon className="w-4 h-4" />}
                      onClick={() => handleReject(request.id)}
                    >
                      Từ chối
                    </Button>,
                    <Button
                      type="link"
                      style={{ color: '#52c41a' }}
                      icon={<CheckCircleIcon className="w-4 h-4" />}
                      onClick={() => handleApprove(request.id)}
                    >
                      Duyệt
                    </Button>
                  ] : [])
                ]}
              >
                <div style={{ marginBottom: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>{request.fullName}</Title>
                  <Text type="secondary">MSSV: {request.studentId}</Text>
                </div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">CLB: </Text>
                    <Text strong>{request.clubName}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Email: </Text>
                    <Text>{request.email}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Ngày yêu cầu: </Text>
                    <Text>{new Date(request.requestDate).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <div>
                    <Tag color={
                      request.status === 'pending' ? 'orange' :
                      request.status === 'approved' ? 'green' : 'red'
                    }>
                      {request.status === 'pending' ? 'Chờ duyệt' :
                       request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                    </Tag>
                  </div>
                </Space>
                <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Lý do tham gia:</Text>
                  <Text style={{ display: 'block', marginTop: 4 }}>{request.reason}</Text>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">Không tìm thấy yêu cầu nào</Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <DocumentTextIcon style={iconMd} />
            Chi tiết yêu cầu gia nhập
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={selectedRequest?.status === 'pending' ? (
          <Space>
            <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
            <Button danger onClick={() => handleReject(selectedRequest.id)}>
              Từ chối
            </Button>
            <Button type="primary" onClick={() => handleApprove(selectedRequest.id)}>
              Duyệt đơn
            </Button>
          </Space>
        ) : (
          <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
        )}
        width={700}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Họ và tên">{selectedRequest.fullName}</Descriptions.Item>
            <Descriptions.Item label="MSSV">{selectedRequest.studentId}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedRequest.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedRequest.phone}</Descriptions.Item>
            <Descriptions.Item label="Câu lạc bộ">{selectedRequest.clubName}</Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                selectedRequest.status === 'pending' ? 'orange' :
                selectedRequest.status === 'approved' ? 'green' : 'red'
              }>
                {selectedRequest.status === 'pending' ? 'Chờ duyệt' :
                 selectedRequest.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do tham gia">
              {selectedRequest.reason}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Requests;
