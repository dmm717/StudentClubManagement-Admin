import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions, Form, Table } from 'antd';
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
  
  // State quản lý thống kê
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalRejected: 0,
    totalPending: 0,
    total: 0
  });
  
  // State quản lý modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectForm] = Form.useForm();

  // Load danh sách yêu cầu khi component mount
  useEffect(() => {
    loadPendingRequests();
    loadProcessedRequests();
    loadStats();
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
   * Hàm load danh sách yêu cầu đã xử lý (đã duyệt + từ chối)
   * API: GET /api/admin/accounts/leader-requests/approved
   *      GET /api/admin/accounts/leader-requests/rejected
   */
  const loadProcessedRequests = async () => {
    setLoadingProcessed(true);
    try {
      const [approvedResponse, rejectedResponse] = await Promise.all([
        clubLeaderRequestAPI.getApproved().catch(() => ({ data: [] })),
        clubLeaderRequestAPI.getRejected().catch(() => ({ data: [] }))
      ]);
      
      const approved = Array.isArray(approvedResponse.data) ? approvedResponse.data : [];
      const rejected = Array.isArray(rejectedResponse.data) ? rejectedResponse.data : [];
      
      // Fetch account details for each processed request
      const processedWithAccounts = await Promise.all(
        [...approved, ...rejected].map(async (request) => {
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
      
      setProcessedRequests(processedWithAccounts);
    } catch (error) {
      console.error('Error loading processed requests:', error);
      setProcessedRequests([]);
    } finally {
      setLoadingProcessed(false);
    }
  };

  /**
   * Hàm load thống kê yêu cầu leader
   * API: GET /api/admin/accounts/leader-requests/stats
   */
  const loadStats = async () => {
    try {
      const response = await clubLeaderRequestAPI.getStats();
      if (response.data) {
        setStats({
          totalApproved: response.data.totalApproved || 0,
          totalRejected: response.data.totalRejected || 0,
          totalPending: response.data.totalPending || 0,
          total: response.data.total || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
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
        // Reload tất cả dữ liệu sau khi duyệt
        await Promise.all([
          loadPendingRequests(),
          loadProcessedRequests(),
          loadStats()
        ]);
        // Dispatch event to notify AdminLayout to update badge count
        window.dispatchEvent(new CustomEvent('requestProcessed'));
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
      // Reload tất cả dữ liệu sau khi từ chối
      await Promise.all([
        loadPendingRequests(),
        loadProcessedRequests(),
        loadStats()
      ]);
      // Dispatch event to notify AdminLayout to update badge count
      window.dispatchEvent(new CustomEvent('requestProcessed'));
    } catch (error) {
      showError('Không thể từ chối yêu cầu!');
    }
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  const iconXl = getIconSize('xl');

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
              value={stats.totalPending}
              prefix={<ClockIcon style={iconMd} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Yêu cầu đã duyệt"
              value={stats.totalApproved}
              prefix={<CheckCircleIcon style={iconMd} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-hover">
            <Statistic
              title="Yêu cầu từ chối"
              value={stats.totalRejected}
              prefix={<XCircleIcon style={iconMd} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vertical Layout: Pending trên, Processed dưới */}
      <Row gutter={[0, 24]}>
        {/* Top Section: Yêu cầu chờ duyệt */}
        <Col xs={24}>
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

            {/* Pending Requests Table */}
            <Card>
              <Table
                columns={[
                  {
                    title: 'STT',
                    key: 'stt',
                    width: 70,
                    align: 'center',
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'NGÀY GỬI',
                    key: 'requestDate',
                    width: 160,
                    render: (_, record) => {
                      const date = new Date(record.requestDate);
                      return (
                        <div>
                          <div style={{ fontWeight: 500 }}>{date.toLocaleDateString('vi-VN')}</div>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'LÝ DO',
                    key: 'reason',
                    ellipsis: {
                      showTitle: true,
                    },
                    render: (_, record) => record.reason || '—',
                  },
                  {
                    title: 'TRẠNG THÁI',
                    key: 'status',
                    width: 130,
                    align: 'center',
                    render: () => (
                      <Tag color="orange" style={{ borderRadius: '12px', padding: '4px 14px', fontSize: '13px' }}>
                        Đang chờ
                      </Tag>
                    ),
                  },
                  {
                    title: 'HÀNH ĐỘNG',
                    key: 'actions',
                    width: 280,
                    align: 'center',
                    fixed: 'right',
                    render: (_, record) => (
                      <Space size="small" wrap>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleIcon style={iconSm} />}
                          onClick={() => handleApprove(record)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<XCircleIcon style={iconSm} />}
                          onClick={() => handleReject(record)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          size="small"
                          icon={<EyeIcon style={iconSm} />}
                          onClick={() => handleViewDetail(record)}
                        >
                          Chi tiết
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={filteredRequests}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} yêu cầu`,
                }}
                locale={{
                  emptyText: 'Không có yêu cầu chờ duyệt'
                }}
              />
            </Card>
          </div>
        </Col>

        {/* Bottom Section: Yêu cầu đã xử lý */}
        <Col xs={24}>
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

            {/* Processed Requests Table */}
            <Card>
              <Table
                columns={[
                  {
                    title: 'STT',
                    key: 'stt',
                    width: 70,
                    align: 'center',
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'NGÀY GỬI',
                    key: 'requestDate',
                    width: 160,
                    render: (_, record) => {
                      const date = new Date(record.requestDate);
                      return (
                        <div>
                          <div style={{ fontWeight: 500 }}>{date.toLocaleDateString('vi-VN')}</div>
                        </div>
                      );
                    },
                  },
                  {
                    title: 'LÝ DO',
                    key: 'reason',
                    ellipsis: {
                      showTitle: true,
                    },
                    render: (_, record) => record.reason || '—',
                  },
                  {
                    title: 'TRẠNG THÁI',
                    key: 'status',
                    width: 130,
                    align: 'center',
                    render: (_, record) => {
                      const status = record.status?.toLowerCase();
                      if (status === 'approved') {
                        return (
                          <Tag color="green" style={{ borderRadius: '12px', padding: '4px 14px', fontSize: '13px' }}>
                            Đã duyệt
                          </Tag>
                        );
                      } else if (status === 'rejected') {
                        return (
                          <Tag color="red" style={{ borderRadius: '12px', padding: '4px 14px', fontSize: '13px' }}>
                            Đã từ chối
                          </Tag>
                        );
                      }
                      return (
                        <Tag color="orange" style={{ borderRadius: '12px', padding: '4px 14px', fontSize: '13px' }}>
                          Đang chờ
                        </Tag>
                      );
                    },
                  },
                  {
                    title: 'GHI CHÚ',
                    key: 'note',
                    ellipsis: {
                      showTitle: true,
                    },
                    render: (_, record) => {
                      if (record.status?.toLowerCase() === 'rejected' && record.note && record.note !== 'Rejected') {
                        return record.note;
                      }
                      if (record.status?.toLowerCase() === 'approved' && record.note && record.note !== 'Đã duyệt') {
                        return record.note;
                      }
                      return '—';
                    },
                  },
                ]}
                dataSource={filteredProcessedRequests}
                rowKey="id"
                loading={loadingProcessed}
                scroll={{ x: 'max-content' }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} yêu cầu`,
                }}
                locale={{
                  emptyText: 'Không có yêu cầu đã xử lý'
                }}
              />
            </Card>
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
