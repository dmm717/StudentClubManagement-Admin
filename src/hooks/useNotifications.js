import { useState, useEffect, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../services/config';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  const getAccountIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.nameid || payload.sub || payload.accountId);
    } catch {
      return null;
    }
  };

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        await connection.start();

        const accountId = getAccountIdFromToken();
        if (accountId) {
          await connection.invoke('Join', accountId);
        }

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    const processNotification = (notification) => {
      if (!notification || typeof notification !== 'object') return;

      if (Array.isArray(notification)) {
        notification.forEach(notif => processNotification(notif));
        return;
      }

      if (typeof notification !== 'object') return;
      
      const normalized = {
        id: notification.id || notification.Id || `notif-${Date.now()}-${Math.random()}`,
        accountId: notification.accountId || notification.accountID || notification.AccountId || notification.AccountID || 0,
        title: notification.title || notification.Title || 'Thông báo',
        message: notification.message || notification.Message || notification.content || notification.Content || '',
        createdAt: notification.createdAt || notification.CreatedAt || notification.created_at || notification.Created_At || new Date().toISOString(),
        isRead: false
      };
      
      setNotifications(prev => {
        const exists = prev.some(n => n.id === normalized.id);
        if (exists) {
          return prev;
        }
        return [normalized, ...prev];
      });
    };

    connection.on('ReceiveNotification', (notification) => {
      processNotification(notification);
    });

    connection.on('Notification', (data) => {
      processNotification(data);
    });

    connection.on('NewNotification', (data) => {
      processNotification(data);
    });

    connection.on('ActivityCreated', (data) => {
      processNotification(data);
    });

    connection.on('ActivityNotification', (data) => {
      processNotification(data);
    });

    startConnection();

    return () => {
      if (connection) {
        connection.off('ReceiveNotification');
        connection.off('Notification');
        connection.off('NewNotification');
        connection.off('ActivityCreated');
        connection.off('ActivityNotification');
        connection.stop().catch(() => {});
      }
    };
  }, [connection]);

  return {
    notifications,
    isLoading,
    unreadCount: notifications.length,
    markAsRead
  };
};
