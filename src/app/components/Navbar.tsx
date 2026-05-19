import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, Search, ChevronDown, User, Settings, LogOut, Shield, Fuel } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function Navbar() {
  const { user, logout, setSidebarOpen, sidebarOpen, unreadCount, notifications, t, theme, language } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return t('admin');
      case 'company': return t('company');
      case 'station': return t('station');
      case 'employee': return t('employee');
      default: return '';
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return '#d4af37';
      case 'company': return '#22c55e';
      case 'station': return '#f59e0b';
      case 'employee': return '#8b5cf6';
      default: return '#2563eb';
    }
  };

  const recentNotifs = notifications.slice(0, 4);

  return (
    <header className="glass-navbar sticky top-0 z-30 flex items-center px-4 lg:px-6" style={{ height: '60px' }}>
      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-xl transition-all hover:bg-glass-hover"
        style={{ border: '1px solid var(--border)' }}
      >
        <Menu size={18} color="var(--muted-foreground)" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="mx-4 hidden sm:flex items-center gap-2">
        <Fuel size={16} color="var(--primary)" />
        <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>منصة الوقود</span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{t('dashboard')}</span>
      </div>

      <div className="mr-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { setSearchOpen(false); setSearchQuery(''); }}
                  placeholder={t('search')}
                  className="w-full px-4 py-1.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--primary)',
                    color: 'var(--foreground)',
                    direction: language === 'ar' ? 'rtl' : 'ltr',
                  }}
                />
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl transition-all hover:bg-glass-hover"
                style={{ border: '1px solid var(--border)' }}
              >
                <Search size={18} color="var(--muted-foreground)" />
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative p-2 rounded-xl transition-all hover:bg-glass-hover"
            style={{ border: '1px solid var(--border)' }}
          >
            <Bell size={18} color="var(--muted-foreground)" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ fontSize: '9px', fontWeight: 700, background: 'var(--error)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute left-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--popover)', border: '1px solid var(--border)', zIndex: 100 }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{t('notifications')}</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--error)' }}>
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>لا توجد إشعارات</div>
                  ) : recentNotifs.map(n => (
                    <div key={n.id} className="p-3 hover:bg-glass-hover transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: n.read ? 'var(--muted)' : n.type === 'success' ? 'var(--success)' : n.type === 'warning' ? 'var(--warning)' : n.type === 'error' ? 'var(--error)' : 'var(--primary)' }} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: n.read ? 400 : 600, color: n.read ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{n.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                    style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                    عرض جميع الإشعارات
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-glass-hover"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: `${getRoleColor()}22`, color: getRoleColor() }}>
              {user?.name?.charAt(0) || 'م'}
            </div>
            <div className="hidden sm:block text-right">
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)' }}>{user?.name}</div>
              <div style={{ fontSize: '10px', color: getRoleColor() }}>{getRoleLabel()}</div>
            </div>
            <ChevronDown size={14} color="var(--muted-foreground)" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute left-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--popover)', border: '1px solid var(--border)', zIndex: 100 }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{user?.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: `${getRoleColor()}22`, border: `1px solid ${getRoleColor()}44` }}>
                    <Shield size={10} color={getRoleColor()} />
                    <span style={{ fontSize: '10px', color: getRoleColor(), fontWeight: 600 }}>{getRoleLabel()}</span>
                  </div>
                </div>
                <div className="py-2 px-2">
                  {[
                    { icon: User, label: t('profile'), to: '/profile', color: '#3b82f6' },
                    { icon: Settings, label: t('settings'), to: '/settings', color: '#8b5cf6' },
                  ].map(item => (
                    <button key={item.to}
                      onClick={() => { navigate(item.to); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-glass-hover"
                    >
                      <item.icon size={15} color={item.color} />
                      <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>{item.label}</span>
                    </button>
                  ))}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-red-500/10">
                    <LogOut size={15} color="var(--error)" />
                    <span style={{ fontSize: '13px', color: 'var(--error)' }}>{t('logout')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
