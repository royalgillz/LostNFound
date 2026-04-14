const ANALYTICS_KEY = 'lostnfound_analytics_events';
const NOTIFICATIONS_KEY = 'lostnfound_notifications';

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function trackEvent(name, payload = {}) {
  const events = readJson(ANALYTICS_KEY);
  events.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    payload,
    createdAt: new Date().toISOString(),
  });
  writeJson(ANALYTICS_KEY, events.slice(0, 200));
}

function hasSession() {
  return document.cookie.includes('access_token=');
}

async function apiRequest(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function pushNotification(title, message, type = 'info', meta = {}) {
  if (hasSession()) {
    try {
      return await apiRequest('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, meta }),
      });
    } catch {
      // fallback to local storage below
    }
  }
  const items = readJson(NOTIFICATIONS_KEY);
  const notification = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  items.unshift(notification);
  writeJson(NOTIFICATIONS_KEY, items.slice(0, 100));
  return notification;
}

export async function getNotifications() {
  if (hasSession()) {
    try {
      const data = await apiRequest('/api/notification');
      return data;
    } catch {
      // fallback
    }
  }
  return readJson(NOTIFICATIONS_KEY);
}

export async function markNotificationRead(id) {
  if (hasSession()) {
    try {
      await apiRequest(`/api/notification/${id}/read`, { method: 'PATCH' });
      return getNotifications();
    } catch {
      // fallback
    }
  }
  const items = readJson(NOTIFICATIONS_KEY).map((item) => (item.id === id ? { ...item, read: true } : item));
  writeJson(NOTIFICATIONS_KEY, items);
  return items;
}

export async function markAllNotificationsRead() {
  if (hasSession()) {
    try {
      return await apiRequest('/api/notification/read-all', { method: 'PATCH' });
    } catch {
      // fallback
    }
  }
  const items = readJson(NOTIFICATIONS_KEY).map((item) => ({ ...item, read: true }));
  writeJson(NOTIFICATIONS_KEY, items);
  return items;
}

export async function clearNotifications() {
  if (hasSession()) {
    try {
      await apiRequest('/api/notification', { method: 'DELETE' });
      return [];
    } catch {
      // fallback
    }
  }
  writeJson(NOTIFICATIONS_KEY, []);
  return [];
}
