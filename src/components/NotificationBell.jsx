import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown, Button, List, Typography, Empty } from 'antd';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';

const { Text } = Typography;

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMins < 1) return 'Vừa xong';
  if (diffInMins < 60) return `${diffInMins} phút trước`;
  
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

// Hàm xác định loại notification và route tương ứng (cho admin)
const getNotificationRoute = (title, message) => {
  const titleLower = title.toLowerCase();
  const messageLower = message.toLowerCase();
  const combined = `${titleLower} ${messageLower}`;

  // Leader request notifications - admin nhận notification về yêu cầu làm leader mới
  if (combined.includes('yêu cầu làm leader') || combined.includes('trở thành leader') || 
      combined.includes('leader request') || 
      (combined.includes('yêu cầu') && combined.includes('leader')) ||
      combined.includes('đơn trở thành leader')) {
    return '/admin/requests';
  }

  // Activity notifications - admin sẽ đi đến trang activities
  if (combined.includes('hoạt động') || combined.includes('activity') || 
      combined.includes('sự kiện') || combined.includes('event') ||
      combined.includes('hoat dong')) {
    return '/admin/activities';
  }

  // Club status notifications - admin sẽ đi đến trang clubs
  if ((combined.includes('khóa') || combined.includes('mở') || combined.includes('lock') || 
       combined.includes('unlock') || combined.includes('mo') || combined.includes('khoa')) &&
      (combined.includes('club') || combined.includes('câu lạc bộ') || combined.includes('clb') ||
       combined.includes('cau lac bo'))) {
    return '/admin/clubs';
  }

  return null;
};

export const NotificationBell = memo(() => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleMarkAsRead = useCallback((notificationId) => {
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Navigate to appropriate page
    const route = getNotificationRoute(notification.title, notification.message);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  }, [handleMarkAsRead, navigate]);

  const menuItems = useMemo(() => {
    if (notifications.length === 0) {
      return (
        <div style={{ width: 360, padding: '48px 24px', textAlign: 'center', backgroundColor: '#fafafa' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#e8eaf6',
            marginBottom: 16
          }}>
            <BellIcon style={{ width: 32, height: 32, color: '#5c6bc0' }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 15, color: '#424242', display: 'block', marginBottom: 4 }}>
              Không có thông báo mới
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Bạn sẽ nhận được thông báo ở đây
            </Text>
          </div>
        </div>
      );
    }

    return (
    <div style={{ width: 380, maxHeight: 480, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
        {unreadCount > 0 && (
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
            ({unreadCount} chưa đọc)
          </Text>
        )}
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => {
          const hasRoute = getNotificationRoute(item.title, item.message) !== null;
          return (
            <List.Item
              style={{ 
                padding: '12px 16px',
                cursor: hasRoute ? 'pointer' : 'default',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => hasRoute ? handleNotificationClick(item) : handleMarkAsRead(item.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                      }}
                      style={{ padding: '0 4px' }}
                    >
                      ×
                    </Button>
                  </div>
                }
                description={
                  <>
                    <div style={{ marginTop: 4, fontSize: 13 }}>{item.message}</div>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                      {formatTime(item.createdAt)}
                    </Text>
                    {hasRoute && (
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block', color: '#1890ff' }}>
                        Nhấn để xem chi tiết →
                      </Text>
                    )}
                  </>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
    );
  }, [notifications, unreadCount, handleMarkAsRead, handleNotificationClick]);

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => menuItems}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="default" offset={[-8, 8]}>
        <Button
          type="text"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '4px 8px',
            color: '#fff',
            transition: 'all 0.2s',
            height: '32px',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <BellIcon style={{ width: 22, height: 22, strokeWidth: 2.5 }} />
        </Button>
      </Badge>
    </Dropdown>
  );
});
