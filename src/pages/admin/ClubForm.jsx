import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, DatePicker, Select, Button, Card, Typography, Space } from 'antd';
import { PencilIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { clubs } from '../../data/mockData';
import { showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import dayjs from 'dayjs';
import './ClubForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ClubForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode) {
      const club = clubs.find(c => c.id === parseInt(id));
      if (club) {
        form.setFieldsValue({
          code: club.code,
          name: club.name,
          description: club.description,
          leader: club.leader,
          foundedDate: dayjs(club.foundedDate),
          fee: club.fee,
          status: club.status
        });
      }
    }
  }, [id, isEditMode, form]);

  const handleSubmit = async (values) => {
    const formData = {
      ...values,
      foundedDate: values.foundedDate.format('YYYY-MM-DD')
    };
    
    console.log('Form submitted:', formData);
    showSuccess(
      isEditMode ? 'Cập nhật CLB thành công!' : 'Thêm CLB mới thành công!',
      'Thành công'
    ).then(() => {
      navigate('/admin/clubs');
    });
  };

  const iconSm = getIconSize('sm');
  const iconLg = getIconSize('lg');

  return (
    <div className="club-form-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="form-header animate-slide-up" style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftIcon style={iconSm} />}
            onClick={() => navigate('/admin/clubs')}
          >
            Quay lại
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            {isEditMode ? (
              <>
                <PencilIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
                Chỉnh sửa CLB
              </>
            ) : (
              <>
                <PlusIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
                Thêm CLB mới
              </>
            )}
          </Title>
          <Text type="secondary">
            {isEditMode ? 'Cập nhật thông tin câu lạc bộ' : 'Điền thông tin để tạo câu lạc bộ mới'}
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
          <Form.Item
            label="Mã CLB"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã CLB!' }]}
          >
            <Input placeholder="Ví dụ: CLB001" disabled={isEditMode} />
          </Form.Item>

          <Form.Item
            label="Tên CLB"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên CLB!' }]}
          >
            <Input placeholder="Nhập tên câu lạc bộ" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả về câu lạc bộ" />
          </Form.Item>

          <Form.Item
            label="Trưởng CLB"
            name="leader"
            rules={[{ required: true, message: 'Vui lòng nhập tên trưởng CLB!' }]}
          >
            <Input placeholder="Nhập tên trưởng CLB" />
          </Form.Item>

          <Form.Item
            label="Ngày thành lập"
            name="foundedDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Phí hoạt động (VNĐ)"
            name="fee"
            rules={[
              { required: true, message: 'Vui lòng nhập phí hoạt động!' },
              { type: 'number', min: 1, message: 'Phí hoạt động phải lớn hơn 0!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập phí hoạt động"
              min={0}
              step={1000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
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
              <Button onClick={() => navigate('/admin/clubs')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ClubForm;
