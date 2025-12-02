import { useState } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Radio } from 'antd';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { fees as initialFees } from '../../data/mockData';
import { showSuccess } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Fees.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Fees = () => {
  const [fees, setFees] = useState(initialFees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const filteredFees = fees.filter(fee => {
    const matchesSearch = 
      fee.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.clubName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePayment = (fee) => {
    if (fee.status !== 'completed') {
      setSelectedFee(fee);
      setShowPaymentModal(true);
    }
  };

  const confirmPayment = async () => {
    setFees(fees.map(fee => 
      fee.id === selectedFee.id 
        ? { 
            ...fee, 
            status: 'completed', 
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
            note: ''
          }
        : fee
    ));
    setShowPaymentModal(false);
    setSelectedFee(null);
    setPaymentMethod('cash');
    showSuccess('Xác nhận thanh toán thành công!');
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconLg = getIconSize('lg');
  const totalRevenue = fees.filter(f => f.status === 'completed').reduce((sum, f) => sum + f.amount, 0);
  const pendingRevenue = fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

  const columns = [
    {
      title: 'MSSV',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 100
    },
    {
      title: 'Thành viên',
      dataIndex: 'memberName',
      key: 'memberName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubName',
      key: 'clubName'
    },
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      key: 'semester'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'green', text: 'Đã thanh toán' },
          pending: { color: 'orange', text: 'Chờ thanh toán' },
          overdue: { color: 'red', text: 'Quá hạn' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        record.status !== 'completed' ? (
          <Button
            type="primary"
            size="small"
            icon={<CreditCardIcon style={iconSm} />}
            onClick={() => handlePayment(record)}
          >
            Thanh toán
          </Button>
        ) : (
          <Tag color="green">Hoàn tất</Tag>
        )
      )
    }
  ];

  return (
    <div className="fees-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <CurrencyDollarIcon style={{ ...iconLg, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Quản lý Phí hoạt động
          </Title>
          <Text type="secondary">Quản lý thu phí và thanh toán của thành viên</Text>
        </div>
      </div>

      {/* Revenue Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }} className="animate-slide-up">
        <Col xs={24} sm={12}>
          <Card className="card-hover">
            <Statistic
              title="Tổng doanh thu"
              value={formatCurrency(totalRevenue)}
              prefix={<CurrencyDollarIcon style={iconMd} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {fees.filter(f => f.status === 'completed').length} khoản đã thanh toán
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="card-hover">
            <Statistic
              title="Chưa thu"
              value={formatCurrency(pendingRevenue)}
              prefix={<CurrencyDollarIcon style={iconMd} />}
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {fees.filter(f => f.status !== 'completed').length} khoản chờ thanh toán
            </Text>
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
              <Option value="completed">Đã thanh toán</Option>
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Fees Table */}
      <Card className="animate-fade-in" style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredFees}
          rowKey="id"
          rowClassName={(record) => record.status === 'overdue' ? 'overdue-row' : ''}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khoản phí`
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        title={
          <Space>
            <CreditCardIcon style={iconMd} />
            Xác nhận thanh toán
          </Space>
        }
        open={showPaymentModal}
        onOk={confirmPayment}
        onCancel={() => {
          setShowPaymentModal(false);
          setSelectedFee(null);
          setPaymentMethod('cash');
        }}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        width={500}
      >
        {selectedFee && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Thành viên:</Text> {selectedFee.memberName}
            </div>
            <div>
              <Text strong>MSSV:</Text> {selectedFee.studentId}
            </div>
            <div>
              <Text strong>Câu lạc bộ:</Text> {selectedFee.clubName}
            </div>
            <div>
              <Text strong>Học kỳ:</Text> {selectedFee.semester}
            </div>
            <div>
              <Text strong>Số tiền:</Text>{' '}
              <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                {formatCurrency(selectedFee.amount)}
              </Text>
            </div>
            <div>
              <Text strong>Phương thức thanh toán:</Text>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginTop: 8 }}
              >
                <Space direction="vertical">
                  <Radio value="cash">
                    <Space>
                      <BanknotesIcon style={iconSm} />
                      Tiền mặt
                    </Space>
                  </Radio>
                  <Radio value="transfer">
                    <Space>
                      <CreditCardIcon style={iconSm} />
                      Chuyển khoản
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
