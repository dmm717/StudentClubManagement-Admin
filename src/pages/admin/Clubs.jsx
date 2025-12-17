import { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Typography, Row, Col, Statistic, Modal, Descriptions } from 'antd';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon
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
      // Backend: GET /api/clubs returns array directly with monitoring info (memberCount, totalRevenue)
      const clubsResponse = await clubsAPI.getAll();
      const clubsData = clubsResponse.data || [];
      setClubs(clubsData);
      
      // Tính tổng doanh thu từ tất cả các club (backend đã trả về totalRevenue cho mỗi club)
      const totalRev = clubsData.reduce((sum, club) => {
        const revenue = club.totalRevenue || club.TotalRevenue || 0;
        return sum + revenue;
      }, 0);
      setTotalRevenue(totalRev);
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
        // Lấy revenue từ danh sách (backend đã có API trả về totalRevenue)
        revenue: listData.totalRevenue || listData.TotalRevenue || detailData.totalRevenue || detailData.TotalRevenue || 0
      });
      setShowDetailModal(true);
    } catch (error) {
      // Nếu API lỗi, vẫn hiển thị dữ liệu từ danh sách
      const clubFromList = clubs.find(c => c.id === clubId);
      if (clubFromList) {
        setSelectedClub({
          ...clubFromList,
          revenue: clubFromList.totalRevenue || clubFromList.TotalRevenue || 0
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
      align: 'left',
      className: 'col-name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
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
      align: 'center',
      width: 150,
      render: (_, record) => {
        // Lấy totalRevenue từ backend (hỗ trợ cả camelCase và PascalCase)
        const revenue = record.totalRevenue || record.TotalRevenue || 0;
        return <Text strong>{formatCurrency(revenue)}</Text>;
      }
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'establishedDate',
      key: 'establishedDate',
      width: 120,
      align: 'center',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
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
      align: 'center',
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

  const statCards = [
    {
      title: 'Tổng số CLB',
      value: stats.total,
      color: '#1890ff',
      accent: 'rgba(24, 144, 255, 0.12)',
      icon: BuildingOfficeIcon
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)',
      icon: LockOpenIcon
    },
    {
      title: 'Bị khóa',
      value: stats.locked,
      color: '#ff4d4f',
      accent: 'rgba(255, 77, 79, 0.12)',
      icon: LockClosedIcon
    },
    {
      title: 'Tổng thành viên',
      value: stats.totalMembers,
      color: '#722ed1',
      accent: 'rgba(114, 46, 209, 0.12)',
      icon: UserGroupIcon
    },
    {
      title: 'Tổng doanh thu phí',
      value: stats.totalRevenue,
      display: formatCurrency(stats.totalRevenue),
      color: '#52c41a',
      accent: 'rgba(82, 196, 26, 0.12)',
      icon: CurrencyDollarIcon
    }
  ];

  return (
    <div className="clubs-page animate-fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header animate-slide-up" style={{ marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <BuildingOfficeIcon style={{ ...iconMd, marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
            Giám sát Câu lạc bộ
          </Title>
          <Text type="secondary">Xem danh sách CLB, trạng thái, số thành viên và quản lý</Text>
        </div>
      </div>

      {/* Stats */}
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
                  {item.display ?? item.value}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="filter-card" style={{ marginBottom: 24 }}>
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
      <Card className="clubs-card request-card">
        <div className="table-head">
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Danh sách câu lạc bộ</Title>
            <Text type="secondary">Lọc, xem chi tiết và khóa/mở khóa trực tiếp</Text>
          </div>
          <Tag color="blue">{filteredClubs.length} CLB</Tag>
        </div>
        <Table
          columns={columns}
          dataSource={filteredClubs}
          rowKey="id"
          loading={loading}
          size="middle"
          bordered
          scroll={{ x: 'max-content' }}
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
            <Descriptions.Item label="Club Leader">
              {selectedClub.leaderFullName ||
               selectedClub.leaderName ||
               selectedClub.clubLeaderName ||
               selectedClub.leader?.fullName || (
                <Text type="secondary" italic>Chưa có thông tin</Text>
              )}
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
