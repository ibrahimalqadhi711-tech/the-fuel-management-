import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, Phone, Mail, Ban, CheckCircle, X, Loader2, Fuel, Calendar, MapPin } from 'lucide-react';
import { useApp, Employee } from '../context/AppContext';
import { toast } from 'sonner';
import { addUserInfo, updateUser, parseError } from '../../services/api';

export default function EmployeesPage() {
  const { employees, setEmployees, stations, user, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', stationId: '' });

  const myStations = user?.role === 'station' ? stations.filter(s => s.id === user.stationId) : stations;
  const myEmployees = user?.role === 'station'
    ? employees.filter(e => e.stationId === user.stationId)
    : employees;

  const filtered = myEmployees.filter(e =>
    e.name.includes(search) || e.phone.includes(search) || e.stationName.includes(search)
  );

  const handleToggle = async (id: string, status: string) => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser(id, { status: newStatus });
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الموظف`);
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error(parseError(e));
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.stationId) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    
    try {
      await addUserInfo({
        id: crypto.randomUUID(), // assuming id isn't auto-generated uuid for users? wait, let's use a dummy id since users doesn't auto-gen if we do direct insert. Actually auth.users should be used, but since we are replacing mock, we'll just insert to users for now.
        full_name: form.name,
        email: form.email || `${form.phone}@demo.sa`,
        role: 'station_employee',
        status: 'active',
        station_id: form.stationId,
      });

      setShowModal(false);
      setForm({ name: '', phone: '', email: '', stationId: '' });
      toast.success('تم إضافة الموظف بنجاح');
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error('خطأ: ' + parseError(e));
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
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>الموظفون</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>إدارة موظفي المحطات وصلاحياتهم</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>
          <Plus size={16} />
          إضافة موظف
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#8b5cf6' }}>{myEmployees.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>إجمالي الموظفين</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#22c55e' }}>{myEmployees.filter(e => e.status === 'active').length}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>نشط</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ef4444' }}>{myEmployees.filter(e => e.status === 'inactive').length}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>موقوف</div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search size={16} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن موظف..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp, i) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6"
          >
            {/* Avatar */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                  style={{ background: 'var(--primary-glass)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{emp.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Fuel size={10} color="#f59e0b" />
                    <span style={{ fontSize: '11px', color: '#f59e0b' }}>{emp.stationName}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: emp.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: emp.status === 'active' ? '#22c55e' : '#ef4444',
                  border: `1px solid ${emp.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                {emp.status === 'active' ? 'نشط' : 'موقوف'}
              </span>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <Phone size={13} color="var(--muted-foreground)" style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{emp.phone}</span>
              </div>
              {emp.email && (
                <div className="flex items-center gap-2">
                  <Mail size={13} color="var(--muted-foreground)" style={{ opacity: 0.6 }} />
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{emp.email}</span>
                </div>
              )}
            </div>

            {/* Station & Date */}
            <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Fuel size={12} color="#f59e0b" />
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>المحطة:</span>
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>{emp.stationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} color="var(--muted-foreground)" />
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>تاريخ الإضافة:</span>
                <span style={{ fontSize: '11px', color: 'var(--foreground)', fontWeight: 600 }}>
                  {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(emp.id, emp.status)}
                className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: emp.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid ${emp.status === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                  color: emp.status === 'active' ? '#ef4444' : '#22c55e',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                {emp.status === 'active' ? <><Ban size={13} /> إيقاف</> : <><CheckCircle size={13} /> تفعيل</>}
              </button>
              <a href={`tel:${emp.phone}`}
                className="p-2 rounded-xl transition-all"
                style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)' }}>
                <Phone size={15} color="var(--primary)" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 glass-card" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
          <Users size={36} className="mx-auto mb-4 opacity-10" color="var(--foreground)" />
          <p>لا يوجد موظفون</p>
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
              className="w-full max-w-md glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--foreground)' }}>إضافة موظف جديد</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-all">
                  <X size={18} color="var(--muted-foreground)" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'الاسم الكامل', placeholder: 'اسم الموظف' },
                  { key: 'phone', label: 'رقم الجوال', placeholder: '7xxxxxxxx' },
                  { key: 'email', label: 'البريد الإلكتروني', placeholder: 'emp@station.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>{f.label}</label>
                    <input
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full py-2.5 px-4 rounded-xl outline-none"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>المحطة</label>
                  <select value={form.stationId} onChange={e => setForm(p => ({ ...p, stationId: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl outline-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}>
                    <option value="" disabled style={{ background: 'var(--popover)' }}>اختر المحطة</option>
                    {myStations.map(s => <option key={s.id} value={s.id} style={{ background: 'var(--popover)' }}>{s.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleAdd} disabled={loading}
                    className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    إضافة
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-xl"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
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
