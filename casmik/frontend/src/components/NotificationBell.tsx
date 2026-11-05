'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Package, 
  ClipboardCheck, 
  CreditCard, 
  Truck, 
  Sparkles, 
  Info, 
  Trash2,
  ExternalLink,
  Play,
  CheckCircle2,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { 
  CasmikNotification, 
  NotificationRole, 
  getStoredNotifications, 
  markNotificationAsRead, 
  markNotificationAsUnread,
  markAllNotificationsAsRead, 
  deleteNotification, 
  playNotificationSound, 
  isSoundMuted, 
  setSoundMuted,
  requestBrowserNotificationPermission
} from '@/lib/notifications';

interface NotificationBellProps {
  role: NotificationRole;
  onNavigateToOrder?: (orderNumber: string) => void;
  onNavigateSection?: (section: string) => void;
}

export default function NotificationBell({ role, onNavigateToOrder, onNavigateSection }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CasmikNotification[]>([]);
  const [muted, setMuted] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'read' | 'all' | 'orders' | 'payouts'>('unread');
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [toastAlert, setToastAlert] = useState<CasmikNotification | null>(null);
  const [recentlyShiftedId, setRecentlyShiftedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const refreshNotifications = () => {
    const list = getStoredNotifications(role);
    setNotifications(list);
    setMuted(isSoundMuted());
  };

  useEffect(() => {
    refreshNotifications();
    requestBrowserNotificationPermission().catch(() => {});

    // BroadcastChannel listener across tabs
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('casmik_notifications_channel');
      channel.onmessage = (event) => {
        const notif = event.data as CasmikNotification;
        if (role === 'all' || notif.targetRole === 'all' || notif.targetRole === role) {
          refreshNotifications();
          setHasNewAlert(true);
          setToastAlert(notif);
          playNotificationSound();
          setTimeout(() => setHasNewAlert(false), 3000);
          setTimeout(() => setToastAlert(null), 6500);
        }
      };
    }

    // Local custom event listener for same-tab triggers
    const handleLocalNotif = (e: any) => {
      const notif = e.detail as CasmikNotification;
      if (role === 'all' || notif.targetRole === 'all' || notif.targetRole === role) {
        refreshNotifications();
        setHasNewAlert(true);
        setToastAlert(notif);
        setTimeout(() => setHasNewAlert(false), 3000);
        setTimeout(() => setToastAlert(null), 6500);
      }
    };

    const handleUpdate = () => refreshNotifications();

    window.addEventListener('casmik_notification_received', handleLocalNotif);
    window.addEventListener('casmik_notification_updated', handleUpdate);
    window.addEventListener('casmik_sound_setting_changed', handleUpdate);

    // Close on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('casmik_notification_received', handleLocalNotif);
      window.removeEventListener('casmik_notification_updated', handleUpdate);
      window.removeEventListener('casmik_sound_setting_changed', handleUpdate);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [role]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;
  const ordersCount = notifications.filter(n => ['new_booking', 'status_update', 'inspection'].includes(n.type)).length;
  const payoutsCount = notifications.filter(n => n.type === 'payout').length;

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playNotificationSound(true);
    }
  };

  const handleTestChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNotificationSound(true);
    requestBrowserNotificationPermission();
  };

  // Shift single notification to Read
  const handleShiftToRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentlyShiftedId(id);
    markNotificationAsRead(id);
    refreshNotifications();
    setTimeout(() => setRecentlyShiftedId(null), 1000);
  };

  // Shift single notification back to Unread
  const handleShiftToUnread = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markNotificationAsUnread(id);
    refreshNotifications();
  };

  // Shift all unread notifications to Read
  const handleShiftAllToRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllNotificationsAsRead(role);
    refreshNotifications();
  };

  // Click on notification body (marks as read and allows navigation)
  const handleItemClick = (notif: CasmikNotification) => {
    if (!notif.read) {
      handleShiftToRead(notif.id);
    }

    if (notif.orderNumber && onNavigateToOrder) {
      onNavigateToOrder(notif.orderNumber);
      setIsOpen(false);
    } else if (notif.type === 'payout' && onNavigateSection) {
      onNavigateSection('payouts');
      setIsOpen(false);
    } else if (onNavigateSection) {
      onNavigateSection('orders');
      setIsOpen(false);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    if (filter === 'orders') return ['new_booking', 'status_update', 'inspection'].includes(n.type);
    if (filter === 'payouts') return n.type === 'payout';
    return true;
  });

  const getNotifIcon = (type: CasmikNotification['type']) => {
    switch (type) {
      case 'new_booking':
        return { icon: <Package size={15} className="text-emerald-600" />, bg: 'bg-emerald-100' };
      case 'status_update':
        return { icon: <Truck size={15} className="text-blue-600" />, bg: 'bg-blue-100' };
      case 'inspection':
        return { icon: <ClipboardCheck size={15} className="text-amber-600" />, bg: 'bg-amber-100' };
      case 'payout':
        return { icon: <CreditCard size={15} className="text-purple-600" />, bg: 'bg-purple-100' };
      default:
        return { icon: <Info size={15} className="text-gray-600" />, bg: 'bg-gray-100' };
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* BELL BUTTON */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          requestBrowserNotificationPermission();
        }}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
          isOpen ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-600'
        } ${hasNewAlert ? 'animate-bounce text-primary' : ''}`}
        title="Live Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* FLOATING IN-APP POPUP TOAST (WHEN NEW ALERT ARRIVES) */}
      {toastAlert && (
        <div 
          onClick={() => {
            handleItemClick(toastAlert);
            setToastAlert(null);
          }}
          className="fixed top-5 right-5 z-[99999] max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-500 animate-in fade-in slide-in-from-top-4 cursor-pointer hover:bg-slate-800 transition-all font-sans"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell size={16} className="animate-wiggle" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className="text-xs font-black text-white truncate">{toastAlert.title}</p>
                <span className="text-[10px] text-gray-400 flex-shrink-0">Just now</span>
              </div>
              <p className="text-xs text-gray-300 leading-snug line-clamp-2">{toastAlert.shortDetails}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                  View & Shift to Read <ExternalLink size={10} />
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Click to read</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToastAlert(null);
              }}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS POPOVER MODAL */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 text-red-700 rounded-full">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                  All Read
                </span>
              )}
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1">
              {/* Sound Test / Play Chime */}
              <button
                type="button"
                onClick={handleTestChime}
                title="Test Sound Chime"
                className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors flex items-center gap-1 text-[11px] font-bold"
              >
                <Play size={11} className="fill-current text-primary" /> Chime
              </button>

              {/* Sound Toggle (Mute/Unmute) */}
              <button
                type="button"
                onClick={handleToggleMute}
                title={muted ? 'Unmute Sound' : 'Mute Sound'}
                className={`p-1.5 rounded-lg transition-colors ${
                  muted ? 'text-gray-400 hover:bg-gray-100' : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Shift All to Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleShiftAllToRead}
                  title="Shift All to Read"
                  className="px-2 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors text-[10px] font-black flex items-center gap-1"
                >
                  <CheckCheck size={13} />
                  <span>Shift All to Read</span>
                </button>
              )}

              {/* Close Popover */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs (Unread vs Read vs All) */}
          <div className="flex gap-1 p-2 bg-gray-50/80 border-b border-gray-100 text-xs overflow-x-auto scrollbar-hide">
            {[
              { id: 'unread', label: `Unread (${unreadCount})`, highlight: unreadCount > 0 },
              { id: 'read', label: `Read (${readCount})` },
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'orders', label: `Orders (${ordersCount})` },
              { id: 'payouts', label: `Payouts (${payoutsCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  filter === tab.id
                    ? 'bg-white text-primary shadow-sm border border-gray-200 font-extrabold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.highlight && filter !== tab.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="divide-y divide-gray-100 max-h-84 overflow-y-auto">
            {filtered.map(notif => {
              const { icon, bg } = getNotifIcon(notif.type);
              const isRecentlyShifted = recentlyShiftedId === notif.id;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-gray-50 transition-all cursor-pointer group flex items-start gap-3 relative ${
                    !notif.read 
                      ? 'bg-emerald-50/30 hover:bg-emerald-50/50 border-l-3 border-primary' 
                      : 'bg-white opacity-85 hover:opacity-100'
                  } ${isRecentlyShifted ? 'scale-[0.98] transition-transform bg-emerald-100/50' : ''}`}
                >
                  {/* Icon Avatar */}
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                    {icon}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <p className={`text-xs truncate ${!notif.read ? 'font-black text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </p>

                      {/* Status Tag */}
                      {!notif.read ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          <CheckCircle2 size={10} className="text-gray-400" />
                          Read
                        </span>
                      )}

                      <span className="text-[10px] text-gray-400 font-medium ml-auto flex-shrink-0">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-snug font-normal">
                      {notif.shortDetails}
                    </p>

                    {notif.price && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-emerald-700">
                          ₹{notif.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Action Bar (Shift to Read / Shift to Unread) */}
                    <div className="mt-2 flex items-center gap-2 pt-1 border-t border-gray-100/70">
                      {!notif.read ? (
                        <button
                          type="button"
                          onClick={(e) => handleShiftToRead(notif.id, e)}
                          className="text-[10px] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                          title="Click to shift to Read"
                        >
                          <CheckCheck size={11} /> Shift to Read
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleShiftToUnread(notif.id, e)}
                          className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                          title="Move back to Unread"
                        >
                          <RotateCcw size={10} /> Shift back to Unread
                        </button>
                      )}

                      {notif.orderNumber && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          #{notif.orderNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                      refreshNotifications();
                    }}
                    className="absolute right-2.5 top-3.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 rounded transition-opacity"
                    title="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            {/* Empty State for Unread Tab */}
            {filtered.length === 0 && filter === 'unread' && (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCheck size={20} />
                </div>
                <p className="text-xs font-black text-gray-800">All caught up!</p>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  All notifications have been read and shifted to the <strong>Read</strong> tab.
                </p>
                {readCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('read')}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>View Read Notifications ({readCount})</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Empty State for Read Tab */}
            {filtered.length === 0 && filter === 'read' && (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700">No Read Notifications</p>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  When you read or click unread notifications, they will automatically shift here.
                </p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('unread')}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <span>Go to Unread ({unreadCount})</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Generic Empty State for Other Tabs */}
            {filtered.length === 0 && filter !== 'unread' && filter !== 'read' && (
              <div className="py-10 text-center text-gray-400">
                <Sparkles size={26} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No Notifications</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No notifications in this filter view</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 px-4">
            <span className="flex items-center gap-1.5">
              <Volume2 size={13} className={muted ? 'text-gray-400' : 'text-emerald-600'} />
              <span>Chime: <strong className={muted ? 'text-gray-500' : 'text-emerald-700'}>{muted ? 'Muted' : 'Active'}</strong></span>
            </span>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleShiftAllToRead}
                className="font-black text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Shift All to Read</span>
                <CheckCheck size={12} />
              </button>
            ) : (
              <span className="text-gray-400">All caught up</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
