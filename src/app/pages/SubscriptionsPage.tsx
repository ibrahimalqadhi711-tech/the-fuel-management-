import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, AlertTriangle, CheckCircle, Clock, Ban, MessageCircle, Phone, RefreshCw, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { updateCompany, updateStation, parseError } from '../../services/api';

export default function SubscriptionsPage() {
  const { companies, stations, setCompanies, setStations } = useApp();
  const [tab, setTab] = useState<'companies' | 'stations'>('companies');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const allAccounts = tab === 'companies' ? companies : stations;

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return -999;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getSubStatus = (account: any) => {
    const days = getDaysLeft(account.subscriptionEnd);
    if (account.status === 'inactive') return 'stopped';
    if (account.status === 'pending') return 'pending';
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring';
    return 'active';
  };

  const statusConfig: Record<string, any> = {
    active: { label: 'نشط', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    expiring: { label: 'ينتهي قريباً', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    expired: { label: 'منتهي', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    stopped: { label: 'موقوف', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    pending: { label: 'معلق', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  };

  const filtered = allAccounts.filter(a => {
    const subSt = getSubStatus(a);
    const matchStatus = filterStatus === 'all' || subSt === filterStatus;
    const matchSearch = a.name.includes(search) || a.managerName.includes(search);
    return matchStatus && matchSearch;
  });

  const handleRenew = async (id: string) => {
    const newEnd = new Date();
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    
    try {
      if (tab === 'companies') {
        await updateCompany(id, { status: 'active', subscription_plan: newEnd.toISOString().split('T')[0] });
      } else {
        await updateStation(id, { status: 'active' });
      }
      toast.success('تم تجديد الاشتراك بنجاح');
      if ((window as any).refreshData) (window as any).refreshData();
    } catch (e: any) {
      toast.error('فشل التجديد: ' + parseError(e));
    }
  };

  const summaryStats = [
    { label: 'نشط', value: allAccounts.filter(a => getSubStatus(a) === 'active').length, color: '#22c55e' },
    { label: 'ينتهي قريباً', value: allAccounts.filter(a => getSubStatus(a) === 'expiring').length, color: '#f59e0b' },
    { label: 'منتهي', value: allAccounts.filter(a => getSubStatus(a) === 'expired').length, color: '#ef4444' },
    { label: 'موقوف', value: allAccounts.filter(a => getSubStatus(a) === 'stopped').length, color: '#8b5cf6' },
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>إدارة الاشتراكات</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>متابعة وإدارة اشتراكات الشركات والمحطات</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <div style={{ fontSize: '32px', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {[
          { key: 'companies', label: 'شركات النقل', count: companies.length },
          { key: 'stations', label: 'محطات الوقود', count: stations.length },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key as any)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
            style={{
              background: tab === t.key ? 'var(--primary-glass)' : 'var(--muted)',
              border: tab === t.key ? '1px solid var(--primary-border)' : '1px solid var(--border)',
              color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: '13px',
            }}>
            {t.label}
            <span className="px-1.5 py-0.5 rounded-full text-xs"
              style={{ background: tab === t.key ? 'var(--primary-border)' : 'var(--border)', color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <Search size={16} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expiring', 'expired', 'stopped', 'pending'].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: filterStatus === s ? (s === 'all' ? 'var(--primary-glass)' : `${statusConfig[s]?.color}22`) : 'var(--muted)',
                border: filterStatus === s ? `1px solid ${s === 'all' ? 'var(--primary-border)' : statusConfig[s]?.color + '44'}` : '1px solid var(--border)',
                color: filterStatus === s ? (s === 'all' ? 'var(--primary)' : statusConfig[s]?.color) : 'var(--muted-foreground)',
                cursor: 'pointer',
              }}>
              {s === 'all' ? 'الكل' : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="space-y-4">
        {filtered.map((account, i) => {
          const subSt = getSubStatus(account);
          const sc = statusConfig[subSt];
          const days = getDaysLeft(account.subscriptionEnd);

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                  style={{ background: `${sc.color}22`, color: sc.color, border: `1px solid ${sc.color}44` }}>
                  {account.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>{account.name}</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44` }}>
                      {sc.label}
                    </span>
                    {(account as any).paymentStatus && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                        style={{
                          background: (account as any).paymentStatus === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: (account as any).paymentStatus === 'paid' ? '#22c55e' : '#ef4444',
                        }}>
                        {(account as any).paymentStatus === 'paid' ? 'مسدد' : (account as any).paymentStatus === 'partial' ? 'جزئي' : 'غير مسدد'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{account.managerName} · {account.phone}</div>

                  {/* Subscription Period */}
                  <div className="mt-3 flex items-center gap-6 flex-wrap">
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '2px' }}>بداية الاشتراك</div>
                      <div style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{account.subscriptionStart || 'غير محدد'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '2px' }}>نهاية الاشتراك</div>
                      <div style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{account.subscriptionEnd || 'غير محدد'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '2px' }}>الأيام المتبقية</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: days > 30 ? '#22c55e' : days > 0 ? '#f59e0b' : '#ef4444' }}>
                        {days > 0 ? `${days} يوم` : days === 0 ? 'ينتهي اليوم' : `منتهي منذ ${Math.abs(days)} يوم`}
                      </div>
                    </div>
                    {(account as any).totalDebt !== undefined && (account as any).totalDebt > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6, marginBottom: '2px' }}>الديون</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                          {(account as any).totalDebt.toLocaleString('ar-SA')} ر
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for subscription */}
                  {account.subscriptionStart && account.subscriptionEnd && (
                    <div className="mt-3">
                      {(() => {
                        const start = new Date(account.subscriptionStart).getTime();
                        const end = new Date(account.subscriptionEnd).getTime();
                        const now = new Date().getTime();
                        const progress = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
                        return (
                          <div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                              <div className="h-full rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  background: progress > 90 ? '#ef4444' : progress > 70 ? '#f59e0b' : '#22c55e',
                                }} />
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '3px', textAlign: 'left' }}>
                              {progress.toFixed(0)}% مستخدم
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRenew(account.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <RefreshCw size={13} />
                    تجديد
                  </button>
                  <a href={`https://wa.me/${account.phone}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <MessageCircle size={15} color="#22c55e" />
                  </a>
                  <a href={`tel:${account.phone}`}
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)' }}>
                    <Phone size={15} color="var(--primary)" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 glass-card" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
            <CreditCard size={36} color="var(--muted-foreground)" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>لا توجد اشتراكات تطابق الفلتر</p>
          </div>
        )}
      </div>
    </div>
  );
}
