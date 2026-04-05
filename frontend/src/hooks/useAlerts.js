import { useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * Polls unread alert count every 30 seconds.
 * Usage:  const { unreadCount } = useAlerts();
 */
export default function useAlerts(pollInterval = 30000) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = () =>
      api.get('/alerts')
        .then(r => setUnreadCount(r.data.unreadCount || 0))
        .catch(() => {});

    load();
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  return { unreadCount };
}
