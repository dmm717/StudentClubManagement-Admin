import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../../services/api';
import { showError, showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import loginBackgroundImg from '../../assets/images/login-background.jpg';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const icon2xl = getIconSize('2xl');
  
  const backgroundImage = loginBackgroundImg || '/login-background.jpg';

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const response = await authAPI.login(values.username, values.password);
      const { token, accountId, username, email, fullName, roles } = response.data;
      
      const hasAdminRole = roles.some(role => role.toLowerCase() === 'admin');
      if (!hasAdminRole) {
        showError('Bạn không có quyền truy cập trang quản trị!', 'Không có quyền');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('adminUser', JSON.stringify({
        accountId,
        username,
        email,
        fullName,
        roles
      }));
      
      showSuccess('Đăng nhập thành công!', 'Chào mừng trở lại').then(() => {
        navigate('/admin/dashboard');
      });
    } catch (error) {
      showError(
        error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!', 
        'Đăng nhập thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div 
        className="login-background" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <Card className="login-box" bordered={false}>
          <div className="login-header">
            <div className="logo-icon">
              <AcademicCapIcon style={{ ...icon2xl, color: 'rgba(255, 255, 255, 0.95)' }} />
            </div>
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              Hệ thống Quản lý CLB
            </Title>
            <Text type="secondary">Đăng nhập với tư cách Quản trị viên</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserIcon style={iconMd} />}
                placeholder="Tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockClosedIcon style={iconMd} />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="login-btn"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-info">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đăng nhập với tài khoản quản trị viên
            </Text>
          </div>
        </Card>
    </div>
  );
};

export default Login;

