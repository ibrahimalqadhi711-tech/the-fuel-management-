import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Plus, Search, Filter, Phone, Mail, MapPin, CheckCircle, XCircle, Clock, MessageCircle, RefreshCw, Ban, ChevronDown, Eye, Edit, Trash2, X, Loader2, Users } from 'lucide-react';
import { useApp, Company } from '../context/AppContext';
import { toast } from 'sonner';
import { addCompany, updateCompany, parseError } from '../../services/api';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'نشط', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  pending: { label: 'معلق', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  inactive: { label: 'موقوف', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  expired: { label: 'منتهي', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
};

const paymentLabels: Record<string, { label: string; color: string }> = {
  paid: { label: 'مسدد', color: '#22c55e' },
  unpaid: { label: 'غير مسدد', color: '#ef4444' },
  partial: { label: 'جزئي', color: '#f59e0b' },
};

export default function CompaniesPage() {
  const { companies, setCompanies, addNotification, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', managerName: '', phone: '', email: '', city: '',
    subscriptionStart: '', subscriptionEnd: '',
  });

  const filtered = companies.filter((c: any) => {
    const matchSearch = c.name.includes(search) || c.managerName.includes(search) || c.phone.includes(search);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await updateCompany(id, { status: 'active' });
      toast.success('تم قبول الشركة بنجاح');
      addNotification({ title: 'تم قبول الحساب', message: `تم تفعيل حساب الشركة`, type: 'success' });
      if (refreshData) refreshData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateCompany(id, { status: 'inactive' });
      toast.error('تم رفض الشركة');
      if (refreshData) refreshData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggle = async (id: string, status: string) => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    try {
      await updateCompany(id, { status: newStatus });
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الحساب`);
      if (refreshData) refreshData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await addCompany({
        company_code: `COMP-${Date.now()}`,
        company_name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.city,
        status: 'active'
      });
      setShowModal(false);
      setForm({ name: '', managerName: '', phone: '', email: '', city: '', subscriptionStart: '', subscriptionEnd: '' });
      toast.success('تم إضافة الشركة بنجاح');
      if (refreshData) refreshData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>شركات النقل</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>إدارة شركات النقل والاشتراكات</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 15px rgba(37,99,235,0.4)', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} />
          إضافة شركة
        </button>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الشركات', value: companies.length, color: '#2563eb' },
          { label: 'نشط', value: companies.filter(c => c.status === 'active').length, color: '#22c55e' },
          { label: 'معلق', value: companies.filter(c => c.status === 'pending').length, color: '#f59e0b' },
          { label: 'منتهي/موقوف', value: companies.filter(c => c.status === 'expired' || c.status === 'inactive').length, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div style={{ fontSize: '26px', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: '200px' }}>
          <Search size={16} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن شركة..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'active', 'pending', 'inactive', 'expired'].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: filterStatus === s ? 'var(--secondary)' : 'var(--muted)',
                border: filterStatus === s ? '1px solid var(--primary)' : '1px solid var(--border)',
                color: filterStatus === s ? 'var(--primary)' : 'var(--muted-foreground)',
                cursor: 'pointer',
              }}>
              {s === 'all' ? 'الكل' : statusLabels[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full pro-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                {['الشركة', 'المسؤول', 'الاتصال', 'المدينة', 'الاشتراك', 'الحالة', 'الديون', 'الإجراءات'].map(h => (
                  <th key={h} style={{ textAlign: 'right', fontSize: '12px', color: 'var(--primary)', padding: '14px 16px', background: 'var(--secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((company: any, i: number) => (
                <motion.tr
                  key={company.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="hover:bg-glass-hover transition-colors"
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{company.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{company.totalOrders} طلب</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{company.managerName}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--foreground)' }}>{company.phone}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{company.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--foreground)' }}>{company.city}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--foreground)' }}>{company.subscriptionEnd || 'غير محدد'}</div>
                    <div className="mt-1" style={{
                      display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: paymentLabels[company.paymentStatus]?.color + '22',
                      color: paymentLabels[company.paymentStatus]?.color,
                    }}>
                      {paymentLabels[company.paymentStatus]?.label}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: statusLabels[company.status]?.bg,
                        color: statusLabels[company.status]?.color,
                        border: `1px solid ${statusLabels[company.status]?.color}44`,
                      }}>
                      {statusLabels[company.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: company.totalDebt > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {company.totalDebt > 0 ? `${company.totalDebt.toLocaleString('ar-SA')} ر` : 'لا يوجد'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-1.5">
                      {company.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(company.id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110"
                            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                            title="قبول">
                            <CheckCircle size={14} color="#22c55e" />
                          </button>
                          <button onClick={() => handleReject(company.id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                            title="رفض">
                            <XCircle size={14} color="#ef4444" />
                          </button>
                        </>
                      )}
                      {company.status !== 'pending' && (
                        <button onClick={() => handleToggle(company.id, company.status)}
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{
                            background: company.status === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                            border: `1px solid ${company.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                          }}
                          title={company.status === 'active' ? 'إيقاف' : 'تفعيل'}>
                          {company.status === 'active' ? <Ban size={14} color="#ef4444" /> : <CheckCircle size={14} color="#22c55e" />}
                        </button>
                      )}
                      <a href={`https://wa.me/${company.phone}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                        title="واتساب">
                        <MessageCircle size={14} color="#22c55e" />
                      </a>
                      <a href={`tel:${company.phone}`}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
                        title="اتصال">
                        <Phone size={14} color="#2563eb" />
                      </a>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              <Building2 size={40} color="var(--border)" style={{ margin: '0 auto 12px' }} />
              <p>لا توجد شركات تطابق البحث</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-8"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--foreground)' }}>إضافة شركة جديدة</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-glass-hover transition-all">
                  <X size={18} color="var(--muted-foreground)" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'اسم الشركة', placeholder: 'شركة النقل ...' },
                  { key: 'managerName', label: 'اسم المسؤول', placeholder: 'الاسم الكامل' },
                  { key: 'phone', label: 'رقم الجوال', placeholder: '7xxxxxxxx' },
                  { key: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com' },
                  { key: 'city', label: 'المحافظة', placeholder: 'صنعاء' },
                  { key: 'subscriptionStart', label: 'تاريخ بداية الاشتراك', placeholder: '', type: 'date' },
                  { key: 'subscriptionEnd', label: 'تاريخ انتهاء الاشتراك', placeholder: '', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      type={(field as any).type || 'text'}
                      value={(form as any)[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full py-2.5 px-4 rounded-xl outline-none"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleAdd} disabled={loading}
                    className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    إضافة
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-xl"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '14px', cursor: 'pointer' }}>
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
