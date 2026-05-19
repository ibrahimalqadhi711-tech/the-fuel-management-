import { motion } from 'motion/react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const typeConfig: Record<string, any> = {
  info: { color: '#2563eb', bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.3)', icon: Info },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', icon: CheckCircle },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: AlertTriangle },
  error: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: XCircle },
};

export default function NotificationsPage() {
  const { notifications, setNotifications, markNotificationRead, unreadCount } = useApp();

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('تم تحديد جميع الإشعارات كمقروءة');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('تم حذف جميع الإشعارات');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#e8eaf6' }}>الإشعارات</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                {unreadCount} جديد
              </span>
            )}
          </div>
          <p style={{ color: '#8892b0', fontSize: '13px' }}>{notifications.length} إشعار</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <CheckCheck size={15} />
              قراءة الكل
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Trash2 size={15} />
              حذف الكل
            </button>
          )}
        </div>
      </motion.div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Bell size={48} color="#374151" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>لا توجد إشعارات</div>
          <div style={{ fontSize: '13px', color: '#4b5563' }}>ستظهر هنا الإشعارات عند وجود تحديثات</div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const tc = typeConfig[notif.type] || typeConfig.info;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !notif.read && markNotificationRead(notif.id)}
                className="glass-card p-5 cursor-pointer transition-all"
                style={{
                  border: `1px solid ${notif.read ? 'rgba(255,255,255,0.06)' : tc.border}`,
                  background: notif.read ? 'rgba(15,17,35,0.6)' : tc.bg,
                  opacity: notif.read ? 0.75 : 1,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tc.color}22`, border: `1px solid ${tc.color}44` }}>
                    <tc.icon size={18} color={tc.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: notif.read ? 400 : 700, color: notif.read ? '#9ca3af' : '#e8eaf6' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#8892b0', marginTop: '4px', lineHeight: 1.6 }}>
                          {notif.message}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {formatTime(notif.createdAt)}
                        </span>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tc.color }} />
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                          className="p-1 rounded-lg hover:bg-white/10 transition-all"
                        >
                          <Trash2 size={13} color="#6b7280" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
