import { useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Calendar, FileText, Clock, Star } from 'lucide-react';
import { useNotifications, useMarkRead, useNotificationActions } from '../../hooks/useNotifications';
import type { Notification } from '../../types/portal.types';

// ── Icon per notification type ─────────────────────────────────
const TypeIcon = ({ type }: { type: string }) => {
  const cls = 'w-3.5 h-3.5';
  switch (type) {
    case 'leave_approved':  return <Calendar className={`${cls} text-green-600`} />;
    case 'leave_rejected':  return <Calendar className={`${cls} text-red-500`} />;
    case 'payslip_generated': return <FileText className={`${cls} text-blue-600`} />;
    case 'shift_updated':   return <Clock className={`${cls} text-amber-600`} />;
    case 'review_cycle':    return <Star className={`${cls} text-purple-600`} />;
    default:                return <Bell className={`${cls} text-gray-500`} />;
  }
};

// ── Relative time helper ───────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const markRead   = useMarkRead();
  const { handleClick } = useNotificationActions();

  const unread  = notifications.filter(n => !n.isRead);
  const hasUnread = unread.length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Mark all as read
  const handleMarkAllRead = () => {
    unread.forEach(n => markRead.mutate(n.id));
  };

  const handleNotifClick = (notif: Notification) => {
    handleClick(notif);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          {hasUnread && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              {unread.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {isLoading && (
          <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
        )}

        {isError && (
          <div className="p-6 text-center text-sm text-red-500">
            Failed to load notifications.
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            You're all caught up! 🎉
          </div>
        )}

        {!isLoading && !isError && notifications.map(notif => (
          <button
            key={notif.id}
            onClick={() => handleNotifClick(notif)}
            className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
              !notif.isRead ? 'bg-blue-50/40' : ''
            }`}
          >
            {/* Icon circle */}
            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              !notif.isRead ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <TypeIcon type={notif.type} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${
                !notif.isRead ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {notif.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                {notif.message}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {relativeTime(notif.createdAt)}
              </p>
            </div>

            {/* Unread dot */}
            {!notif.isRead && (
              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            Refreshes every 60 seconds
          </p>
        </div>
      )}
    </div>
  );
}