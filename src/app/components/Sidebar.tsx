import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Building2, Fuel, Users, ShoppingCart, QrCode,
  CreditCard, BarChart3, FileText, Settings, Bell, User,
  LogOut, Zap, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const adminNav = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: '#2563eb' },
  { key: 'subscription_requests', to: '/admin/requests', icon: FileText, label: 'طلبات الاشتراك', color: '#f59e0b' },
  { key: 'saas_plans', to: '/admin/plans', icon: Zap, label: 'خطط الاشتراك', color: '#22c55e' },
  { key: 'active_subscriptions', to: '/admin/subscriptions', icon: CreditCard, label: 'الاشتراكات النشطة', color: '#8b5cf6' },
  { key: 'companies', to: '/companies', icon: Building2, label: 'شركات النقل', color: '#22c55e' },
  { key: 'stations', to: '/stations', icon: Fuel, label: 'محطة وقود', color: '#f59e0b' },
  { key: 'employees', to: '/employees', icon: Users, label: 'الموظفين', color: '#8b5cf6' },
  { key: 'orders', to: '/orders', icon: ShoppingCart, label: 'الطلبات', color: '#3b82f6' },
  { key: 'reports', to: '/reports', icon: BarChart3, label: 'التقارير', color: '#ef4444' },
  { key: 'account_statement', to: '/account-statement', icon: FileText, label: 'كشف الحساب', color: '#06b6d4' },
];

const companyNav = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: '#2563eb' },
  { key: 'orders', to: '/orders', icon: ShoppingCart, label: 'طلبات الوقود', color: '#3b82f6' },
  { key: 'account_statement', to: '/account-statement', icon: FileText, label: 'كشف الحساب', color: '#06b6d4' },
  { key: 'reports', to: '/reports', icon: BarChart3, label: 'التقارير', color: '#ef4444' },
];

const stationNav = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: '#2563eb' },
  { key: 'orders', to: '/orders', icon: ShoppingCart, label: 'الطلبات', color: '#3b82f6' },
  { key: 'qr_scanner', to: '/qr-scanner', icon: QrCode, label: 'مسح QR Code', color: '#22c55e' },
  { key: 'account_statement', to: '/account-statement', icon: FileText, label: 'كشف الحساب', color: '#06b6d4' },
  { key: 'reports', to: '/reports', icon: BarChart3, label: 'التقارير', color: '#ef4444' },
  { key: 'employees', to: '/employees', icon: Users, label: 'الموظفين', color: '#8b5cf6' },
];

const employeeNav = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: '#2563eb' },
  { key: 'orders', to: '/orders', icon: ShoppingCart, label: 'الطلبات', color: '#3b82f6' },
  { key: 'qr_scanner', to: '/qr-scanner', icon: QrCode, label: 'مسح QR Code', color: '#22c55e' },
];

const bottomNav = [
  { key: 'notifications', to: '/notifications', icon: Bell, label: 'الإشعارات' },
  { key: 'profile', to: '/profile', icon: User, label: 'الملف الشخصي' },
  { key: 'settings', to: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function Sidebar() {
  const { user, logout, sidebarOpen, setSidebarOpen, unreadCount, t, language } = useApp();
  const navigate = useNavigate();

  const getNavItems = () => {
    let items = adminNav;
    if (user) {
      // If user is pending, restrict access to everything except dashboard and a status page
      if (user.status === 'pending') {
        items = [
          { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: '#2563eb' },
          { key: 'subscriptions', to: '/profile', icon: CreditCard, label: 'حالة الاشتراك', color: '#f59e0b' },
        ];
      } else {
        switch (user.role) {
          case 'admin': items = adminNav; break;
          case 'company': items = companyNav; break;
          case 'station': items = stationNav; break;
          case 'employee': items = employeeNav; break;
        }
      }
    }
    return items.map(item => ({ ...item, label: t(item.key) }));
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'مدير النظام';
      case 'company': return 'شركة نقل';
      case 'station': return 'محطة وقود';
      case 'employee': return 'موظف محطة';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full z-50 lg:relative lg:translate-x-0 lg:z-auto"
        style={{
          width: sidebarOpen ? '260px' : '0',
          minWidth: sidebarOpen ? '260px' : '0',
        }}
      >
        <div className="flex flex-col h-full glass-sidebar overflow-hidden" style={{ width: '260px' }}>
          {/* Logo Area */}
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
                <Zap size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>منصة الوقود</div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>FuelPro System</div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="mr-auto lg:hidden p-1 rounded-lg hover:bg-glass-hover transition-colors"
              >
                <X size={16} color="var(--muted-foreground)" />
              </button>
            </div>

            {/* User Info */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${getRoleColor()}22`, color: getRoleColor(), border: `1px solid ${getRoleColor()}44` }}>
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'المستخدم'}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: getRoleColor() }} />
                    <span style={{ fontSize: '10px', color: getRoleColor() }}>{getRoleLabel()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '1px', marginBottom: '8px', paddingRight: '8px' }}>
              القائمة الرئيسية
            </div>
            <div className="space-y-1">
              {getNavItems().map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                      ? ''
                      : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: `${item.color}22`,
                    border: `1px solid ${item.color}44`,
                    boxShadow: `0 4px 15px ${item.color}22`,
                  } : {
                    border: '1px solid transparent',
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: isActive ? `${item.color}33` : 'var(--glass-hover)',
                          color: isActive ? item.color : 'var(--muted-foreground)',
                        }}>
                        <item.icon size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? item.color : 'var(--muted-foreground)' }}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="mr-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: item.color }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Bottom Nav */}
            <div className="mt-6">
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '1px', marginBottom: '8px', paddingRight: '8px' }}>
                الحساب والإعدادات
              </div>
              <div className="space-y-1">
                {bottomNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                        ? ''
                        : 'text-muted-foreground hover:text-foreground hover:bg-glass-hover'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'rgba(37,99,235,0.15)',
                      border: '1px solid rgba(37,99,235,0.3)',
                    } : { border: '1px solid transparent' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--glass-hover)', color: 'var(--muted-foreground)' }}>
                      <item.icon size={16} />
                    </div>
                    <span style={{ fontSize: '13px' }}>{t(item.key)}</span>
                    {item.to === '/notifications' && unreadCount > 0 && (
                      <div className="mr-auto px-1.5 py-0.5 rounded-full text-white"
                        style={{ fontSize: '10px', fontWeight: 700, background: '#ef4444', minWidth: '18px', textAlign: 'center' }}>
                        {unreadCount}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/10 group"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(239,68,68,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.border = '1px solid transparent')}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
                <LogOut size={16} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--error)' }}>{t('logout')}</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}