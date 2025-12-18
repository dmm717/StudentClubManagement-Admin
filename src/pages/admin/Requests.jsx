import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Space, Tag, Typography, Row, Col, Modal, Descriptions, Form, Table } from 'antd';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { clubLeaderRequestAPI, accountsAPI } from '../../services/api';
import { showSuccess, showError, showConfirm } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Requests.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProcessed, setLoadingProcessed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermProcessed, setSearchTermProcessed] = useState('');
  
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalRejected: 0,
    totalPending: 0,
    total: 0
  });
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectForm] = Form.useForm();
  const [approveForm] = Form.useForm();

  useEffect(() => {
    loadPendingRequests();
    loadProcessedRequests();
    loadStats();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await clubLeaderRequestAPI.getPending();
      const requestsData = Array.isArray(response.data) ? response.data : [];
      
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
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProcessedRequests = async () => {
    setLoadingProcessed(true);
    try {
      const [approvedResponse, rejectedResponse] = await Promise.all([
        clubLeaderRequestAPI.getApproved().catch(() => ({ data: [] })),
        clubLeaderRequestAPI.getRejected().catch(() => ({ data: [] }))
      ]);
      
      const approved = Array.isArray(approvedResponse.data) ? approvedResponse.data : [];
      const rejected = Array.isArray(rejectedResponse.data) ? rejectedResponse.data : [];
      
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

  const handleViewDetail = async (request) => {
    try {
      const accountId = request.accountId || request.account?.id;
      if (accountId) {
        try {
          const accountResponse = await accountsAPI.getById(accountId);
          const updatedRequest = {
            ...request,
            account: accountResponse.data
          };
          setSelectedRequest(updatedRequest);
        } catch (error) {
          setSelectedRequest(request);
        }
      } else {
        setSelectedRequest(request);
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading account detail:', error);
      setSelectedRequest(request);
      setShowDetailModal(true);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(false);
    setShowApproveModal(true);
    approveForm.resetFields();
  };

  const handleApproveSubmit = async (values) => {
    try {
      await clubLeaderRequestAPI.approve(selectedRequest.id, values.adminNote || '');
      showSuccess('Đã duyệt yêu cầu thành công! Tài khoản club leader đã được tạo.');
      setShowApproveModal(false);
      await Promise.all([
        loadPendingRequests(),
        loadProcessedRequests(),
        loadStats()
      ]);
      window.dispatchEvent(new CustomEvent('requestProcessed'));
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể duyệt yêu cầu!');
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(false);
    setShowRejectModal(true);
    rejectForm.resetFields();
  };

  const handleRejectSubmit = async (values) => {
    try {
      await clubLeaderRequestAPI.reject(selectedRequest.id, values.rejectReason || '');
      showSuccess('Đã từ chối yêu cầu!');
      setShowRejectModal(false);
      await Promise.all([
        loadPendingRequests(),
        loadProcessedRequests(),
        loadStats()
      ]);
      window.dispatchEvent(new CustomEvent('requestProcessed'));
    } catch (error) {
      showError('Không thể từ chối yêu cầu!');
    }
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');

  const statCards = [
    {
      title: 'Yêu cầu chờ duyệt',
      value: stats.totalPending,
      color: '#faad14',
      accent: 'rgba(250, 173, 20, 0.12)',
      icon: ClockIcon,
    },
    {
      title: 'Yêu cầu đã duyệt',
      value: stats.totalApproved,
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)',
      icon: CheckCircleIcon,
    },
    {
      title: 'Yêu cầu từ chối',
      value: stats.totalRejected,
      color: '#ff4d4f',
      accent: 'rgba(255, 77, 79, 0.12)',
      icon: XCircleIcon,
    },
    {
      title: 'Tổng số yêu cầu',
      value: stats.total,
      color: '#1890ff',
      accent: 'rgba(24, 144, 255, 0.12)',
      icon: DocumentTextIcon,
    },
  ];

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

      <Row gutter={[0, 24]}>
        <Col xs={24}>
          <div>
            <Title level={3} style={{ marginBottom: 16 }}>
              <ClockIcon style={{ ...iconMd, marginRight: 8, color: '#faad14' }} />
              Yêu cầu chờ duyệt
            </Title>
            
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

            <Card className="request-card">
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
                    title: 'HỌ VÀ TÊN',
                    key: 'fullName',
                    width: 220,
                    render: (_, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {record.account?.fullName || record.fullName || 'Chưa có tên'}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {record.account?.email || record.email || ''}
                        </div>
                      </div>
                    ),
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
                    width: 320,
                    align: 'center',
                    fixed: 'right',
                    render: (_, record) => (
                      <Space size="middle" wrap>
                        <Button
                          type="primary"
                          size="middle"
                          style={{ minWidth: 96, borderRadius: 999 }}
                          icon={<CheckCircleIcon style={iconSm} />}
                          onClick={() => handleApprove(record)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          danger
                          size="middle"
                          style={{ minWidth: 96, borderRadius: 999 }}
                          icon={<XCircleIcon style={iconSm} />}
                          onClick={() => handleReject(record)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          size="middle"
                          style={{ minWidth: 96, borderRadius: 999 }}
                          icon={<EyeIcon style={iconSm} />}
                          onClick={() => handleViewDetail(record)}
                        >
                          Chi tiết
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                size="middle"
                bordered
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

        <Col xs={24}>
          <div>
            <Title level={3} style={{ marginBottom: 16 }}>
              <DocumentTextIcon style={{ ...iconMd, marginRight: 8 }} />
              Yêu cầu đã xử lý
            </Title>
            
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

            <Card className="request-card">
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
                    title: 'HỌ VÀ TÊN',
                    key: 'fullName',
                    width: 220,
                    render: (_, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {record.account?.fullName || record.fullName || 'Chưa có tên'}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {record.account?.email || record.email || ''}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'TRẠNG THÁI',
                    key: 'status',
                    width: 130,
                    align: 'center',
                    render: (_, record) => {
                      const status = record.status?.toLowerCase();
                      if (status === 'daduycho' || status === 'approved') {
                        return (
                          <Tag color="green" style={{ borderRadius: '12px', padding: '4px 14px', fontSize: '13px' }}>
                            Đã duyệt
                          </Tag>
                        );
                      } else if (status === 'datuochoi' || status === 'rejected') {
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
                    title: 'THAO TÁC',
                    key: 'actions',
                    width: 120,
                    align: 'center',
                    fixed: 'right',
                    render: (_, record) => (
                      <Button
                        shape="circle"
                        icon={<EllipsisHorizontalIcon style={iconSm} />}
                        onClick={() => handleViewDetail(record)}
                      />
                    ),
                  },
                ]}
                size="middle"
                bordered
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

      <Modal
        title={null}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={
          <Space>
            <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
            {(selectedRequest?.status?.toLowerCase() === 'dangcho' || selectedRequest?.status?.toLowerCase() === 'pending') && (
              <>
                <Button danger onClick={() => handleReject(selectedRequest)}>
                  Từ chối
                </Button>
                <Button type="primary" onClick={() => {
                  setShowDetailModal(false);
                  handleApprove(selectedRequest);
                }}>
                  Duyệt đơn
                </Button>
              </>
            )}
          </Space>
        }
        width={800}
      >
        {selectedRequest && (
          <div>
            <Title level={4} style={{ marginBottom: 16, marginTop: 0 }}>
              <UserCircleIcon style={{ ...iconMd, marginRight: 8 }} />
              Thông tin tài khoản
            </Title>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID tài khoản">
                {selectedRequest.accountId || selectedRequest.account?.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                {selectedRequest.account?.username || selectedRequest.username || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {selectedRequest.account?.fullName || selectedRequest.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRequest.account?.email || selectedRequest.account?.Email || selectedRequest.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedRequest.account?.phone || selectedRequest.account?.Phone || selectedRequest.phone || 'Chưa có'}
              </Descriptions.Item>
              {(selectedRequest.account?.major || selectedRequest.account?.Major) && (
                <Descriptions.Item label="Chuyên ngành">
                  {selectedRequest.account?.major || selectedRequest.account?.Major || 'N/A'}
                </Descriptions.Item>
              )}
              {(selectedRequest.account?.skills || selectedRequest.account?.Skills) && (
                <Descriptions.Item label="Kỹ năng">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedRequest.account?.skills || selectedRequest.account?.Skills || 'N/A'}
                  </div>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag color={selectedRequest.account?.isActive ? 'green' : 'red'}>
                  {selectedRequest.account?.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
              </Descriptions.Item>
              {selectedRequest.account?.createdAt && (
                <Descriptions.Item label="Ngày tạo tài khoản">
                  {new Date(selectedRequest.account.createdAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
              )}
              {selectedRequest.account?.roles && selectedRequest.account.roles.length > 0 && (
                <Descriptions.Item label="Vai trò">
                  <Space wrap>
                    {selectedRequest.account.roles.map((role, index) => (
                      <Tag key={index} color="blue">
                        {role}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={4} style={{ marginBottom: 16 }}>
              <DocumentTextIcon style={{ ...iconMd, marginRight: 8 }} />
              Thông tin đơn yêu cầu
            </Title>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID đơn">
                {selectedRequest.id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày gửi yêu cầu">
                {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
                <Descriptions.Item label="Lý do muốn trở thành Club Leader">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedRequest.motivation || 'Chưa nhập'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedRequest.experience || 'Chưa nhập'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tầm nhìn">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedRequest.vision || 'Chưa nhập'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Cam kết">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedRequest.commitment || 'Chưa nhập'}
                  </div>
                </Descriptions.Item>
              {selectedRequest.adminNote && (
                <Descriptions.Item label="Ghi chú của admin">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedRequest.adminNote}
                  </div>
                </Descriptions.Item>
              )}
              {selectedRequest.rejectReason && (
                <Descriptions.Item label="Lý do từ chối">
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ff4d4f' }}>
                    {selectedRequest.rejectReason}
                  </div>
                </Descriptions.Item>
              )}
              {selectedRequest.processedAt && (
                <Descriptions.Item label="Thời gian xử lý">
                  {new Date(selectedRequest.processedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="Duyệt yêu cầu"
        open={showApproveModal}
        onCancel={() => {
          setShowApproveModal(false);
          approveForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApproveSubmit}
        >
          <Form.Item
            name="adminNote"
            label="Ghi chú"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (không bắt buộc)"
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowApproveModal(false);
                approveForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
