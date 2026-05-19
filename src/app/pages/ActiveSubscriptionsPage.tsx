import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Building2, Fuel, Clock, CheckCircle, Search, Loader2, ArrowUpRight } from 'lucide-react';
import { getActiveCompanySubscriptions } from '../../services/api';
import { toast } from 'sonner';

export default function ActiveSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getActiveCompanySubscriptions();
      setSubscriptions(data);
    } catch (error: any) {
      toast.error('خطأ في تحميل الاشتراكات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subscriptions.filter(s => 
    (s.companies?.company_name || '').includes(search) || 
    (s.subscription_plans?.name || '').includes(search)
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: 'var(--foreground)', marginBottom: '4px' }}>الاشتراكات النشطة</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>متابعة حالة اشتراكات الشركات والمحطات</p>
        </div>
      </motion.div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم المنشأة أو الباقة..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '14px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={40} color="var(--primary)" className="animate-spin mx-auto mb-4" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse" style={{ minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="p-4 text-[12px] font-bold" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>المنشأة</th>
                  <th className="p-4 text-[12px] font-bold" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>الباقة</th>
                  <th className="p-4 text-[12px] font-bold" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>تاريخ البدء</th>
                  <th className="p-4 text-[12px] font-bold" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>الحالة</th>
                  <th className="p-4 text-[12px] font-bold" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-glass)' }}>
                          <Building2 size={16} color="var(--primary)" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{sub.companies?.company_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <span className="text-xs px-2 py-1 rounded font-bold whitespace-nowrap" style={{ background: 'var(--primary-glass)', color: 'var(--primary)' }}>
                          {sub.subscription_plans?.name}
                         </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(sub.start_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <CheckCircle size={14} color="#22c55e" />
                        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>نشط</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-20 text-center" style={{ color: 'var(--muted-foreground)' }}>
                <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
                <p>لا توجد اشتراكات نشطة حالياً</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
