import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AlertBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = () =>
      api.get('/alerts').then(r => setCount(r.data.unreadCount || 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  if (!count) return null;
  return (
    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
