import React, { useEffect, useState } from 'react';
import donorService from '../../services/donor.service';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await donorService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await donorService.markNotificationRead(id);
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Your Notifications</h1>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`bg-white rounded-lg shadow p-4 ${!notif.is_read ? 'border-l-4 border-primary-500' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notif.bloodbank_name} • {formatDateTime(notif.created_at)}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <button onClick={() => markAsRead(notif.id)} className="text-xs text-primary-600">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;