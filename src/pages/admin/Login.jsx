import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { adminUser } from '../../data/mockData';
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
  
  // Fallback to public folder if import fails
  const backgroundImage = loginBackgroundImg || '/login-background.jpg';

  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (values.username === adminUser.username && values.password === adminUser.password) {
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        showSuccess('Đăng nhập thành công!', 'Chào mừng trở lại').then(() => {
          navigate('/admin/dashboard');
        });
      } else {
        showError('Tên đăng nhập hoặc mật khẩu không đúng!', 'Đăng nhập thất bại');
      }
      setLoading(false);
    }, 500);
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
              Demo: username: <strong>admin</strong> / password: <strong>admin123</strong>
            </Text>
          </div>
        </Card>
    </div>
  );
};

export default Login;

