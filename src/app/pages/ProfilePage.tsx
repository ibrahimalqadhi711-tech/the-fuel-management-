import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Phone, Mail, MapPin, Shield, Edit2, Save, X, Building2, Fuel, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });

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

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return Shield;
      case 'company': return Building2;
      case 'station': return Fuel;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon();

  const handleSave = () => {
    if (user) {
      const updated = { ...user, ...form };
      setUser(updated);
      localStorage.setItem('fuelapp_user', JSON.stringify(updated));
    }
    setEditing(false);
    toast.success('تم تحديث الملف الشخصي بنجاح');
  };

  const handleChangePass = () => {
    if (passForm.newPass !== passForm.confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (passForm.newPass.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setShowPassForm(false);
    setPassForm({ current: '', newPass: '', confirm: '' });
    toast.success('تم تغيير كلمة المرور بنجاح');
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>الملف الشخصي</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>معلوماتك الشخصية وإعدادات الحساب</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
        {/* Avatar & Role */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                style={{ background: `${getRoleColor()}22`, color: getRoleColor(), border: `2px solid ${getRoleColor()}44` }}>
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: `${getRoleColor()}`, border: '2px solid var(--background)' }}>
                <RoleIcon size={14} color="white" />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '22px', color: 'var(--foreground)' }}>{user?.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>حساب نشط</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: `${getRoleColor()}15`, border: `1px solid ${getRoleColor()}30` }}>
                <RoleIcon size={12} color={getRoleColor()} />
                <span style={{ fontSize: '12px', color: getRoleColor(), fontWeight: 700 }}>{getRoleLabel()}</span>
              </div>
            </div>
          </div>

          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Edit2 size={15} />
              تعديل
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: 'name', label: 'الاسم الكامل', icon: User, editable: true },
            { key: 'email', label: 'البريد الإلكتروني', icon: Mail, editable: false },
            { key: 'phone', label: 'رقم الجوال', icon: Phone, editable: true },
            { key: 'city', label: 'المدينة', icon: MapPin, editable: true },
          ].map(field => (
            <div key={field.key} className="p-4 rounded-xl"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--primary-glass)' }}>
                  <field.icon size={14} color="var(--primary)" />
                </div>
                <label style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 600 }}>{field.label}</label>
              </div>
              {editing && field.editable ? (
                <input
                  value={(form as any)[field.key] || (user as any)?.[field.key] || ''}
                  onChange={e => field.key !== 'email' && setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full py-2 px-3 rounded-lg outline-none"
                  style={{ background: 'var(--background)', border: '1px solid var(--primary-border)', color: 'var(--foreground)', fontSize: '14px' }}
                />
              ) : (
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
                  {(user as any)?.[field.key] || '—'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Company/Station info */}
        {user?.companyName && (
          <div className="mt-5 p-4 rounded-xl"
            style={{ background: `${getRoleColor()}11`, border: `1px solid ${getRoleColor()}22` }}>
            <div className="flex items-center gap-3">
              <RoleIcon size={18} color={getRoleColor()} />
              <div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{user.role === 'company' ? 'اسم الشركة' : user.role === 'station' ? 'اسم المحطة' : 'الجهة'}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: getRoleColor() }}>{user.companyName}</div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription info for company/station */}
        {(user?.subscriptionStart || user?.subscriptionEnd) && (
          <div className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '8px', fontWeight: 600 }}>معلومات الاشتراك</div>
            <div className="flex gap-8">
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.7 }}>بداية الاشتراك</div>
                <div style={{ fontSize: '13px', color: '#d4af37', fontWeight: 700 }}>{user.subscriptionStart || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.7 }}>نهاية الاشتراك</div>
                <div style={{ fontSize: '13px', color: '#d4af37', fontWeight: 700 }}>{user.subscriptionEnd || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Save/Cancel buttons */}
        {editing && (
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Save size={16} />
              حفظ التغييرات
            </button>
            <button onClick={() => setEditing(false)}
              className="px-6 py-3 rounded-xl"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Lock size={18} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>كلمة المرور</div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>غيّر كلمة المرور لحماية حسابك</div>
            </div>
          </div>
          <button onClick={() => setShowPassForm(!showPassForm)}
            className="px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {showPassForm ? 'إلغاء' : 'تغيير'}
          </button>
        </div>

        {showPassForm && (
          <div className="space-y-4 pt-4 border-t border-border">
            {[
              { key: 'current', label: 'كلمة المرور الحالية' },
              { key: 'newPass', label: 'كلمة المرور الجديدة' },
              { key: 'confirm', label: 'تأكيد كلمة المرور' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>{f.label}</label>
                <div className="relative">
                  <Lock size={15} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={(passForm as any)[f.key]}
                    onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full py-2.5 pr-10 pl-10 rounded-xl outline-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
                  />
                  {f.key === 'newPass' && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={15} color="var(--muted-foreground)" /> : <Eye size={15} color="var(--muted-foreground)" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={handleChangePass}
              className="px-6 py-3 rounded-xl flex items-center gap-2 mt-4"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Save size={16} />
              تغيير كلمة المرور
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
