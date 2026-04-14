import { useEffect, useState } from 'react';
import { onToast } from '../../utils/toast';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ICONS = {
  success: <FaCheck size={13} />,
  error:   <FaTimes size={13} />,
  warning: <FaExclamationTriangle size={13} />,
  info:    <FaInfoCircle size={13} />,
};

const COLORS = {
  success: 'bg-emerald-600 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-neutral-900 text-white',
};

const TTL = 3200;

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, TTL);
    });
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-slide-up ${COLORS[t.type] || COLORS.info}`}
        >
          <span className="flex-shrink-0">{ICONS[t.type] || ICONS.info}</span>
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 ml-1"
            aria-label="Dismiss"
          >
            <FaTimes size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
