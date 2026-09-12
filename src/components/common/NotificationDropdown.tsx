import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { notifications, role, activeClientId, markNotificationRead, markAllNotificationsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter based on role & active client
  const relevantNotifications = notifications.filter((n) => {
    if (role === 'admin') {
      return n.target === 'admin' || n.target === 'all';
    } else {
      return (n.target === 'client' && (!n.clientId || n.clientId === activeClientId)) || n.target === 'all';
    }
  });

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'urgent':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-notifications-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {relevantNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada notifikasi saat ini
              </div>
            ) : (
              relevantNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                    !notif.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-medium truncate ${!notif.read ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
