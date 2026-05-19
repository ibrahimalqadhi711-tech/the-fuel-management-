import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Eye, EyeOff, Phone, Lock, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { RateLimitButton } from '../components/RateLimitButton';

// ---------------------------------------------------------
// 🔑 إعدادات الحسابات التجريبية - يمكنك تغيير الإيميلات وكلمات المرور من هنا
// ---------------------------------------------------------
const LOGIN_CONFIG = {
  defaultPassword: 'password123', // كلمة المرور الافتراضية للحسابات التجريبية
  accounts: [
    { label: 'مدير النظام', email: 'admin@system.sa', role: 'super_admin', color: '#d4af37' },
    { label: 'شركة نقل', email: 'golden@transport.sa', role: 'company_admin', color: '#22c55e' },
    { label: 'محطة وقود', email: 'central@petrol.sa', role: 'station_manager', color: '#f59e0b' },
    { label: 'موظف محطة', email: 'emp@station.sa', role: 'station_employee', color: '#8b5cf6' },
  ]
};
// ---------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const result = await login({ identifier, password });

    if (result.success) {
      toast.success('مرحباً بك! تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } else {
      setError(result.error || 'حدث خطأ');
    }
  };

  const quickLogin = (email: string) => {
    setIdentifier(email);
    setPassword(LOGIN_CONFIG.defaultPassword);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', direction: 'rtl', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 40%, var(--primary) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, var(--accent) 0%, transparent 50%)',
        opacity: 0.1,
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.1,
      }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}>
            <Zap size={32} color="white" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: 'var(--foreground)', marginBottom: '4px' }}>تسجيل الدخول</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>منصة الوقود الذكية</p>
        </motion.div>

        {/* Quick Demo Logins (Hidden for production)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 p-4 rounded-2xl"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}
        >
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
            🎯 حسابات تجريبية للعرض - اضغط للدخول السريع
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LOGIN_CONFIG.accounts.map((acc, i) => (
              <button
                key={i}
                onClick={() => quickLogin(acc.email)}
                className="px-3 py-2 rounded-xl text-right transition-all hover:scale-105"
                style={{
                  background: `${acc.color}15`,
                  border: `1px solid ${acc.color}33`,
                  color: acc.color,
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </motion.div>
        */}

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <AlertCircle size={18} color="#ef4444" />
                <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
              </motion.div>
            )}

            {/* Identifier */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                رقم الجوال أو البريد الإلكتروني
              </label>
              <div className="relative">
                <Phone size={18} color="var(--muted-foreground)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="example@email.com أو 7xxxxxxxx"
                  required
                  className="w-full py-3 pr-12 pl-4 rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                  }}
                  onFocus={e => e.currentTarget.style.border = '1px solid var(--primary)'}
                  onBlur={e => e.currentTarget.style.border = '1px solid var(--border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={18} color="var(--muted-foreground)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full py-3 pr-12 pl-12 rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                  }}
                  onFocus={e => e.currentTarget.style.border = '1px solid var(--primary)'}
                  onBlur={e => e.currentTarget.style.border = '1px solid var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={18} color="var(--muted-foreground)" /> : <Eye size={18} color="var(--muted-foreground)" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <RateLimitButton
              onClick={() => handleSubmit()}
              label="تسجيل الدخول"
              loadingLabel="جاري تسجيل الدخول..."
              cooldownSeconds={30}
              className="w-full py-6 rounded-xl mt-2"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                border: 'none',
              }}
            />

            {/* Register Link */}
            <div className="text-center pt-2">
              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>ليس لديك حساب؟ </span>
              <Link to="/register" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                سجّل الآن
              </Link>
            </div>

            <div className="text-center">
              <Link to="/" className="flex items-center justify-center gap-1"
                style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                <ChevronLeft size={14} />
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
