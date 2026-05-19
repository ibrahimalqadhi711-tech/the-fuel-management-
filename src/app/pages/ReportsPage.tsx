import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Download, Calendar, TrendingUp, DollarSign, Droplets, 
  FileText, Filter, Printer, ShoppingCart, Users, Truck, AlertCircle, 
  PieChart as PieIcon, Activity, List, LayoutDashboard, Wallet, Clock
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ReportTable } from '../components/reports/ReportTable';
import { cn } from '../ui/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3" style={{ background: 'var(--popover)', border: '1px solid var(--border)', fontFamily: 'Cairo' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: '12px', fontWeight: 700 }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString('ar-SA') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { user, transactions, ledgerEntries, allVehicles, allDrivers, orders, companies, stations } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'vehicles' | 'drivers' | 'financial'>('overview');
  const [reportRange, setReportRange] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [filterCompany, setFilterCompany] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // --- Data Filtering Logic ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchCompany = filterCompany === 'all' || t.company_id === filterCompany;
      const matchDateFrom = !dateFrom || new Date(t.transaction_date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(t.transaction_date) <= new Date(dateTo + 'T23:59:59');
      const matchPerms = user?.role === 'admin' ? true : 
                        user?.role === 'company' ? t.company_id === user.companyId :
                        user?.role === 'station' ? t.station_id === user.stationId : true;
      return matchCompany && matchDateFrom && matchDateTo && matchPerms;
    });
  }, [transactions, filterCompany, dateFrom, dateTo, user]);

  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter(l => {
      const matchCompany = filterCompany === 'all' || l.company_id === filterCompany;
      const matchDate = (!dateFrom || new Date(l.created_at) >= new Date(dateFrom)) && 
                        (!dateTo || new Date(l.created_at) <= new Date(dateTo + 'T23:59:59'));
      const matchPerms = user?.role === 'admin' ? true : user?.role === 'company' ? l.company_id === user.companyId : true;
      return matchCompany && matchDate && matchPerms;
    });
  }, [ledgerEntries, filterCompany, dateFrom, dateTo, user]);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const totalLiters = filteredTransactions.reduce((sum, t) => sum + t.liters, 0);
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalExpenses = filteredLedger.reduce((sum, l) => sum + (l.debit || 0), 0); 
    const profit = totalRevenue - totalExpenses;
    
    return {
      transactions: totalTransactions,
      liters: totalLiters,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: profit,
      activeVehicles: allVehicles.filter(v => (v.status === 'active') && (user?.role === 'admin' || v.company_id === user?.companyId)).length,
      activeDrivers: allDrivers.filter(d => (d.status === 'active') && (user?.role === 'admin' || d.company_id === user?.companyId)).length,
    };
  }, [filteredTransactions, filteredLedger, allVehicles, allDrivers, user]);

  // --- Chart Data Logic ---
  const chartData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const grouped: any = {};
    
    filteredTransactions.forEach(t => {
      const d = new Date(t.transaction_date);
      const key = reportRange === 'monthly' ? months[d.getMonth()] : 
                 reportRange === 'daily' ? d.toLocaleDateString('ar-SA', { weekday: 'short' }) :
                 d.getFullYear().toString();
      
      if (!grouped[key]) grouped[key] = { label: key, liters: 0, revenue: 0, transactions: 0, raw: d.getTime() };
      grouped[key].liters += t.liters;
      grouped[key].revenue += t.total_amount;
      grouped[key].transactions += 1;
    });

    return Object.values(grouped).sort((a: any, b: any) => a.raw - b.raw);
  }, [filteredTransactions, reportRange]);

  const fuelTypeData = useMemo(() => {
    const counts: any = { 'ديزل': 0, 'بترول': 0 };
    filteredTransactions.forEach(t => {
      const type = t.fuel_type === 'diesel' ? 'ديزل' : 'بترول';
      counts[type] = (counts[type] || 0) + t.liters;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  }, [filteredTransactions]);

  // --- Export Function ---
  const exportData = (type: 'csv' | 'print') => {
    if (type === 'csv') {
      const headers = ['المعرف', 'التاريخ', 'الشركة', 'المحطة', 'المركبة', 'السائق', 'اللترات', 'المبلغ'];
      const rows = filteredTransactions.map(t => [
        t.transaction_code, 
        new Date(t.transaction_date).toLocaleDateString('ar-SA'),
        t.company_name, t.station_name, t.vehicle_plate, t.driver_name, t.liters, t.total_amount
      ]);
      const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${activeTab}_${Date.now()}.csv`;
      link.click();
    } else {
      window.print();
    }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* 1. Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <BarChart3 className="text-blue-500" />
            مركز التقارير والتحليلات
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '4px' }}>تتبع الأداء المالي والتشغيلي للنظام في الوقت الفعلي</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportData('csv')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-all font-bold text-sm">
            <Download size={16} />
            تصدير ملف Excel
          </button>
          <button onClick={() => exportData('print')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-all font-bold text-sm">
            <Printer size={16} />
            طباعة التقارير
          </button>
        </div>
      </motion.div>

      {/* 2. Global Filters Section */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          {[
            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, roles: ['admin', 'company', 'station'] },
            { id: 'transactions', label: 'المعاملات', icon: ShoppingCart, roles: ['admin', 'company', 'station'] },
            { id: 'vehicles', label: 'المركبات', icon: Truck, roles: ['admin', 'company'] },
            { id: 'drivers', label: 'السائقين', icon: Users, roles: ['admin', 'company'] },
            { id: 'financial', label: 'المالية', icon: Wallet, roles: ['admin', 'company'] },
          ].filter(tab => tab.roles.includes(user?.role || '')).map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'admin' && (
            <select 
              value={filterCompany} 
              onChange={e => setFilterCompany(e.target.value)}
              className="rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <option value="all" style={{ background: 'var(--popover)' }}>جميع الشركات</option>
              {companies.map(c => <option key={c.id} value={c.id} style={{ background: 'var(--popover)' }}>{c.name}</option>)}
            </select>
          )}
          
          <div className="flex items-center gap-2 rounded-xl px-2 py-1" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Calendar size={14} color="var(--muted-foreground)" className="mr-2" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-xs outline-none border-none p-1" style={{ color: 'var(--foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>إلى</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-xs outline-none border-none p-1" style={{ color: 'var(--foreground)' }} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* 3. Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي الوقود', value: stats.liters.toLocaleString('ar-SA'), sub: 'لتر', icon: Droplets, color: '#22c55e' },
                { label: 'عدد المعاملات', value: stats.transactions, sub: 'عملية', icon: Activity, color: '#2563eb' },
                { label: 'إجمالي الإيرادات', value: stats.revenue.toLocaleString('ar-SA'), sub: 'ريال', icon: DollarSign, color: '#d4af37' },
                { label: 'صافي الربح', value: stats.profit.toLocaleString('ar-SA'), sub: 'ريال', icon: TrendingUp, color: stats.profit >= 0 ? '#22c55e' : '#ef4444' },
                { label: 'المركبات النشطة', value: stats.activeVehicles, sub: 'مركبة', icon: Truck, color: '#8b5cf6' },
                { label: 'السائقين النشطين', value: stats.activeDrivers, sub: 'سائق', icon: Users, color: '#f59e0b' },
                { label: 'إجمالي المصروفات', value: stats.expenses.toLocaleString('ar-SA'), sub: 'ريال', icon: Wallet, color: '#ef4444' },
                { label: 'طلبات قيد التنفيذ', value: orders.filter(o => o.status === 'pending').length, sub: 'طلب', icon: Clock, color: '#2563eb' },
              ].map((card, i) => (
                <div key={i} className="glass-card p-5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-10 -translate-x-6 -translate-y-6"
                    style={{ background: card.color, filter: 'blur(25px)' }} />
                  <div className="relative flex justify-between items-start">
                    <div>
                      <p className="text-xs mb-2 font-bold" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
                      <h4 className="text-2xl font-black" style={{ color: card.color }}>{card.value}</h4>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '10px', marginTop: '4px' }}>{card.sub}</p>
                    </div>
                    <div className="p-2 rounded-xl" style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                      <card.icon size={20} color={card.color} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Main Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <Activity size={18} className="text-blue-500" />
                    تحليل الاستهلاك والإيرادات
                  </h3>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--muted)' }}>
                    {['daily', 'monthly', 'yearly'].map(range => (
                      <button 
                        key={range}
                        onClick={() => setReportRange(range as any)}
                        className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", reportRange === range ? "bg-blue-500 text-white" : "text-muted-foreground hover:text-foreground")}
                      >
                        {range === 'daily' ? 'يومي' : range === 'monthly' ? 'شهري' : 'سنوي'}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} fontFamily="Cairo" />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontFamily: 'Cairo', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="liters" name="الاستهلاك (لتر)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLiters)" />
                    <Area type="monotone" dataKey="revenue" name="الإيرادات (ريال)" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6 flex flex-col">
                <h3 className="font-bold mb-6" style={{ color: 'var(--foreground)' }}>توزيع أنواع الوقود</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'ديزل' ? '#2563eb' : entry.name === 'بترول' ? '#22c55e' : '#f59e0b'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {fuelTypeData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.name === 'ديزل' ? '#2563eb' : '#22c55e' }} />
                        <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{d.name}</span>
                      </div>
                      <span style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 900 }}>{d.value.toLocaleString('ar-SA')} لتر</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <ReportTable 
                title="سجل العمليات التفصيلية"
                data={filteredTransactions}
                onExport={() => exportData('csv')}
                columns={[
                  { header: 'الرمز', accessor: 'transaction_code', className: 'text-blue-500 font-bold' },
                  { header: 'التاريخ', accessor: (t) => new Date(t.transaction_date).toLocaleDateString('ar-SA'), className: 'text-muted-foreground' },
                  { header: 'الشركة', accessor: 'company_name' },
                  { header: 'المحطة', accessor: 'station_name' },
                  { header: 'المركبة', accessor: 'vehicle_plate', className: 'font-mono' },
                  { header: 'السائق', accessor: 'driver_name' },
                  { header: 'الكمية', accessor: (t) => `${t.liters} لتر`, className: 'font-black text-foreground' },
                  { header: 'الإجمالي', accessor: (t) => `${t.total_amount.toLocaleString()} ر.س`, className: 'text-amber-500 font-black' },
                ]}
             />
          </motion.div>
        )}

        {activeTab === 'vehicles' && (
          <motion.div key="vehicles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <ReportTable 
                title="تقارير استهلاك المركبات"
                data={allVehicles.filter(v => filterCompany === 'all' || v.company_id === filterCompany)}
                columns={[
                  { header: 'رقم اللوحة', accessor: 'plate_number', className: 'font-mono font-bold text-blue-400' },
                  { header: 'الشركة', accessor: 'company_name' },
                  { header: 'النوع', accessor: 'vehicle_type' },
                  { header: 'نوع الوقود', accessor: (v) => <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", v.fuel_type === 'diesel' ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500")}>{v.fuel_type === 'diesel' ? 'ديزل' : 'بترول'}</span> },
                  { header: 'الاستهلاك الحالي', accessor: (v) => `${v.current_consumption} لتر`, className: 'text-foreground' },
                  { header: 'المتبقي', accessor: (v) => `${v.remaining_liters} لتر`, className: 'text-green-500' },
                  { header: 'الحالة', accessor: (v) => <span className={v.status === 'active' ? "text-green-500" : "text-red-500"}>{v.status === 'active' ? 'نشط' : 'متوقف'}</span> },
                ]}
             />
          </motion.div>
        )}

        {activeTab === 'drivers' && (
          <motion.div key="drivers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <ReportTable 
                title="تقارير إنتاجية السائقين"
                data={allDrivers.filter(d => filterCompany === 'all' || d.company_id === filterCompany)}
                columns={[
                  { header: 'اسم السائق', accessor: 'full_name', className: 'font-bold text-foreground' },
                  { header: 'الشركة', accessor: 'company_name' },
                  { header: 'رقم الجوال', accessor: 'phone' },
                  { header: 'تاريخ الانضمام', accessor: (d) => new Date(d.created_at).toLocaleDateString('ar-SA') },
                  { header: 'عدد العمليات', accessor: (d) => transactions.filter(t => t.driver_id === d.id).length, className: 'text-blue-500 font-bold' },
                  { header: 'إجمالي اللترات', accessor: (d) => `${transactions.filter(t => t.driver_id === d.id).reduce((s, x) => s + x.liters, 0)} لتر` },
                  { header: 'الحالة', accessor: (d) => <span className={d.status === 'active' ? "text-green-500" : "text-red-500"}>{d.status === 'active' ? 'نشط' : 'متوقف'}</span> },
                ]}
             />
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div key="financial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <ReportTable 
                title="سجل الحركات المالية (Ledger)"
                data={filteredLedger}
                columns={[
                  { header: 'التاريخ', accessor: (l) => new Date(l.created_at).toLocaleString('ar-SA'), className: 'text-xs' },
                  { header: 'الشركة', accessor: 'company_name' },
                  { header: 'الوصف', accessor: 'description', className: 'text-muted-foreground text-xs' },
                  { header: 'مدين (مصروف)', accessor: (l) => l.debit > 0 ? <span className="text-red-500 font-bold">{l.debit.toLocaleString()} ر.س</span> : '-', className: 'text-left' },
                  { header: 'دائن (إيداع)', accessor: (l) => l.credit > 0 ? <span className="text-green-500 font-bold">{l.credit.toLocaleString()} ر.س</span> : '-', className: 'text-left' },
                  { header: 'الرصيد بعد العملية', accessor: (l) => <span className="font-black" style={{ color: 'var(--foreground)' }}>{l.balance_after.toLocaleString()} ر.س</span>, className: 'text-left' },
                ]}
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
