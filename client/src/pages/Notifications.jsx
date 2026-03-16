import { useEffect, useMemo, useState } from 'react';
import { clearNotifications, getNotifications, markAllNotificationsRead, markNotificationRead } from '../utils/analytics';
import { timeAgo } from '../utils/timeAgo';
import FeedbackState from '../components/FeedbackState';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const TYPE_ICON = {
  success: <FaCheck size={11} className="text-emerald-500" />,
  error:   <FaTimes size={11} className="text-red-500" />,
  warning: <FaExclamationTriangle size={11} className="text-amber-500" />,
  info:    <FaInfoCircle size={11} className="text-neutral-400" />,
};

function groupByDate(items) {
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  for (const item of items) {
    const d = new Date(item.createdAt || item.timestamp || Date.now());
    d.setHours(0, 0, 0, 0);
    if (d >= today)          groups.Today.push(item);
    else if (d >= yesterday) groups.Yesterday.push(item);
    else                     groups.Earlier.push(item);
  }
  return groups;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getNotifications();
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);
  const groups      = useMemo(() => groupByDate(items), [items]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <FeedbackState
          emoji="🔔"
          title="No notifications yet"
          description="Updates about listings, contact actions, and resolution events appear here."
          primaryAction={{ label: 'Browse Listings', to: '/search' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notifications</h1>
          <p className="text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-outline text-xs px-3 py-1.5"
              onClick={async () => setItems(await markAllNotificationsRead())}
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={async () => setItems(await clearNotifications())}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(groups).map(([label, group]) => {
          if (!group.length) return null;
          return (
            <div key={label}>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-1">
                {label}
              </p>
              <div className="flex flex-col gap-2">
                {group.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={async () => setItems(await markNotificationRead(item._id || item.id))}
                    className={`text-left rounded-2xl px-4 py-3.5 transition-colors w-full ${
                      item.read
                        ? 'bg-surface hover:bg-neutral-100'
                        : 'bg-neutral-900 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        item.read ? 'bg-neutral-100' : 'bg-white/10'
                      }`}>
                        {TYPE_ICON[item.type] || TYPE_ICON.info}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-semibold text-sm truncate ${item.read ? '' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <span className={`text-xs flex-shrink-0 ${item.read ? 'text-neutral-400' : 'text-neutral-300'}`}>
                            {timeAgo(item.createdAt || item.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm mt-0.5 ${item.read ? 'text-neutral-600' : 'text-neutral-200'}`}>
                          {item.message}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-white mt-1.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
