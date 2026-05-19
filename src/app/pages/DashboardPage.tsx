import { motion } from 'motion/react';
import { Building2, Fuel, Users, ShoppingCart, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle, ArrowUpRight, Zap, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';

const areaData = [
  { day: 'السبت', orders: 12, revenue: 4200, liters: 1800 },
  { day: 'الأحد', orders: 18, revenue: 6300, liters: 2600 },
  { day: 'الاثنين', orders: 15, revenue: 5100, liters: 2100 },
  { day: 'الثلاثاء', orders: 22, revenue: 7800, liters: 3200 },
  { day: 'الأربعاء', orders: 19, revenue: 6900, liters: 2900 },
  { day: 'الخميس', orders: 28, revenue: 9800, liters: 4100 },
  { day: 'الجمعة', orders: 8, revenue: 2800, liters: 1200 },
];

const barData = [
  { month: 'يناير', paid: 45000, deferred: 12000 },
  { month: 'فبراير', paid: 52000, deferred: 8000 },
  { month: 'مارس', paid: 48000, deferred: 15000 },
  { month: 'أبريل', paid: 61000, deferred: 9000 },
  { month: 'مايو', paid: 55000, deferred: 11000 },
];

const pieData = [
  { name: 'ديزل', value: 55, color: '#2563eb' },
  { name: 'بترول', value: 35, color: '#22c55e' },
  { name: 'غاز', value: 10, color: '#d4af37' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', fontFamily: 'Cairo, sans-serif', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: '12px', fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? p.value.toLocaleString('ar-SA') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, companies, stations, employees, orders, notifications } = useApp();

  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const pendingCompanies = companies.filter(c => c.status === 'pending').length;
  const activeStations = stations.filter(s => s.status === 'active').length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'paid').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalDebt = companies.reduce((sum, c) => sum + c.totalDebt, 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const getRoleStats = () => {
    if (user?.role === 'admin') return [
      { label: 'شركات النقل', value: companies.length, sub: `${activeCompanies} نشط`, icon: Building2, color: '#22c55e', trend: '+12%' },
      { label: 'محطات الوقود', value: stations.length, sub: `${activeStations} نشط`, icon: Fuel, color: '#f59e0b', trend: '+8%' },
      { label: 'إجمالي الطلبات', value: totalOrders, sub: `${pendingOrders} معلق`, icon: ShoppingCart, color: '#2563eb', trend: '+24%' },
      { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString('ar-SA')} ر`, sub: `ديون: ${totalDebt.toLocaleString('ar-SA')} ر`, icon: DollarSign, color: '#d4af37', trend: '+18%' },
    ];
    if (user?.role === 'company') return [
      { label: 'طلباتي', value: orders.filter(o => o.companyId === user.companyId).length, sub: `${pendingOrders} معلق`, icon: ShoppingCart, color: '#2563eb', trend: '' },
      { label: 'ديوني', value: `${user.companyId ? companies.find(c => c.id === user.companyId)?.totalDebt?.toLocaleString('ar-SA') || '0' : '0'} ر`, sub: 'إجمالي الديون', icon: DollarSign, color: '#ef4444', trend: '' },
      { label: 'لتر تم تعبئته', value: '2,450', sub: 'هذا الشهر', icon: Fuel, color: '#22c55e', trend: '' },
      { label: 'سائقين نشطين', value: 8, sub: 'من إجمالي 12', icon: Users, color: '#8b5cf6', trend: '' },
    ];
    return [
      { label: 'طلبات اليوم', value: 14, sub: '8 مؤكدة', icon: ShoppingCart, color: '#2563eb', trend: '' },
      { label: 'طلبات معلقة', value: pendingOrders, sub: 'تحتاج مراجعة', icon: Clock, color: '#f59e0b', trend: '' },
      { label: 'إجمالي اليوم', value: '1,840 ر', sub: 'هذا اليوم', icon: DollarSign, color: '#22c55e', trend: '' },
      { label: 'مؤجل', value: '450 ر', sub: 'غير مسدد', icon: AlertTriangle, color: '#ef4444', trend: '' },
    ];
  };

  const stats = getRoleStats();

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* Pending Banner */}
      {user?.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl text-center relative overflow-hidden"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}
        >
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--accent)', border: '1px solid var(--gold)' }}>
              <Clock size={32} color="#f59e0b" className="animate-pulse" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>حسابك قيد المراجعة حالياً</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.8 }}>
              شكراً لانضمامك إلى منصة الوقود الذكية. يقوم فريقنا حالياً بمراجعة بيانات شركتك وتفعيل اشتراكك في باقة <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Starter</span>. سيتم تفعيل ميزات النظام كاملة خلال 24 ساعة.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>طلبك رقم #SR-2025-001</span>
              </div>
            </div>
          </div>
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '24px', color: 'var(--foreground)', marginBottom: '4px' }}>
              {getGreeting()}، {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#22c55e' }} />
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>النظام يعمل</span>
            </div>
            {unreadNotifs > 0 && user?.status !== 'pending' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={14} color="#ef4444" />
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>{unreadNotifs} إشعار جديد</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hide the rest if pending */}
      {user?.status !== 'pending' && (
        <>
          {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 -translate-x-8 -translate-y-8"
              style={{ background: stat.color, filter: 'blur(30px)' }} />

            <div className="relative flex items-start justify-between">
              <div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '8px', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--foreground)', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', opacity: 0.7 }}>{stat.sub}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44` }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <TrendingUp size={10} color="#22c55e" />
                    <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>{stat.trend}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>نشاط الطلبات الأسبوعي</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>آخر 7 أيام</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
              <Activity size={14} color="#2563eb" />
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>مباشر</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'Cairo' }}>{v}</span>} />
              <Area type="monotone" dataKey="orders" name="الطلبات" stroke="#2563eb" strokeWidth={2} fill="url(#ordersGrad)" />
              <Area type="monotone" dataKey="revenue" name="الإيرادات (ر)" stroke="#d4af37" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '6px' }}>توزيع أنواع الوقود</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>هذا الشهر</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontFamily: 'Cairo' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 700 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bar Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', marginBottom: '6px' }}>الإيرادات الشهرية</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>مسدد مقابل مؤجل (ريال)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'Cairo' }}>{v}</span>} />
              <Bar dataKey="paid" name="مسدد" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deferred" name="مؤجل" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>آخر الطلبات</h3>
            <button style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>عرض الكل</button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-glass-hover"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: order.status === 'confirmed' ? 'rgba(34,197,94,0.15)' :
                      order.status === 'pending' ? 'rgba(245,158,11,0.15)' :
                        order.status === 'deferred' ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)',
                  }}>
                  {order.status === 'confirmed' ? <CheckCircle size={16} color="#22c55e" /> :
                    order.status === 'pending' ? <Clock size={16} color="#f59e0b" /> :
                      order.status === 'deferred' ? <AlertTriangle size={16} color="#ef4444" /> :
                        <CheckCircle size={16} color="#2563eb" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)' }}>{order.orderNumber}</span>
                    <span className="px-1.5 py-0.5 rounded-md" style={{
                      fontSize: '10px', fontWeight: 600,
                      background: order.fuelType === 'ديزل' ? 'rgba(37,99,235,0.15)' : order.fuelType === 'بترول' ? 'rgba(34,197,94,0.15)' : 'rgba(212,175,55,0.15)',
                      color: order.fuelType === 'ديزل' ? '#2563eb' : order.fuelType === 'بترول' ? '#22c55e' : '#d4af37',
                    }}>
                      {order.fuelType}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.companyName}
                  </div>
                </div>
                <div className="text-left">
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#d4af37' }}>{order.total.toFixed(0)} ر</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{order.liters} لتر</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pending & Alerts Section */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Accounts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} color="#f59e0b" />
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>حسابات بانتظار الموافقة</h3>
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>
                {pendingCompanies}
              </span>
            </div>
            <div className="space-y-2">
              {companies.filter(c => c.status === 'pending').slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--glass-hover)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{c.city} · {c.phone}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                      قبول
                    </button>
                    <button className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                      رفض
                    </button>
                  </div>
                </div>
              ))}
              {pendingCompanies === 0 && (
                <div className="text-center py-4" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>لا توجد حسابات معلقة</div>
              )}
            </div>
          </motion.div>

          {/* Expired / At Risk */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} color="#ef4444" />
              <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>تنبيهات الاشتراكات</h3>
            </div>
            <div className="space-y-2">
              {companies.filter(c => c.status === 'expired' || c.totalDebt > 0).slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--glass-hover)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {c.status === 'expired' && (
                        <span className="badge-inactive px-2 py-0.5 rounded-md" style={{ fontSize: '10px', fontWeight: 600 }}>منتهي</span>
                      )}
                      {c.totalDebt > 0 && (
                        <span style={{ fontSize: '11px', color: '#ef4444' }}>دين: {c.totalDebt.toLocaleString('ar-SA')} ر</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                      واتساب
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
