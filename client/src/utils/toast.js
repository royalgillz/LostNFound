// Lightweight event-bus toast utility — no external deps.
// Usage: import { showToast } from '../utils/toast';
//        showToast('Saved!', 'success');

const listeners = new Set();

export function showToast(message, type = 'info') {
  const toast = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, message, type };
  listeners.forEach((fn) => fn(toast));
}

export function onToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
