import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Building2, Fuel, Eye, EyeOff, Upload, CheckCircle, AlertCircle, Loader2, ChevronLeft, User, Phone, Mail, MapPin, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { RateLimitButton } from '../components/RateLimitButton';

const cities = ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'البيضاء', 'المحويت', 'حجة', 'المهرة', 'شبوة', 'أبين', 'لحج', 'الضالع', 'ريمة', 'عمران', 'الجوف', 'مأرب', 'سقطرى', 'صعدة', 'المدية'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerAccount } = useApp();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<'company' | 'station' | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const selectedPlan = JSON.parse(localStorage.getItem("selected_plan") || "null");

  // Prevent access without a selected plan
  useEffect(() => {
    if (!selectedPlan) {
      toast.error("يرجى اختيار باقة اشتراك أولاً");
      navigate("/");
    }
  }, [selectedPlan, navigate]);

  const [form, setForm] = useState({
    companyName: '',
    managerName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
    expectedVehicleCount: '',
    expectedDriverCount: '',
    numberOfPumps: '',
    fuelTypes: [] as string[],
    selectedPlan: selectedPlan?.name || 'Starter',
    agreedToReview: false,
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.companyName) errs.companyName = 'الاسم مطلوب';
    if (!form.managerName) errs.managerName = 'اسم المسؤول مطلوب';
    if (!form.phone.match(/^7\d{8}$/)) errs.phone = 'رقم جوال غير صحيح (يجب أن يكون 9 أرقام يبدأ بـ 7)';
    if (!form.email.includes('@')) errs.email = 'بريد إلكتروني غير صحيح';
    if (!form.city) errs.city = 'المدينة مطلوبة';
    if (form.password.length < 8) errs.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    
    if (accountType === 'company') {
      if (!form.expectedVehicleCount) errs.expectedVehicleCount = 'العدد المتوقع للمركبات مطلوب';
      if (!form.expectedDriverCount) errs.expectedDriverCount = 'العدد المتوقع للسائقين مطلوب';
    } else {
      if (!form.numberOfPumps) errs.numberOfPumps = 'عدد المضخات مطلوب';
      if (form.fuelTypes.length === 0) errs.fuelTypes = 'يجب اختيار نوع وقود واحد على الأقل';
      if (!form.address) errs.address = 'العنوان مطلوب';
    }

    if (!form.agreedToReview) errs.agreedToReview = 'يجب الموافقة على شروط المراجعة';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const res = await registerAccount({ ...form, accountType, selectedPlan: selectedPlan?.name || form.selectedPlan });
    if (res.success) {
      setSuccess(true);
      localStorage.removeItem("selected_plan"); // Clear after success
    } else {
      toast.error(res.error || 'حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0b14', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 text-center max-w-md w-full mx-4"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(37,99,235,0.2)', border: '2px solid rgba(37,99,235,0.4)' }}>
            <Loader2 size={40} color="#2563eb" className="animate-pulse" />
          </div>
          <CheckCircle size={40} color="#22c55e" className="mb-4 mx-auto" />
          <h2 style={{ fontWeight: 800, fontSize: '24px', color: '#e8eaf6', marginBottom: '12px' }}>تم إرسال طلبك بنجاح</h2>
          <p style={{ color: '#8892b0', fontSize: '14px', lineHeight: 1.8, marginBottom: '8px' }}>
            تم استلام طلب انضمام {accountType === 'company' ? 'شركتك' : 'محطتك'} لباقة <span style={{ color: '#3b82f6', fontWeight: 700 }}>{selectedPlan?.name}</span>.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 600 }}>بانتظار مراجعة الإدارة</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px', lineHeight: 1.8 }}>
            سيتم مراجعة بياناتك وتفعيل الحساب خلال 24 ساعة. ستصلك رسالة تأكيد فور التفعيل.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b14', direction: 'rtl', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 40%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(212,175,55,0.05) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
            <Zap size={26} color="white" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#e8eaf6', marginBottom: '4px' }}>إكمال بيانات الانضمام</h1>
          <p style={{ color: '#8892b0', fontSize: '13px' }}>أنت تسجل في باقة <span style={{ color: '#2563eb', fontWeight: 700 }}>{selectedPlan?.name}</span></p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: step >= s ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                  color: step >= s ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
              {s < 2 && <div className="w-12 h-0.5" style={{ background: step > s ? '#2563eb' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-8"
        >
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '18px', color: '#e8eaf6', marginBottom: '6px' }}>اختر نوع الحساب</h2>
              <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '24px' }}>حدد نوع نشاطك للبدء في طلب الانضمام</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: 'company' as const, icon: Building2, label: 'شركة نقل', desc: 'إدارة أسطول المركبات وطلب الوقود', color: '#22c55e' },
                  { type: 'station' as const, icon: Fuel, label: 'محطة وقود', desc: 'استقبال وتأكيد طلبات الوقود', color: '#f59e0b' },
                ].map(opt => (
                  <motion.button
                    key={opt.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAccountType(opt.type)}
                    className="p-6 rounded-2xl text-center transition-all"
                    style={{
                      background: accountType === opt.type ? `${opt.color}15` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${accountType === opt.type ? opt.color : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${opt.color}22` }}>
                      <opt.icon size={28} color={opt.color} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#e8eaf6', marginBottom: '6px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: '#8892b0', lineHeight: 1.5 }}>{opt.desc}</div>
                    {accountType === opt.type && (
                      <div className="mt-3 flex items-center justify-center gap-1">
                        <CheckCircle size={14} color={opt.color} />
                        <span style={{ fontSize: '12px', color: opt.color, fontWeight: 600 }}>تم الاختيار</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => accountType && setStep(2)}
                disabled={!accountType}
                className="w-full mt-6 py-3.5 rounded-xl transition-all"
                style={{
                  background: accountType ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                  color: accountType ? 'white' : '#6b7280',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: accountType ? 'pointer' : 'not-allowed',
                  boxShadow: accountType ? '0 4px 20px rgba(37,99,235,0.4)' : 'none',
                }}
              >
                التالي
              </button>

              <div className="text-center mt-4">
                <span style={{ fontSize: '13px', color: '#6b7280' }}>لديك حساب؟ </span>
                <Link to="/login" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>تسجيل الدخول</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="p-2 rounded-xl hover:bg-white/10 transition-all">
                  <ChevronLeft size={18} color="#8892b0" style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '18px', color: '#e8eaf6' }}>بيانات {accountType === 'company' ? 'الشركة' : 'المحطة'}</h2>
                  <p style={{ color: '#8892b0', fontSize: '13px' }}>أدخل المعلومات الأساسية لطلبك</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Logo Upload */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-2 flex items-center justify-center overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)', cursor: 'pointer' }}
                    onClick={() => document.getElementById('logoInput')?.click()}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Upload size={24} color="#4b5563" />
                    )}
                  </div>
                  <input id="logoInput" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>رفع الشعار (اختياري)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'companyName', label: `اسم ${accountType === 'company' ? 'الشركة' : 'المحطة'}`, icon: accountType === 'company' ? Building2 : Fuel, placeholder: 'مثال: شركة النقل الذهبي' },
                    { key: 'managerName', label: 'اسم المسؤول', icon: User, placeholder: 'الاسم الكامل للمسؤول' },
                    { key: 'phone', label: 'رقم الجوال', icon: Phone, placeholder: '7xxxxxxxx' },
                    { key: 'email', label: 'البريد الإلكتروني', icon: Mail, placeholder: 'example@email.com' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                        {field.label} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="relative">
                        <field.icon size={16} color="#4b5563" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={field.key === 'email' ? 'email' : 'text'}
                          value={(form as any)[field.key]}
                          onChange={e => update(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: errors[field.key] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            color: '#e8eaf6',
                            fontSize: '13px',
                          }}
                        />
                      </div>
                      {errors[field.key] && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors[field.key]}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                      المدينة <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} color="#4b5563" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <select
                        value={form.city}
                        onChange={e => update('city', e.target.value)}
                        className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none transition-all appearance-none"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: errors.city ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: form.city ? '#e8eaf6' : '#6b7280',
                          fontSize: '13px',
                        }}
                      >
                        <option value="" disabled style={{ background: '#0f1123' }}>اختر المدينة</option>
                        {cities.map(c => <option key={c} value={c} style={{ background: '#0f1123' }}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Address for Station */}
                  {accountType === 'station' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                        العنوان التفصيلي <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        value={form.address}
                        onChange={e => update('address', e.target.value)}
                        placeholder="الحي، الشارع"
                        className="w-full py-2.5 px-4 rounded-xl outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: errors.address ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)', color: '#e8eaf6', fontSize: '13px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Account Specific Fields */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
                  {accountType === 'company' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>عدد المركبات المتوقع</label>
                        <input
                          type="number"
                          value={form.expectedVehicleCount}
                          onChange={e => update('expectedVehicleCount', e.target.value)}
                          className="w-full py-2 px-3 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                        />
                        {errors.expectedVehicleCount && <p style={{ fontSize: '10px', color: '#ef4444' }}>{errors.expectedVehicleCount}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>عدد السائقين المتوقع</label>
                        <input
                          type="number"
                          value={form.expectedDriverCount}
                          onChange={e => update('expectedDriverCount', e.target.value)}
                          className="w-full py-2 px-3 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                        />
                        {errors.expectedDriverCount && <p style={{ fontSize: '10px', color: '#ef4444' }}>{errors.expectedDriverCount}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>عدد المضخات</label>
                        <input
                          type="number"
                          value={form.numberOfPumps}
                          onChange={e => update('numberOfPumps', e.target.value)}
                          className="w-full py-2 px-3 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                        />
                        {errors.numberOfPumps && <p style={{ fontSize: '10px', color: '#ef4444' }}>{errors.numberOfPumps}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>أنواع الوقود المتوفرة</label>
                        <div className="flex gap-4">
                          {['petrol_91', 'petrol_95', 'diesel'].map(f => (
                            <label key={f} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.fuelTypes.includes(f)}
                                onChange={e => {
                                  const list = e.target.checked 
                                    ? [...form.fuelTypes, f]
                                    : form.fuelTypes.filter(x => x !== f);
                                  update('fuelTypes', list);
                                }}
                                className="w-4 h-4 rounded border-white/10 bg-black/20 text-blue-600"
                              />
                              <span className="text-sm text-gray-300">{f === 'diesel' ? 'ديزل' : f.replace('petrol_', 'بنزين ')}</span>
                            </label>
                          ))}
                        </div>
                        {errors.fuelTypes && <p style={{ fontSize: '10px', color: '#ef4444' }}>{errors.fuelTypes}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  {[
                    { key: 'password', label: 'كلمة المرور', placeholder: '8 أحرف على الأقل' },
                    { key: 'confirmPassword', label: 'تأكيد كلمة المرور', placeholder: 'أعد إدخال كلمة المرور' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                        {field.label} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="relative">
                        <Lock size={16} color="#4b5563" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={(form as any)[field.key]}
                          onChange={e => update(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full py-2.5 pr-10 pl-10 rounded-xl outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: errors[field.key] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)', color: '#e8eaf6', fontSize: '13px' }}
                        />
                        {field.key === 'password' && (
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {showPass ? <EyeOff size={16} color="#4b5563" /> : <Eye size={16} color="#4b5563" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={form.agreedToReview}
                      onChange={e => update('agreedToReview', e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-black/20 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-300 pointer-events-none" style={{ lineHeight: 1.6 }}>
                      أوافق على أن الطلب سيخضع للمراجعة من قبل الإدارة قبل تفعيل الحساب. 
                      <span className="block text-xs text-gray-500 mt-1">يتم التواصل عادةً خلال أقل من 24 ساعة عمل.</span>
                    </label>
                    {errors.agreedToReview && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.agreedToReview}</p>}
                  </div>
                </div>

                <RateLimitButton
                  onClick={handleSubmit}
                  label="إرسال طلب الانضمام"
                  loadingLabel="جاري إرسال الطلب..."
                  icon={<CheckCircle size={20} />}
                  cooldownSeconds={30}
                  className="w-full py-6 rounded-xl mt-4"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
