import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Zap, Plus, Edit, Trash2, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { getSubscriptionPlans } from '../../services/api';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '../../constants/plans';

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      toast.error('خطأ في تحميل الخطط: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedPlan) {
      toast.error("يجب اختيار باقة أولاً");
      return;
    }
    localStorage.setItem("selected_plan", JSON.stringify(selectedPlan));
    navigate("/register");
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: 'var(--foreground)', marginBottom: '4px' }}>باقات الاشتراك</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>اختر الباقة المناسبة لاحتياجاتك للبدء</p>
        </div>
        {selectedPlan && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <span>التالي: بيانات التسجيل</span>
            <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }} />
          </motion.button>
        )}
      </motion.div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={40} color="var(--primary)" className="animate-spin mx-auto mb-4" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPlan(plan)}
              className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer transition-all hover:shadow-xl"
              style={{ 
                border: selectedPlan?.id === plan.id || selectedPlan?.name === plan.name ? `2px solid ${plan.color}` : '1px solid var(--border)',
                background: (selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? `${plan.color}11` : 'var(--glass-bg)',
                transform: (selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? 'scale(1.02)' : 'none'
              }}
            >
              {plan.popular && (
                <div className="absolute top-4 left-[-35px] rotate-[-45deg] bg-blue-600 px-10 py-1" style={{ fontSize: '10px', fontWeight: 900, color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  الأكثر مبيعاً
                </div>
              )}

              {(selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) && (
                <div className="absolute top-4 right-4 text-green-500 bg-green-500/20 p-1 rounded-full">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: plan.color }} />
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" 
                style={{ background: `${plan.color}11`, border: `1px solid ${plan.color}33` }}>
                <Zap size={32} color={plan.color} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span style={{ fontSize: '32px', fontWeight: 900, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>ريال / شهر</span>
              </div>

              <div className="w-full space-y-4 mb-8 text-right">
                {plan.features?.map((f: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 size={16} color={plan.color} className="flex-shrink-0" />
                    <span style={{ fontSize: '13px', color: 'var(--foreground)', opacity: 0.8 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}
                className="w-full py-3.5 rounded-xl transition-all"
                style={{ 
                  background: (selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? `linear-gradient(135deg, ${plan.color}, #1d4ed8)` : 'var(--muted)',
                  color: (selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? 'white' : 'var(--foreground)',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: (selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? 'none' : `1px solid var(--border)`,
                  cursor: 'pointer'
                }}
              >
                {(selectedPlan?.id === plan.id || selectedPlan?.name === plan.name) ? 'تم الاختيار' : 'اختر الخطة'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
