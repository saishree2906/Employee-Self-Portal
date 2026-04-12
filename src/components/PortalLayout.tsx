import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  User, CalendarDays, FileText, Clock, Bell, Menu, X as CloseIcon,
} from 'lucide-react';
import NotificationPanel from './portal/NotificationPanel';
import { useUnreadCount } from '../hooks/useNotifications';

const NAV = [
  { to: '/portal/profile', label: 'My Profile',     icon: User         },
  { to: '/portal/leave',   label: 'Leave',           icon: CalendarDays },
  { to: '/portal/payslip', label: 'Payslip',         icon: FileText     },
  { to: '/portal/shifts',  label: 'Shift Schedule',  icon: Clock        },
];

export default function PortalLayout() {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);

  // ── Real unread count from polling query ──────────────────
  const unreadCount = useUnreadCount();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          <span className="text-sm font-bold text-blue-600 tracking-tight">Tendworks HRMS</span>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Employee chip */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
              S
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Saishree</p>
              <p className="text-[10px] text-gray-400 truncate">TW-1042</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-sm font-semibold text-gray-800 hidden lg:block">
            Employee Self-Service Portal
          </span>

          {/* Bell icon with real unread count */}
          <div className="relative ml-auto">
            <button
              onClick={() => setNotifOpen(prev => !prev)}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel dropdown */}
            <NotificationPanel
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}