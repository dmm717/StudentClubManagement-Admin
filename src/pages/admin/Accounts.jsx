import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Modal, Form, Switch, Descriptions } from 'antd';
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

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetail, setAccountDetail] = useState(null);
  
  const [resetPasswordForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        showError('API quản lý tài khoản chưa được implement trong backend!');
      } else {
        showError(error.response?.data?.message || 'Không thể tải danh sách tài khoản!');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? account.isActive : !account.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (account) => {
    const action = account.isActive ? 'khóa' : 'kích hoạt';
    
    const result = await showConfirm(
      `Bạn có chắc chắn muốn ${action} tài khoản "${account.username}"?`,
      `Xác nhận ${action} tài khoản`
    );
    
    if (result.isConfirmed) {
      try {
        if (account.isActive) {
          await accountsAPI.lock(account.id);
        } else {
          await accountsAPI.activate(account.id);
        }
        showSuccess(`Đã ${action} tài khoản thành công!`);
        loadAccounts();
      } catch (error) {
        showError(error.response?.data?.message || `Không thể ${action} tài khoản!`);
      }
    }
  };

  const handleResetPassword = (account) => {
    setSelectedAccount(account);
    setShowResetPasswordModal(true);
    resetPasswordForm.resetFields();
  };

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

  const handleViewDetail = async (account) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
    try {
      const response = await accountsAPI.getById(account.id);
      setAccountDetail(response.data);
    } catch (error) {
      showError('Không thể tải thông tin chi tiết tài khoản!');
      setAccountDetail(account);
    }
  };

  const handleManageRoles = (account) => {
    setSelectedAccount(account);
    roleForm.setFieldsValue({
      isStudent: account.roles?.includes('student') || false,
      isClubLeader: account.roles?.includes('clubleader') || account.roles?.includes('club_leader') || false,
      isAdmin: account.roles?.includes('admin') || false,
    });
    setShowRoleModal(true);
  };

  const handleRoleSubmit = async (values) => {
    const newRoles = [];
    if (values.isStudent) newRoles.push('student');
    if (values.isClubLeader) newRoles.push('clubleader');
    if (values.isAdmin) newRoles.push('admin');

    const currentRoles = selectedAccount.roles || [];
    const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r));

    try {
      for (const role of rolesToAdd) {
        await accountsAPI.addRole(selectedAccount.id, { roleName: role });
      }
      for (const role of rolesToRemove) {
        await accountsAPI.removeRole(selectedAccount.id, { roleName: role });
      }
      showSuccess('Đã cập nhật vai trò thành công!');
      setShowRoleModal(false);
      loadAccounts();
    } catch (error) {
      showError('Không thể cập nhật vai trò!');
    }
  };


  const iconMd = getIconSize('md');
  const iconSm = getIconSize('sm');

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
                <Tag
                  key={role}
                  color={color}
                  style={{ borderRadius: 12, padding: '2px 10px', fontSize: 12 }}
                >
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
        <Tag
          color={record.isActive ? 'green' : 'red'}
          style={{ borderRadius: 12, padding: '4px 14px', fontSize: 13 }}
        >
          {record.isActive ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 420,
      render: (_, record) => (
        <Space
          size="middle"
          style={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Button
            size="middle"
            style={{ minWidth: 96, borderRadius: 999 }}
            onClick={() => handleViewDetail(record)}
            icon={<EyeIcon style={iconSm} />}
          >
            Xem
          </Button>
          <Button
            size="middle"
            type="primary"
            ghost={record.isActive}
            danger={record.isActive}
            style={{ minWidth: 96, borderRadius: 999 }}
            onClick={() => handleToggleStatus(record)}
            icon={record.isActive ? <LockClosedIcon style={iconSm} /> : <LockOpenIcon style={iconSm} />}
          >
            {record.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
          <Button
            size="middle"
            style={{ minWidth: 96, borderRadius: 999 }}
            onClick={() => handleResetPassword(record)}
            icon={<KeyIcon style={iconSm} />}
          >
            Đặt lại mật khẩu
          </Button>
          <Button
            size="middle"
            type="primary"
            style={{ minWidth: 96, borderRadius: 999 }}
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

  const statCards = [
    {
      title: 'Tổng tài khoản',
      value: stats.total,
      color: '#1890ff',
      accent: 'rgba(24, 144, 255, 0.12)'
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)'
    },
    {
      title: 'Bị khóa',
      value: stats.locked,
      color: '#ff4d4f',
      accent: 'rgba(255, 77, 79, 0.12)'
    },
    {
      title: 'Tài khoản Admin',
      value: stats.admin,
      color: '#722ed1',
      accent: 'rgba(114, 46, 209, 0.12)'
    }
  ];

  return (
    <div className="accounts-page animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="header-content">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <UserCircleIcon
                style={{
                  ...iconMd,
                  marginRight: 8,
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}
              />
              Quản lý Tài khoản
            </Title>
            <Text type="secondary">
              Quản lý thông tin tài khoản, phân quyền và trạng thái
            </Text>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {statCards.map((item) => (
          <Card className="stat-card card-hover" bordered={false} key={item.title}>
            <div className="stat-icon" style={{ background: item.accent, color: item.color }}>
              <UserCircleIcon style={iconMd} />
            </div>
            <div className="stat-content">
              <Text type="secondary">{item.title}</Text>
              <div className="stat-value" style={{ color: item.color }}>
                {item.value}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="filter-card" style={{ marginBottom: 24 }}>
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
      </Card>

      <Card className="accounts-card">
        <div className="table-head">
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Danh sách tài khoản</Title>
            <Text type="secondary">Xem chi tiết, khóa/mở khóa, reset mật khẩu và phân quyền</Text>
          </div>
          <Tag color="blue">{filteredAccounts.length} tài khoản</Tag>
        </div>
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          size="middle"
          bordered
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
        />
      </Card>

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
