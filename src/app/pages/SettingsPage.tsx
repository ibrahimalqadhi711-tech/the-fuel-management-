import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Bell, Shield, Palette, Globe, Save, Zap, Moon, Sun, Monitor, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      newOrders: true,
      subscriptionExpiry: true,
      newRegistrations: true,
      paymentReminders: true,
      systemUpdates: false,
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      loginNotifications: true,
    },
    display: {
      theme: 'dark',
      language: 'ar',
      currency: 'SAR',
      dateFormat: 'ar-SA',
    },
    system: {
      autoRefresh: true,
      refreshInterval: '30',
      paginationSize: '20',
    },
  });

  const { theme, setTheme, language, setLanguage, t } = useApp();

  const toggle = (section: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: !(prev as any)[section][key],
      },
    }));
  };

  const handleSave = () => {
    toast.success(t('save_settings'));
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className="flex items-center transition-all"
      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
      <div className="relative w-12 h-6 rounded-full transition-all"
        style={{ background: value ? 'var(--primary)' : 'var(--muted)' }}>
        <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
          style={{
            background: '#ffffff',
            right: value ? '4px' : 'auto',
            left: value ? 'auto' : '4px',
            boxShadow: value ? '0 0 8px var(--primary)' : 'none',
            opacity: value ? 1 : 0.6
          }} />
      </div>
    </button>
  );

  const sections = [
    {
      key: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      color: '#2563eb',
      items: [
        { key: 'newOrders', label: 'طلبات جديدة', desc: 'إشعار عند إنشاء طلب وقود جديد' },
        { key: 'subscriptionExpiry', label: 'انتهاء الاشتراك', desc: 'تنبيه قبل 30 يوم من انتهاء الاشتراك' },
        { key: 'newRegistrations', label: 'تسجيلات جديدة', desc: 'إشعار عند تسجيل عميل جديد' },
        { key: 'paymentReminders', label: 'تذكيرات الدفع', desc: 'تنبيه للديون المتأخرة' },
        { key: 'systemUpdates', label: 'تحديثات النظام', desc: 'إشعارات تحديثات المنصة' },
      ],
    },
    {
      key: 'security',
      title: 'الأمان والخصوصية',
      icon: Shield,
      color: '#22c55e',
      items: [
        { key: 'twoFactor', label: 'التحقق بخطوتين', desc: 'حماية إضافية لحسابك' },
        { key: 'loginNotifications', label: 'إشعارات تسجيل الدخول', desc: 'تنبيه عند تسجيل دخول جديد' },
      ],
    },
    {
      key: 'system',
      title: 'إعدادات النظام',
      icon: Settings,
      color: '#8b5cf6',
      items: [
        { key: 'autoRefresh', label: 'تحديث تلقائي', desc: 'تحديث البيانات تلقائياً' },
      ],
    },
  ];

  return (
    <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr', fontFamily: 'Cairo, sans-serif' }} className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>{t('settings')}</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>تخصيص المنصة حسب تفضيلاتك</p>
      </motion.div>
 
      {/* Theme Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Palette size={18} color="#d4af37" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>المظهر</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>تخصيص واجهة المستخدم</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'dark', label: t('dark_mode'), icon: Moon, desc: 'وضع ليلي' },
            { key: 'light', label: t('light_mode'), icon: Sun, desc: 'وضع نهاري' },
            { key: 'auto', label: t('auto_mode'), icon: Monitor, desc: 'حسب النظام' },
          ].map(tItem => (
            <button
              key={tItem.key}
              onClick={() => setTheme(tItem.key as any)}
              className="p-4 rounded-xl text-center transition-all"
              style={{
                background: theme === tItem.key ? 'var(--glass-hover)' : 'transparent',
                border: theme === tItem.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                cursor: 'pointer',
              }}>
              <tItem.icon size={20} color={theme === tItem.key ? 'var(--primary)' : 'var(--muted-foreground)'} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13px', fontWeight: theme === tItem.key ? 700 : 400, color: theme === tItem.key ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {tItem.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{tItem.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Settings Sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + si * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${section.color}22`, border: `1px solid ${section.color}44` }}>
              <section.icon size={18} color={section.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>{section.title}</div>
            </div>
          </div>

          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <Toggle
                  value={(settings as any)[section.key][item.key]}
                  onChange={() => toggle(section.key, item.key)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* System Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <Globe size={18} color="#06b6d4" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>{t('language')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>{t('language')}</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="w-full py-2.5 px-4 rounded-xl outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}>
              <option value="ar" style={{ background: 'var(--popover)' }}>العربية</option>
              <option value="en" style={{ background: 'var(--popover)' }}>English</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>العملة</label>
            <select
              defaultValue="SAR"
              className="w-full py-2.5 px-4 rounded-xl outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}>
              <option value="SAR" style={{ background: 'var(--popover)' }}>ريال سعودي</option>
              <option value="USD" style={{ background: 'var(--popover)' }}>دولار</option>
            </select>
          </div>
          {[
            { key: 'refreshInterval', label: 'معدل التحديث (ثانية)', section: 'system', options: ['15', '30', '60', '120'] },
            { key: 'paginationSize', label: 'عناصر الصفحة', section: 'system', options: ['10', '20', '50', '100'] },
          ].map(sel => (
            <div key={sel.key}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>{sel.label}</label>
              <select
                value={(settings as any)[sel.section][sel.key]}
                onChange={e => setSettings(p => ({ ...p, [sel.section]: { ...(p as any)[sel.section], [sel.key]: e.target.value } }))}
                className="w-full py-2.5 px-4 rounded-xl outline-none"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}>
                {sel.options.map(v => <option key={v} value={v} style={{ background: 'var(--popover)' }}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <button onClick={handleSave}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-101"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(37,99,235,0.4)' }}>
          <Save size={18} />
          {t('save_settings')}
        </button>
      </motion.div>
    </div>
  );
}
