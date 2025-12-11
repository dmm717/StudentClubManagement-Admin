import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Form, Switch, Descriptions } from 'antd';
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ShieldCheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { accountsAPI } from '../../services/api';
import { showSuccess, showError, showConfirm } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Accounts.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Component Accounts - Quản lý tài khoản
 * Chức năng: Xem danh sách, khóa/mở khóa, reset mật khẩu, quản lý vai trò
 */
const Accounts = () => {
  // State quản lý danh sách tài khoản
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State quản lý modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetail, setAccountDetail] = useState(null);
  
  // Form instances
  const [resetPasswordForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Load danh sách accounts khi component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  /**
   * Hàm load danh sách tài khoản từ API
   * API: GET /api/admin/accounts
   */
  const loadAccounts = async () => {
    setLoading(true);
    try {
      // TODO: Backend chưa có AccountsController - cần implement GET /api/accounts
      const response = await accountsAPI.getAll();
      // Axios wraps response in .data
      setAccounts(response.data || []);
    } catch (error) {
      // If 404, show message that API is not implemented yet
      if (error.response?.status === 404) {
        showError('API quản lý tài khoản chưa được implement trong backend!');
      } else {
        showError(error.response?.data?.message || 'Không thể tải danh sách tài khoản!');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm filter danh sách accounts theo search term và status
   * Filter client-side để tìm kiếm nhanh
   */
  const filteredAccounts = accounts.filter(account => {
    // Tìm kiếm theo username, fullName, email
    const matchesSearch = 
      account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter theo trạng thái (all/active/locked)
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? account.isActive : !account.isActive);
    
    return matchesSearch && matchesStatus;
  });

  /**
   * Hàm xử lý khóa/mở khóa tài khoản
   * API: PUT /api/admin/accounts/{id}/lock hoặc PUT /api/admin/accounts/{id}/activate
   * @param {object} account - Tài khoản cần thay đổi trạng thái
   */
  const handleToggleStatus = async (account) => {
    const action = account.isActive ? 'khóa' : 'kích hoạt';
    
    // Hiển thị confirm dialog
    const result = await showConfirm(
      `Bạn có chắc chắn muốn ${action} tài khoản "${account.username}"?`,
      `Xác nhận ${action} tài khoản`
    );
    
    if (result.isConfirmed) {
      try {
        // Gọi API lock hoặc activate tùy theo trạng thái hiện tại
        if (account.isActive) {
          await accountsAPI.lock(account.id);  // PUT /api/admin/accounts/{id}/lock
        } else {
          await accountsAPI.activate(account.id);  // PUT /api/admin/accounts/{id}/activate
        }
        showSuccess(`Đã ${action} tài khoản thành công!`);
        loadAccounts();  // Reload danh sách sau khi cập nhật
      } catch (error) {
        showError(error.response?.data?.message || `Không thể ${action} tài khoản!`);
      }
    }
  };

  /**
   * Hàm mở modal reset mật khẩu
   * @param {object} account - Tài khoản cần reset mật khẩu
   */
  const handleResetPassword = (account) => {
    setSelectedAccount(account);
    setShowResetPasswordModal(true);
    resetPasswordForm.resetFields();
  };

  /**
   * Hàm xử lý submit form reset mật khẩu
   * API: PUT /api/admin/accounts/{id}/reset-password
   * @param {object} values - Giá trị từ form (newPassword, confirmPassword)
   */
  const handleResetPasswordSubmit = async (values) => {
    try {
      await accountsAPI.resetPassword(selectedAccount.id, values.newPassword);
      showSuccess('Đã reset mật khẩu thành công!');
      setShowResetPasswordModal(false);
      resetPasswordForm.resetFields();
    } catch (error) {
      showError('Không thể reset mật khẩu!');
    }
  };

  /**
   * Hàm xem chi tiết tài khoản
   * API: GET /api/admin/accounts/{id}
   * @param {object} account - Tài khoản cần xem chi tiết
   */
  const handleViewDetail = async (account) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
    try {
      // Gọi API để lấy thông tin chi tiết tài khoản
      const response = await accountsAPI.getById(account.id);
      setAccountDetail(response.data);
    } catch (error) {
      showError('Không thể tải thông tin chi tiết tài khoản!');
      // Nếu không lấy được chi tiết, sử dụng dữ liệu từ danh sách
      setAccountDetail(account);
    }
  };

  /**
   * Hàm mở modal quản lý vai trò
   * Load vai trò hiện tại của account vào form
   * @param {object} account - Tài khoản cần quản lý vai trò
   */
  const handleManageRoles = (account) => {
    setSelectedAccount(account);
    // Set giá trị form từ roles hiện tại của account
    roleForm.setFieldsValue({
      isStudent: account.roles?.includes('student') || false,
      isClubLeader: account.roles?.includes('clubleader') || account.roles?.includes('club_leader') || false,
      isAdmin: account.roles?.includes('admin') || false,
    });
    setShowRoleModal(true);
  };

  /**
   * Hàm xử lý submit form quản lý vai trò
   * API: POST /api/admin/accounts/{id}/roles (thêm vai trò)
   * API: DELETE /api/admin/accounts/{id}/roles (xóa vai trò)
   * @param {object} values - Giá trị từ form (isStudent, isClubLeader, isAdmin)
   */
  const handleRoleSubmit = async (values) => {
    // Tạo mảng roles mới từ form values
    const newRoles = [];
    if (values.isStudent) newRoles.push('student');
    if (values.isClubLeader) newRoles.push('clubleader');
    if (values.isAdmin) newRoles.push('admin');

    // So sánh với roles hiện tại để tìm roles cần thêm/xóa
    const currentRoles = selectedAccount.roles || [];
    const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));      // Roles cần thêm
    const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r));   // Roles cần xóa

    try {
      // Thêm các vai trò mới: POST /api/admin/accounts/{id}/roles
      for (const role of rolesToAdd) {
        await accountsAPI.addRole(selectedAccount.id, { roleName: role });
      }
      // Xóa các vai trò cũ: DELETE /api/admin/accounts/{id}/roles
      for (const role of rolesToRemove) {
        await accountsAPI.removeRole(selectedAccount.id, { roleName: role });
      }
      showSuccess('Đã cập nhật vai trò thành công!');
      setShowRoleModal(false);
      loadAccounts();  // Reload danh sách sau khi cập nhật
    } catch (error) {
      showError('Không thể cập nhật vai trò!');
    }
  };


  const iconMd = getIconSize('md');
  const iconSm = getIconSize('sm');
  const iconXl = getIconSize('xl');

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username) => <strong>{username}</strong>
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Vai trò',
      key: 'roles',
      render: (_, record) => {
        const roles = record.roles || [];
        if (roles.length === 0) return <Text type="secondary">Chưa có vai trò</Text>;
        
        return (
          <Space wrap size="small">
            {roles.map(role => {
              const roleLower = role.toLowerCase();
              let color = 'green';
              let label = 'Student';
              
              if (roleLower === 'admin') {
                color = 'red';
                label = 'Admin';
              } else if (roleLower === 'clubleader' || roleLower === 'club_leader') {
                color = 'blue';
                label = 'Club Leader';
              } else if (roleLower === 'student') {
                color = 'green';
                label = 'Student';
              }
              
              return (
                <Tag key={role} color={color}>
                  {label}
                </Tag>
              );
            })}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 320,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            onClick={() => handleViewDetail(record)}
            icon={<EyeIcon style={iconSm} />}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="primary"
            ghost={record.isActive}
            danger={record.isActive}
            onClick={() => handleToggleStatus(record)}
            icon={record.isActive ? <LockClosedIcon style={iconSm} /> : <LockOpenIcon style={iconSm} />}
          >
            {record.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
          <Button
            size="small"
            onClick={() => handleResetPassword(record)}
            icon={<KeyIcon style={iconSm} />}
          >
            Reset MK
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleManageRoles(record)}
            icon={<ShieldCheckIcon style={iconSm} />}
          >
            Vai trò
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.isActive).length,
    locked: accounts.filter(a => !a.isActive).length,
    admin: accounts.filter(a => a.roles?.some(r => r.toLowerCase() === 'admin')).length,
    clubLeader: accounts.filter(a => a.roles?.some(r => {
      const roleLower = r.toLowerCase();
      return roleLower === 'clubleader' || roleLower === 'club_leader';
    })).length,
    student: accounts.filter(a => a.roles?.some(r => r.toLowerCase() === 'student')).length,
  };

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <UserCircleIcon style={iconXl} />
          </div>
          <div>
            <Title level={2}>Quản lý Tài khoản</Title>
            <Text type="secondary">Quản lý thông tin tài khoản, phân quyền và trạng thái</Text>
          </div>
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Tổng tài khoản" 
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Đang hoạt động" 
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Bị khóa" 
              value={stats.locked}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Club Leader" 
              value={stats.clubLeader}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                placeholder="Tìm kiếm tên, email..."
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
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="locked">Bị khóa</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredAccounts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} tài khoản`,
            }}
          />
        </Space>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        title="Reset mật khẩu"
        open={showResetPasswordModal}
        onCancel={() => {
          setShowResetPasswordModal(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPasswordSubmit}
        >
          <Form.Item label="Tài khoản">
            <Input value={selectedAccount?.username} disabled />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowResetPasswordModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Reset mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Account Detail Modal */}
      <Modal
        title="Chi tiết tài khoản"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setAccountDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowDetailModal(false);
            setAccountDetail(null);
          }}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {accountDetail && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên đăng nhập">
              <strong>{accountDetail.username || accountDetail.Username}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {accountDetail.fullName || accountDetail.FullName || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {accountDetail.email || accountDetail.Email || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {accountDetail.phone || accountDetail.Phone || 'Chưa có'}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Space wrap size="small">
                {(accountDetail.roles || accountDetail.Roles || []).map(role => {
                  const roleLower = role.toLowerCase();
                  let color = 'green';
                  let label = 'Student';
                  
                  if (roleLower === 'admin') {
                    color = 'red';
                    label = 'Admin';
                  } else if (roleLower === 'clubleader' || roleLower === 'club_leader') {
                    color = 'blue';
                    label = 'Club Leader';
                  } else if (roleLower === 'student') {
                    color = 'green';
                    label = 'Student';
                  }
                  
                  return (
                    <Tag key={role} color={color}>
                      {label}
                    </Tag>
                  );
                })}
                {(!accountDetail.roles || accountDetail.roles.length === 0) && 
                 (!accountDetail.Roles || accountDetail.Roles.length === 0) && (
                  <Text type="secondary">Chưa có vai trò</Text>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={(accountDetail.isActive || accountDetail.IsActive) ? 'success' : 'error'}>
                {(accountDetail.isActive || accountDetail.IsActive) ? 'Hoạt động' : 'Bị khóa'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Manage Roles Modal */}
      <Modal
        title="Quản lý vai trò"
        open={showRoleModal}
        onCancel={() => {
          setShowRoleModal(false);
          roleForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSubmit}
        >
          <Form.Item label="Tài khoản">
            <Input value={selectedAccount?.username} disabled />
          </Form.Item>
          <Form.Item
            name="isStudent"
            label="Student"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <Form.Item
            name="isClubLeader"
            label="Club Leader"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <Form.Item
            name="isAdmin"
            label="Admin"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowRoleModal(false);
                roleForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật vai trò
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
