import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, DatePicker, Select, Button, Card, Typography, Space } from 'antd';
import { PencilIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { members, clubs } from '../../data/mockData';
import { showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import dayjs from 'dayjs';
import './MemberForm.css';

const { Title, Text } = Typography;

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode) {
      const member = members.find(m => m.id === parseInt(id));
      if (member) {
        form.setFieldsValue({
          studentId: member.studentId,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          clubId: member.clubId,
          role: member.role,
          joinDate: dayjs(member.joinDate),
          feeStatus: member.feeStatus,
          status: member.status
        });
      }
    }
  }, [id, isEditMode, form]);

  const handleSubmit = async (values) => {
    const formData = {
      ...values,
      joinDate: values.joinDate.format('YYYY-MM-DD')
    };
    
    console.log('Form submitted:', formData);
    showSuccess(
      isEditMode ? 'Cập nhật thành viên thành công!' : 'Thêm thành viên mới thành công!',
      'Thành công'
    ).then(() => {
      navigate('/admin/members');
    });
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');

  return (
    <div className="member-form-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="form-header animate-slide-up" style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftIcon style={iconSm} />}
            onClick={() => navigate('/admin/members')}
          >
            Quay lại
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            {isEditMode ? (
              <>
                <PencilIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
                Chỉnh sửa thành viên
              </>
            ) : (
              <>
                <PlusIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
                Thêm thành viên mới
              </>
            )}
          </Title>
          <Text type="secondary">
            {isEditMode ? 'Cập nhật thông tin thành viên' : 'Điền thông tin để thêm thành viên mới'}
          </Text>
        </div>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Form.Item
              label="Mã số sinh viên"
              name="studentId"
              rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
            >
              <Input placeholder="Ví dụ: SV001" disabled={isEditMode} />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="example@student.edu.vn" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
              ]}
            >
              <Input placeholder="0123456789" />
            </Form.Item>

            <Form.Item
              label="Câu lạc bộ"
              name="clubId"
              rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ!' }]}
            >
              <Select placeholder="-- Chọn câu lạc bộ --">
                {clubs.map(club => (
                  <Select.Option key={club.id} value={club.id}>
                    {club.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select>
                <Select.Option value="Thành viên">Thành viên</Select.Option>
                <Select.Option value="Trưởng CLB">Trưởng CLB</Select.Option>
                <Select.Option value="Phó CLB">Phó CLB</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày tham gia"
              name="joinDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày tham gia!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Trạng thái phí"
              name="feeStatus"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái phí!' }]}
            >
              <Select>
                <Select.Option value="pending">Chờ thanh toán</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
                <Select.Option value="overdue">Quá hạn</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select>
                <Select.Option value="active">Đang hoạt động</Select.Option>
                <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => navigate('/admin/members')}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default MemberForm;
