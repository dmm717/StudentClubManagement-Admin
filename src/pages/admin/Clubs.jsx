import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions } from 'antd';
const { Search } = Input;
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { clubsAPI } from '../../services/api';
import { showConfirm, showSuccess, showError } from '../../utils/notifications';
import { getIconSize } from '../../utils/iconSizes';
import './Clubs.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Component Clubs - Giám sát và quản lý câu lạc bộ
 * Chức năng: Xem danh sách, xem chi tiết, khóa/mở khóa clubs
 */
const Clubs = () => {
  // State quản lý danh sách clubs
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State quản lý modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  // Load danh sách clubs khi component mount
  useEffect(() => {
    loadClubs();
  }, []);

  /**
   * Hàm load danh sách clubs từ API
   * API: GET /api/clubs
   */
  const loadClubs = async () => {
    setLoading(true);
    try {
      // Backend: GET /api/clubs returns array directly
      const clubsResponse = await clubsAPI.getAll();
      setClubs(clubsResponse.data || []);
      
      // TODO: Backend chưa có API này - tạm thời set 0
      // const revenueResponse = await clubsAPI.getAllRevenue();
      // setTotalRevenue(revenueResponse.data?.total || 0);
      setTotalRevenue(0);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tải danh sách câu lạc bộ!');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm filter danh sách clubs theo search term và status
   * Filter client-side để tìm kiếm nhanh
   */
  const filteredClubs = clubs.filter(club => {
    // Tìm kiếm theo tên và mô tả
    const matchesSearch = 
      club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Xử lý cả "active" (lowercase) và "Active" (PascalCase)
    const isActive = club.status === 'active' || club.status === 'Active';
    
    // Filter theo trạng thái (all/active/locked)
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? isActive : !isActive);
    
    return matchesSearch && matchesStatus;
  });

  /**
   * Hàm xem chi tiết club
   * API: GET /api/clubs/{id}
   * Merge dữ liệu từ danh sách (có establishedDate, membershipFee) với detail API (có activities)
   * @param {number} clubId - ID của club cần xem chi tiết
   */
  const handleViewDetail = async (clubId) => {
    try {
      // Lấy dữ liệu từ danh sách clubs hiện tại (có đầy đủ establishedDate và membershipFee)
      const clubFromList = clubs.find(c => c.id === clubId);
      
      // Gọi API để lấy thông tin chi tiết (activities, etc.)
      const clubResponse = await clubsAPI.getById(clubId);
      
      // Merge dữ liệu: ưu tiên dữ liệu từ danh sách (có establishedDate, membershipFee)
      // và bổ sung thông tin từ detail API (activities, etc.)
      const detailData = clubResponse.data || {};
      const listData = clubFromList || {};
      
      setSelectedClub({
        ...listData, // Dữ liệu từ danh sách có đầy đủ establishedDate và membershipFee
        ...detailData, // Dữ liệu từ detail API (activities, etc.)
        // Đảm bảo giữ lại establishedDate và membershipFee từ danh sách (xử lý cả PascalCase và camelCase)
        establishedDate: listData.establishedDate || listData.EstablishedDate || detailData.establishedDate || detailData.EstablishedDate,
        EstablishedDate: listData.establishedDate || listData.EstablishedDate || detailData.establishedDate || detailData.EstablishedDate,
        membershipFee: (listData.membershipFee !== null && listData.membershipFee !== undefined) 
          ? listData.membershipFee 
          : (listData.MembershipFee !== null && listData.MembershipFee !== undefined)
          ? listData.MembershipFee
          : (detailData.membershipFee !== null && detailData.membershipFee !== undefined)
          ? detailData.membershipFee
          : detailData.MembershipFee,
        MembershipFee: (listData.membershipFee !== null && listData.membershipFee !== undefined) 
          ? listData.membershipFee 
          : (listData.MembershipFee !== null && listData.MembershipFee !== undefined)
          ? listData.MembershipFee
          : (detailData.membershipFee !== null && detailData.membershipFee !== undefined)
          ? detailData.membershipFee
          : detailData.MembershipFee,
        revenue: 0 // TODO: Backend chưa có API revenue - tạm thời set 0
      });
      setShowDetailModal(true);
    } catch (error) {
      // Nếu API lỗi, vẫn hiển thị dữ liệu từ danh sách
      const clubFromList = clubs.find(c => c.id === clubId);
      if (clubFromList) {
        setSelectedClub({
          ...clubFromList,
          revenue: 0
        });
        setShowDetailModal(true);
      } else {
      showError(error.response?.data?.message || 'Không thể tải thông tin câu lạc bộ!');
      }
    }
  };

  /**
   * Hàm xử lý khóa/mở khóa club
   * API: PUT /api/clubs/{id} với UpdateClubDto (cập nhật status)
   * @param {object} club - Club cần thay đổi trạng thái
   */
  const handleToggleStatus = async (club) => {
    const isActive = club.status === 'active' || club.status === 'Active';
    const action = isActive ? 'khóa' : 'mở khóa';
    // Backend dùng "Active"/"Inactive" (PascalCase)
    const newStatus = isActive ? 'Inactive' : 'Active';
    
    // Hiển thị confirm dialog
    const result = await showConfirm(
      `Bạn có chắc chắn muốn ${action} câu lạc bộ "${club.name}"?`,
      `Xác nhận ${action} CLB`
    );
    
    if (result.isConfirmed) {
      try {
        // Lấy đầy đủ thông tin club trước khi update để không mất dữ liệu
        let clubData = club;
        try {
          const detailResponse = await clubsAPI.getById(club.id);
          clubData = { ...club, ...detailResponse.data };
        } catch (e) {
          // Nếu không lấy được detail, dùng dữ liệu từ danh sách
        }
        
        // Dùng API update với UpdateClubDto - cập nhật status và giữ nguyên các field khác
        const updateData = {
          name: clubData.name || club.name,
          description: clubData.description || club.description || '',
          status: newStatus,  // Cập nhật status mới
          establishedDate: clubData.establishedDate || clubData.EstablishedDate || club.establishedDate || club.EstablishedDate,
          membershipFee: (clubData.membershipFee !== null && clubData.membershipFee !== undefined) 
            ? clubData.membershipFee 
            : (clubData.MembershipFee !== null && clubData.MembershipFee !== undefined)
            ? clubData.MembershipFee
            : (club.membershipFee !== null && club.membershipFee !== undefined)
            ? club.membershipFee
            : club.MembershipFee,
          imageClubsUrl: clubData.imageClubsUrl || clubData.ImageClubsUrl || club.imageClubsUrl || club.ImageClubsUrl || null
        };
        
        await clubsAPI.update(club.id, updateData);  // PUT /api/clubs/{id}
        showSuccess(`Đã ${action} câu lạc bộ thành công!`);
        loadClubs();  // Reload danh sách sau khi cập nhật
      } catch (error) {
        showError(error.response?.data?.message || `Không thể ${action} câu lạc bộ!`);
      }
    }
  };

  const iconSm = getIconSize('sm');
  const iconMd = getIconSize('md');
  const iconXl = getIconSize('xl');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Tên CLB',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Số thành viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      align: 'center',
      width: 120,
      render: (count) => count || 0
    },
    {
      title: 'Doanh thu',
      key: 'revenue',
      align: 'right',
      width: 150,
      render: (_, record) => {
        // Revenue will be loaded per club if needed
        return <Text strong>{formatCurrency(record.revenue || 0)}</Text>;
      }
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'establishedDate',
      key: 'establishedDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const statusLower = (record.status || '').toLowerCase();
        const isActive = statusLower === 'active';
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeIcon style={iconSm} />}
            onClick={() => handleViewDetail(record.id)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            danger={record.status === 'active' || record.status === 'Active'}
            icon={record.status === 'active' || record.status === 'Active' ? <LockClosedIcon style={iconSm} /> : <LockOpenIcon style={iconSm} />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' || record.status === 'Active' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </Space>
      )
    }
  ];

  const stats = {
    total: clubs.length,
    active: clubs.filter(c => c.status === 'active' || c.status === 'Active').length,
    locked: clubs.filter(c => c.status !== 'active' && c.status !== 'Active').length,
    totalMembers: clubs.reduce((sum, c) => sum + (c.memberCount || 0), 0),
    totalRevenue: totalRevenue,
  };

  return (
    <div className="clubs-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="header-content">
          <div className="header-icon">
            <BuildingOfficeIcon style={iconXl} />
          </div>
          <div>
            <Title level={2}>Giám sát Câu lạc bộ</Title>
            <Text type="secondary">Xem danh sách CLB, trạng thái, số thành viên và quản lý</Text>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số CLB"
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
              title="Tổng thành viên"
              value={stats.totalMembers}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu phí"
              value={formatCurrency(stats.totalRevenue)}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
              placeholder="Tìm kiếm theo tên CLB..."
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
          <Col xs={24} sm={8}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="locked">Bị khóa</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Clubs Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredClubs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} câu lạc bộ`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <BuildingOfficeIcon style={iconMd} />
            Thông tin Câu lạc bộ
          </Space>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={
          <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
        }
        width={700}
      >
        {selectedClub && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên CLB">{selectedClub.name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedClub.description || <Text type="secondary" italic>Chưa có mô tả</Text>}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thành lập">
              {(selectedClub.establishedDate || selectedClub.EstablishedDate) 
                ? new Date(selectedClub.establishedDate || selectedClub.EstablishedDate).toLocaleDateString('vi-VN') 
                : <Text type="secondary" italic>Chưa có thông tin</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Phí thành viên">
              {(selectedClub.membershipFee !== null && selectedClub.membershipFee !== undefined) ||
               (selectedClub.MembershipFee !== null && selectedClub.MembershipFee !== undefined) ? (
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {formatCurrency(selectedClub.membershipFee ?? selectedClub.MembershipFee ?? 0)}
                </Text>
              ) : (
                <Text type="secondary" italic>Chưa thiết lập</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số thành viên">{selectedClub.memberCount || 0}</Descriptions.Item>
            <Descriptions.Item label="Tổng doanh thu phí">
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                {formatCurrency(selectedClub.revenue || 0)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={((selectedClub.status || '').toLowerCase() === 'active') ? 'green' : 'red'}>
                {((selectedClub.status || '').toLowerCase() === 'active') ? 'Hoạt động' : 'Bị khóa'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </div>
  );
};

export default Clubs;
