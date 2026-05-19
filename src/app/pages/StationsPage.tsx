import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fuel, Plus, Search, CheckCircle, XCircle, Ban, MessageCircle, Phone, X, Loader2, MapPin } from 'lucide-react';
import { useApp, Station } from '../context/AppContext';
import { toast } from 'sonner';
import { addStation, updateStation, parseError } from '../../services/api';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'نشط', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  pending: { label: 'معلق', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  inactive: { label: 'موقوف', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function StationsPage() {
  const { stations, setStations, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', managerName: '', phone: '', email: '', city: '', address: '',
    subscriptionStart: '', subscriptionEnd: '',
  });

  const filtered = stations.filter((s: any) => {
    const matchSearch = s.name.includes(search) || s.managerName.includes(search) || s.city.includes(search);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await updateStation(id, { status: 'active' });
      toast.success('تم تفعيل المحطة');
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggle = async (id: string, status: string) => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    try {
      await updateStation(id, { status: newStatus });
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} المحطة`);
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await addStation({
        station_code: `ST-${Date.now()}`,
        station_name: form.name,
        address: form.address,
        phone: form.phone,
        status: 'active'
      });
      setShowModal(false);
      setForm({ name: '', managerName: '', phone: '', email: '', city: '', address: '', subscriptionStart: '', subscriptionEnd: '' });
      toast.success('تم إضافة المحطة بنجاح');
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error(e.message);
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
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>محطات الوقود</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>إدارة محطات الوقود وموظفيها</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
          <Plus size={16} />
          إضافة محطة
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المحطات', value: stations.length, color: '#f59e0b' },
          { label: 'نشط', value: stations.filter(s => s.status === 'active').length, color: '#22c55e' },
          { label: 'معلق', value: stations.filter(s => s.status === 'pending').length, color: '#f59e0b' },
          { label: 'موقوف', value: stations.filter(s => s.status === 'inactive').length, color: '#ef4444' },
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
            placeholder="ابحث عن محطة..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'pending', 'inactive'].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: filterStatus === s ? 'rgba(245,158,11,0.15)' : 'var(--muted)',
                border: filterStatus === s ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                color: filterStatus === s ? '#f59e0b' : 'var(--muted-foreground)',
                cursor: 'pointer',
              }}>
              {s === 'all' ? 'الكل' : statusLabels[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((station: any, i: number) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Fuel size={24} color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{station.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{station.managerName}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: statusLabels[station.status]?.bg,
                  color: statusLabels[station.status]?.color,
                  border: `1px solid ${statusLabels[station.status]?.color}44`,
                }}>
                {statusLabels[station.status]?.label}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={13} color="var(--muted-foreground)" style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{station.city} - {station.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} color="var(--muted-foreground)" style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{station.phone}</span>
              </div>
            </div>

            {/* Fuel Types */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {station.fuelTypes.map((ft: any) => (
                <span key={ft} className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: ft === 'ديزل' ? 'rgba(37,99,235,0.1)' : ft === 'بترول' ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)',
                    color: ft === 'ديزل' ? '#2563eb' : ft === 'بترول' ? '#22c55e' : '#d4af37',
                    border: '1px solid currentColor',
                    borderOpacity: 0.2
                  } as any}>
                  {ft}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl text-center"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{station.totalOrders}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>طلب</div>
              </div>
              <div className="p-3 rounded-xl text-center"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#d4af37' }}>{(station.totalRevenue / 1000).toFixed(1)}K</div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>ريال</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {station.status === 'pending' ? (
                <button onClick={() => handleApprove(station.id)}
                  className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <CheckCircle size={14} />
                  تفعيل
                </button>
              ) : (
                <button onClick={() => handleToggle(station.id, station.status)}
                  className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: station.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    border: `1px solid ${station.status === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                    color: station.status === 'active' ? '#ef4444' : '#22c55e',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  }}>
                  {station.status === 'active' ? <><Ban size={14} /> إيقاف</> : <><CheckCircle size={14} /> تفعيل</>}
                </button>
              )}
              <a href={`https://wa.me/${station.phone}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <MessageCircle size={15} color="#22c55e" />
              </a>
              <a href={`tel:${station.phone}`}
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)' }}>
                <Phone size={15} color="var(--primary)" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 glass-card" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
          <Fuel size={40} className="mx-auto mb-4 opacity-10" color="var(--foreground)" />
          <p>لا توجد محطات تطابق البحث</p>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--foreground)' }}>إضافة محطة جديدة</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-all">
                  <X size={18} color="var(--muted-foreground)" />
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {[
                  { key: 'name', label: 'اسم المحطة', placeholder: 'محطة الوقود ...' },
                  { key: 'managerName', label: 'اسم المسؤول', placeholder: 'الاسم الكامل' },
                  { key: 'phone', label: 'رقم الجوال', placeholder: '7xxxxxxxx' },
                  { key: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com' },
                  { key: 'city', label: 'المحافظة', placeholder: 'صنعاء' },
                  { key: 'address', label: 'العنوان', placeholder: 'الشارع والحي' },
                  { key: 'subscriptionStart', label: 'بداية الاشتراك', placeholder: '', type: 'date' },
                  { key: 'subscriptionEnd', label: 'نهاية الاشتراك', placeholder: '', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '5px' }}>{field.label}</label>
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
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleAdd} disabled={loading}
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  إضافة
                </button>
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '14px', cursor: 'pointer' }}>
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
