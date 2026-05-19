import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Fuel, Building2, Users, BarChart3, Shield, Zap, QrCode, Bell, ChevronLeft, Star, CheckCircle, Cloud, Lock, RefreshCw, Layers, ShieldCheck, Smartphone, Database, CheckCircle2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../constants/plans';

const features = [
  { icon: Fuel, title: 'إدارة الوقود', desc: 'طلب وتتبع الوقود بشكل إلكتروني كامل مع QR Code', color: '#f59e0b' },
  { icon: Building2, title: 'إدارة الشركات', desc: 'إدارة شركات النقل ومتابعة حساباتها وديونها', color: '#22c55e' },
  { icon: BarChart3, title: 'تقارير متقدمة', desc: 'تقارير يومية وشهرية وسنوية مع تصدير PDF وExcel', color: '#2563eb' },
  { icon: Shield, title: 'أمان عالي', desc: 'JWT Authentication وتشفير كامل وحماية قوية', color: '#8b5cf6' },
  { icon: QrCode, title: 'QR Code', desc: 'إنشاء ومسح QR Code للطلبات بسرعة وسهولة', color: '#d4af37' },
  { icon: Bell, title: 'إشعارات فورية', desc: 'تنبيهات لحظية عند كل عملية وتغيير في الحساب', color: '#ef4444' },
];

const stats = [
  { value: '500+', label: 'شركة نقل' },
  { value: '200+', label: 'محطة وقود' },
  { value: '50K+', label: 'طلب منجز' },
  { value: '99.9%', label: 'وقت التشغيل' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 20%, var(--primary) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, var(--accent) 0%, transparent 50%)',
        opacity: 0.1,
      }} />

      {/* Grid pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.2,
      }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-4 shadow-sm"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--foreground)' }}>منصة الوقود الذكية</div>
            <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>FuelPro Smart System</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl transition-all hover:bg-glass-hover"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '14px' }}>
            تسجيل الدخول
          </button>
          <button onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
            إنشاء حساب
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <Zap size={14} color="#2563eb" />
            <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>منصة إدارة النقل والوقود #1</span>
          </div>

          <h1 className="mb-6" style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.2 }}>
            <span style={{ color: 'var(--foreground)' }}>منصة </span>
            <span style={{ background: 'linear-gradient(135deg, var(--primary), #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              إدارة الوقود
            </span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent), #f0d060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              الذكية والاحترافية
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}>
            ربط شركات النقل بمحطات الوقود إلكترونياً مع نظام محاسبة متكامل، QR Code، وتقارير شاملة
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 30px rgba(37,99,235,0.5)', cursor: 'pointer' }}>
              مشاهدة الباقات
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl"
              style={{ background: 'var(--glass-hover)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '16px', fontWeight: 600 }}>
              تسجيل الدخول
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center shadow-lg">
              <div style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-16 py-16">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>مميزات المنصة</h2>
          <p style={{ fontSize: '16px', color: 'var(--muted-foreground)' }}>كل ما تحتاجه لإدارة شركتك أو محطتك بكفاءة عالية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative z-10 px-6 lg:px-16 py-16">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>أنواع الحسابات</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Shield, label: 'مدير النظام', desc: 'تحكم كامل في المنصة', color: '#d4af37', features: ['إدارة الحسابات', 'الموافقة على التسجيل', 'التقارير الشاملة'] },
            { icon: Building2, label: 'شركة النقل', desc: 'طلب الوقود وإدارة المركبات', color: '#22c55e', features: ['طلب الوقود', 'متابعة السائقين', 'كشف الحساب'] },
            { icon: Fuel, label: 'محطة الوقود', desc: 'استقبال وتأكيد طلبات الوقود', color: '#f59e0b', features: ['مسح QR Code', 'تأكيد الطلبات', 'التقارير'] },
            { icon: Users, label: 'موظف المحطة', desc: 'تنفيذ عمليات الوقود', color: '#8b5cf6', features: ['مسح الطلبات', 'تأكيد التوصيل', 'الإحصائيات'] },
          ].map((role, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${role.color}22`, border: `1px solid ${role.color}44` }}>
                <role.icon size={28} color={role.color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', marginBottom: '6px' }}>{role.label}</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>{role.desc}</p>
              <div className="space-y-2">
                {role.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <CheckCircle size={12} color={role.color} />
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SaaS Overview Section */}
      <section className="relative z-10 px-6 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <Cloud size={14} color="#d4af37" />
              <span style={{ fontSize: '13px', color: '#f0d060', fontWeight: 600 }}>نظام سحابي متكامل (SaaS)</span>
            </motion.div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--foreground)', marginBottom: '20px' }}>
              منصة SaaS متكاملة لإدارة الوقود والنقل
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--muted-foreground)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
              منصة الوقود هي نظام Software as a Service (SaaS) يعمل بالكامل عبر السحابة، مما يعني أنه لا حاجة لأي تثبيت محلي، ويمكن الوصول إليه من أي مكان وفي أي وقت مع تحديثات مستمرة وأمان عالي المستوى.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Workflow */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <RefreshCw size={24} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#e8eaf6' }}>كيف تعمل المنصة؟</h3>
              </div>
              <div className="space-y-4">
                {[
                  { text: 'إنشاء حساب (شركة نقل / محطة وقود / موظف)', icon: Users },
                  { text: 'تحديد نوع الحساب والصلاحيات تلقائياً', icon: ShieldCheck },
                  { text: 'ربط الشركات بالمحطات داخل النظام', icon: Database },
                  { text: 'إرسال طلبات الوقود إلكترونياً', icon: Smartphone },
                  { text: 'تأكيد الطلبات عبر QR Code', icon: QrCode },
                  { text: 'تحديث البيانات والتقارير بشكل لحظي (Real-Time)', icon: BarChart3 },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--glass-hover)', border: '1px solid var(--border)' }}>
                      <step.icon size={12} color="var(--primary)" />
                    </div>
                    <div className="flex flex-col">
                      <span style={{ fontSize: '15px', color: 'var(--foreground)', fontWeight: 500 }}>{step.text}</span>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>الخطوة {i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Lock size={24} color="#22c55e" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#e8eaf6' }}>نظام الحماية والأمان</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'JWT Authentication', desc: 'تأمين كامل لعمليات تسجيل الدخول' },
                  { title: 'Row Level Security (RLS)', desc: 'عزل تام لبيانات كل شركة عن الأخرى' },
                  { title: 'صلاحيات متعددة', desc: 'Admin / Company / Station / Employee' },
                  { title: 'تشفير البيانات', desc: 'حماية كاملة أثناء النقل (HTTPS / SSL)' },
                  { title: 'حماية QR Code', desc: 'منع التلاعب في الطلبات والتحقق المشفر' },
                  { title: 'سجل العمليات (Audit Logs)', desc: 'تسجيل دقيق لجميع الأنشطة في النظام' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CheckCircle2 size={18} color="#22c55e" className="mt-1" />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tenants & Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="glass-card p-8 flex gap-6"
            >
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Layers size={32} color="#8b5cf6" />
              </div>
              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>نظام SaaS متعدد العملاء</h4>
                <p style={{ fontSize: '15px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  النظام مصمم Multi-Tenant SaaS، حيث يتم فصل بيانات كل شركة ومحطة بشكل كامل داخل قاعدة البيانات، مع ضمان عدم وصول أي طرف لبيانات الطرف الآخر إلا عبر الصلاحيات المحددة فقط.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 flex gap-6"
            >
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Zap size={32} color="#ef4444" />
              </div>
              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>التحديثات المستمرة</h4>
                <p style={{ fontSize: '15px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  جميع التحديثات تتم بشكل مباشر بدون توقف النظام (Zero Downtime Deployment)، مع تحسينات مستمرة للأداء وإضافة ميزات جديدة تلقائياً لجميع العملاء.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 lg:px-16 py-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <Zap size={14} color="#2563eb" />
            <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>خطط اشتراك مرنة</span>
          </motion.div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>اختر الباقة المناسبة لنجاحك</h2>
          <p style={{ fontSize: '16px', color: 'var(--muted-foreground)' }}>حلول متكاملة تناسب جميع أحجام الشركات والمحطات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col relative overflow-hidden"
              style={{
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border)',
                transform: plan.popular ? 'scale(1.05)' : 'none',
                zIndex: plan.popular ? 2 : 1
              }}
            >
              {plan.popular && (
                <div className="absolute top-4 left-[-35px] rotate-[-45deg] bg-blue-600 px-10 py-1" style={{ fontSize: '10px', fontWeight: 900, color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  الأكثر مبيعاً
                </div>
              )}
              
              <div className="mb-8">
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{plan.desc}</p>
              </div>
 
              <div className="mb-8 flex items-baseline gap-1">
                <span style={{ fontSize: '36px', fontWeight: 900, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>ريال / شهرياً</span>
              </div>
 
              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <CheckCircle2 size={18} color={plan.color} />
                    <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>{f}</span>
                  </div>
                ))}
              </div>
 
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.setItem("selected_plan", JSON.stringify(plan));
                  navigate('/register');
                }}
                className="w-full py-4 rounded-2xl transition-all"
                style={{
                  background: plan.popular ? `linear-gradient(135deg, ${plan.color}, #1d4ed8)` : 'var(--glass-hover)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  border: plan.popular ? 'none' : `1px solid ${plan.color}44`,
                  boxShadow: plan.popular ? `0 8px 25px ${plan.color}44` : 'none',
                  cursor: 'pointer'
                }}
              >
                اختيار هذه الباقة
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto glass-card p-12"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(212,175,55,0.1))' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 30px rgba(37,99,235,0.5)' }}>
            <Zap size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>
            ابدأ رحلتك مع منصة الوقود
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted-foreground)', marginBottom: '32px', lineHeight: 1.8 }}>
            سجّل حسابك الآن وابدأ بإدارة شركتك أو محطتك بطريقة احترافية وذكية
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 30px rgba(37,99,235,0.5)', cursor: 'pointer' }}>
              سجّل شركة نقل
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b14', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
              سجّل محطة وقود
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}>
            <Zap size={12} color="white" />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '14px' }}>منصة الوقود الذكية</span>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>© 2025 FuelPro System. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
