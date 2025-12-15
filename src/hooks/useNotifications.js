import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../services/config';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await notificationAPI.getUnread();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Get accountId from token
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

  // Setup SignalR connection
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

  // Start connection and setup event handlers
  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR Connected');

        // Join user's notification group
        const accountId = getAccountIdFromToken();
        if (accountId) {
          await connection.invoke('Join', accountId);
        }

        // Fetch initial notifications
        fetchNotifications();
      } catch (error) {
        console.error('SignalR Connection Error:', error);
      }
    };

    // Listen for new notifications
    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    startConnection();

    return () => {
      connection.stop();
    };
  }, [connection, fetchNotifications]);

  return {
    notifications,
    isLoading,
    unreadCount: notifications.length,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};
