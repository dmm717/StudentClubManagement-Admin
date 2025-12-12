import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions, Form } from 'antd';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { clubLeaderRequestAPI, accountsAPI } from '../../services/api';
import { showSuccess, showError, showConfirm } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Requests.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Component Requests - Duyệt yêu cầu trở thành Club Leader
 * Chức năng: Xem danh sách yêu cầu, xem chi tiết, duyệt/từ chối yêu cầu
 */
const Requests = () => {
  // State quản lý danh sách yêu cầu
  const [requests, setRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]); // Gộp đã duyệt và từ chối
  const [loading, setLoading] = useState(false);
  const [loadingProcessed, setLoadingProcessed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermProcessed, setSearchTermProcessed] = useState('');
  
  // State quản lý modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectForm] = Form.useForm();

  // Load danh sách yêu cầu khi component mount
  useEffect(() => {
    loadPendingRequests();
    // TODO: Gọi API để load danh sách đã duyệt và từ chối khi có API
    // loadProcessedRequests();
  }, []);

  /**
   * Hàm load danh sách yêu cầu chờ duyệt
   * API: GET /api/club-leader-requests (admin only)
   * Sau đó load thông tin account cho mỗi request: GET /api/admin/accounts/{id}
   */
  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      // Backend: GET /api/club-leader-requests returns array directly
      const response = await clubLeaderRequestAPI.getPending();
      // Axios wraps response in .data, backend returns array directly
      const requestsData = Array.isArray(response.data) ? response.data : [];
      
      // Fetch account details for each request
      const requestsWithAccounts = await Promise.all(
        requestsData.map(async (request) => {
          try {
            const accountResponse = await accountsAPI.getById(request.accountId);
            return {
              ...request,
              account: accountResponse.data
            };
          } catch (error) {
            return {
              ...request,
              account: null
            };
          }
        })
      );
      
      setRequests(requestsWithAccounts);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tải danh sách yêu cầu!');
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * TODO: Hàm load danh sách yêu cầu đã xử lý (đã duyệt + từ chối)
   * API: Cần thêm API endpoint để lấy danh sách này
   * Ví dụ: GET /api/club-leader-requests/processed hoặc gọi 2 API riêng
   */
  const loadProcessedRequests = async () => {
    setLoadingProcessed(true);
    try {
      // TODO: Gọi API khi có
      // const response = await clubLeaderRequestAPI.getProcessed();
      // hoặc
      // const [approved, rejected] = await Promise.all([
      //   clubLeaderRequestAPI.getApproved(),
      //   clubLeaderRequestAPI.getRejected()
      // ]);
      // const processed = [...approved, ...rejected];
      // setProcessedRequests(processed);
      setProcessedRequests([]);
    } catch (error) {
      console.error('Error loading processed requests:', error);
      setProcessedRequests([]);
    } finally {
      setLoadingProcessed(false);
    }
  };

  /**
   * Hàm filter danh sách requests theo search term
   * Tìm kiếm theo tên, username, email, hoặc accountId
   */
  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.account?.fullName?.toLowerCase().includes(searchLower) ||
      request.account?.username?.toLowerCase().includes(searchLower) ||
      request.account?.email?.toLowerCase().includes(searchLower) ||
      request.accountId?.toString().includes(searchLower)
    );
  });

  const filteredProcessedRequests = processedRequests.filter(request => {
    if (!searchTermProcessed) return true;
    const searchLower = searchTermProcessed.toLowerCase();
    return (
      request.account?.fullName?.toLowerCase().includes(searchLower) ||
      request.account?.username?.toLowerCase().includes(searchLower) ||
      request.account?.email?.toLowerCase().includes(searchLower) ||
      request.accountId?.toString().includes(searchLower)
    );
  });

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  /**
   * Hàm xử lý duyệt yêu cầu trở thành Club Leader
   * API: PUT /api/club-leader-requests/{id}/approve
   * Khi duyệt, hệ thống sẽ tự động tạo tài khoản Club Leader cho user
   * @param {object} request - Yêu cầu cần duyệt
   */
  const handleApprove = async (request) => {
    const result = await showConfirm(
      `Bạn có chắc chắn muốn duyệt yêu cầu của "${request.account?.fullName || 'người dùng này'}"?`,
      'Xác nhận duyệt yêu cầu'
    );
    
    if (result.isConfirmed) {
      try {
        await clubLeaderRequestAPI.approve(request.id);
        showSuccess('Đã duyệt yêu cầu thành công! Tài khoản club leader đã được tạo.');
        setShowDetailModal(false);
        loadPendingRequests();  // Reload danh sách sau khi duyệt
        // TODO: Reload danh sách đã xử lý khi có API
        // loadProcessedRequests();
      } catch (error) {
        showError(error.response?.data?.message || 'Không thể duyệt yêu cầu!');
      }
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(false);
    setShowRejectModal(true);
    rejectForm.resetFields();
  };

  /**
   * Hàm xử lý submit form từ chối yêu cầu
   * API: PUT /api/club-leader-requests/{id}/reject
   * @param {object} values - Giá trị từ form (rejectReason - lý do từ chối)
   */
  const handleRejectSubmit = async (values) => {
    try {
      await clubLeaderRequestAPI.reject(selectedRequest.id, values.rejectReason || '');
      showSuccess('Đã từ chối yêu cầu!');
      setShowRejectModal(false);
      loadPendingRequests();  // Reload danh sách sau khi từ chối
      // TODO: Reload danh sách đã xử lý khi có API
      // loadProcessedRequests();
    } catch (error) {
      showError('Không thể từ chối yêu cầu!');
    }
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  const iconXl = getIconSize('xl');
  const pendingCount = requests.length;

  return (
    <div className="requests-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DocumentTextIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Duyệt yêu cầu trở thành Trưởng CLB
          </Title>
          <Text type="secondary">Xét duyệt và cung cấp tài khoản Club Leader cho sinh viên</Text>
        </div>
      </div>

      {/* Request Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }} className="animate-slide-up">
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={pendingCount}
              prefix={<ClockIcon style={iconMd} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Yêu cầu đã duyệt"
              value={processedRequests.filter(r => r.status === 'approved').length}
              prefix={<CheckCircleIcon style={iconMd} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Yêu cầu từ chối"
              value={processedRequests.filter(r => r.status === 'rejected').length}
              prefix={<XCircleIcon style={iconMd} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Two Column Layout: Pending và Processed */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Yêu cầu chờ duyệt */}
        <Col xs={24} lg={12}>
          <div>
            <Title level={3} style={{ marginBottom: 16 }}>
              <ClockIcon style={{ ...iconMd, marginRight: 8, color: '#faad14' }} />
              Yêu cầu chờ duyệt
            </Title>
            
            {/* Search for Pending */}
            <Card style={{ marginBottom: 24 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Tìm kiếm yêu cầu chờ duyệt..."
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
            </Card>

            {/* Pending Requests Grid */}
            <Row gutter={[16, 16]}>
              {loading ? (
                <Col span={24}>
                  <Card loading={true} style={{ minHeight: 200 }} />
                </Col>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <Col xs={24} key={request.id}>
                    <Card
                      hoverable
                      className="request-card pending"
                      actions={[
                        <Button
                          type="link"
                          icon={<EyeIcon style={iconSm} />}
                          onClick={() => handleViewDetail(request)}
                        >
                          Chi tiết
                        </Button>,
                        <Button
                          type="link"
                          danger
                          icon={<XCircleIcon style={iconSm} />}
                          onClick={() => handleReject(request)}
                        >
                          Từ chối
                        </Button>,
                        <Button
                          type="link"
                          style={{ color: '#52c41a' }}
                          icon={<CheckCircleIcon style={iconSm} />}
                          onClick={() => handleApprove(request)}
                        >
                          Duyệt
                        </Button>
                      ]}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0 }}>
                          {request.account?.fullName || 'N/A'}
                        </Title>
                        <Text type="secondary">
                          {request.account?.username || `ID: ${request.accountId}`}
                        </Text>
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">Email: </Text>
                          <Text>{request.account?.email || 'N/A'}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Ngày yêu cầu: </Text>
                          <Text>
                            {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                        <div>
                          <Tag color="orange">Chờ duyệt</Tag>
                        </div>
                      </Space>
                      {request.reason && (
                        <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Lý do:</Text>
                          <Text style={{ display: 'block', marginTop: 4 }}>{request.reason}</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Card>
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">Không có yêu cầu chờ duyệt</Text>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        </Col>

        {/* Right Column: Yêu cầu đã xử lý */}
        <Col xs={24} lg={12}>
          <div>
            <Title level={3} style={{ marginBottom: 16 }}>
              <DocumentTextIcon style={{ ...iconMd, marginRight: 8 }} />
              Yêu cầu đã xử lý
            </Title>
            
            {/* Search for Processed */}
            <Card style={{ marginBottom: 24 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Tìm kiếm yêu cầu đã xử lý..."
                  allowClear
                  size="large"
                  value={searchTermProcessed}
                  onChange={(e) => setSearchTermProcessed(e.target.value)}
                />
                <Button 
                  size="large" 
                  icon={<MagnifyingGlassIcon style={iconSm} />}
                />
              </Space.Compact>
            </Card>

            {/* Processed Requests Grid */}
            <Row gutter={[16, 16]}>
              {loadingProcessed ? (
                <Col span={24}>
                  <Card loading={true} style={{ minHeight: 200 }} />
                </Col>
              ) : filteredProcessedRequests.length > 0 ? (
                filteredProcessedRequests.map((request) => (
                  <Col xs={24} key={request.id}>
                    <Card
                      hoverable
                      className={`request-card ${request.status === 'approved' ? 'approved' : 'rejected'}`}
                      actions={[
                        <Button
                          type="link"
                          icon={<EyeIcon style={iconSm} />}
                          onClick={() => handleViewDetail(request)}
                        >
                          Chi tiết
                        </Button>
                      ]}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0 }}>
                          {request.account?.fullName || request.fullName || 'N/A'}
                        </Title>
                        <Text type="secondary">
                          {request.account?.username || request.username || `ID: ${request.accountId}`}
                        </Text>
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">Email: </Text>
                          <Text>{request.account?.email || request.email || 'N/A'}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Ngày yêu cầu: </Text>
                          <Text>
                            {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                        {request.processedAt && (
                          <div>
                            <Text type="secondary">
                              {request.status === 'approved' ? 'Ngày duyệt: ' : 'Ngày từ chối: '}
                            </Text>
                            <Text>
                              {new Date(request.processedAt).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                        )}
                        <div>
                          {request.status === 'approved' ? (
                            <Tag color="green">Đã duyệt</Tag>
                          ) : (
                            <Tag color="red">Đã từ chối</Tag>
                          )}
                        </div>
                      </Space>
                      {request.reason && (
                        <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Lý do:</Text>
                          <Text style={{ display: 'block', marginTop: 4 }}>{request.reason}</Text>
                        </div>
                      )}
                      {request.status === 'rejected' && request.note && request.note !== 'Rejected' && (
                        <div style={{ marginTop: 12, padding: 12, background: '#fff1f0', borderRadius: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Lý do từ chối:</Text>
                          <Text style={{ display: 'block', marginTop: 4, color: '#ff4d4f' }}>{request.note}</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Card>
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">Không có yêu cầu đã xử lý</Text>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <DocumentTextIcon style={iconMd} />
            Chi tiết yêu cầu trở thành Club Leader
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={
          <Space>
            <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
            <Button danger onClick={() => handleReject(selectedRequest)}>
              Từ chối
            </Button>
            <Button type="primary" onClick={() => handleApprove(selectedRequest)}>
              Duyệt đơn
            </Button>
          </Space>
        }
        width={600}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Họ và tên">
              {selectedRequest.account?.fullName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedRequest.account?.username || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRequest.account?.email || selectedRequest.account?.Email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedRequest.account?.phone || selectedRequest.account?.Phone || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="orange">Chờ duyệt</Tag>
            </Descriptions.Item>
            {selectedRequest.reason && (
              <Descriptions.Item label="Lý do muốn trở thành Club Leader">
                {selectedRequest.reason}
              </Descriptions.Item>
            )}
            {selectedRequest.note && (
              <Descriptions.Item label="Ghi chú xử lý">
                {selectedRequest.note}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu"
        open={showRejectModal}
        onCancel={() => {
          setShowRejectModal(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            name="rejectReason"
            label="Lý do từ chối"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối (không bắt buộc)"
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowRejectModal(false);
                rejectForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit">
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Requests;
