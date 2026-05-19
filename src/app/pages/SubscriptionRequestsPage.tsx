import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Fuel, User, Phone, Mail, MapPin, 
  CheckCircle, XCircle, Clock, Eye, Trash2, 
  Search, Filter, ChevronDown, Check, X,
  Loader2, Zap, CreditCard, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionRequests, approveSubscriptionRequest, updateSubscriptionRequest } from '../../services/api';
import { useApp } from '../context/AppContext';

export default function SubscriptionRequestsPage() {
  const { addNotification } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionRequests();
      setRequests(data);
    } catch (error: any) {
      toast.error('خطأ في تحميل الطلبات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: any) => {
    if (!window.confirm('هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم إنشاء حساب الشركة/المحطة وإرسال بريد إلكتروني للمسؤول.')) return;
    
    setProcessingId(request.id);
    try {
      await approveSubscriptionRequest(request);
      toast.success('تمت الموافقة وتفعيل الحساب بنجاح');
      addNotification({
        title: 'تم تفعيل حساب جديد',
        message: `تمت الموافقة على طلب ${request.company_name || request.station_name} بنجاح.`,
        type: 'success'
      });
      fetchRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error('خطأ في الموافقة: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    
    setProcessingId(id);
    try {
      await updateSubscriptionRequest(id, { status: 'rejected' });
      toast.error('تم رفض الطلب');
      fetchRequests();
    } catch (error: any) {
      toast.error('خطأ في الرفض: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = (r.company_name || r.station_name || '').includes(search) || r.manager_name.includes(search) || r.email.includes(search);
    const matchType = filterType === 'all' || r.request_type === filterType;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const statusMap = {
    pending: { label: 'بانتظار المراجعة', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    approved: { label: 'تمت الموافقة', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    rejected: { label: 'مرفوض', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '24px', color: 'var(--foreground)', marginBottom: '4px' }}>طلبات الانضمام</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>إدارة ومراجعة طلبات الشركات والمحطات الجديدة</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Clock size={16} color="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
              {requests.filter(r => r.status === 'pending').length} طلب معلق
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1" style={{ minWidth: '240px' }}>
          <Search size={18} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم المنشأة أو المسؤول أو البريد..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '14px' }}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'company', 'station'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: filterType === t ? 'var(--primary-glass)' : 'var(--muted)',
                border: filterType === t ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                color: filterType === t ? 'var(--primary)' : 'var(--muted-foreground)',
              }}>
              {t === 'all' ? 'الكل' : t === 'company' ? 'شركات' : 'محطات'}
            </button>
          ))}
          <div className="w-px h-6 mx-2" style={{ background: 'var(--border)' }} />
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: filterStatus === s ? 'var(--primary-glass)' : 'var(--muted)',
                border: filterStatus === s ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                color: filterStatus === s ? 'var(--primary)' : 'var(--muted-foreground)',
              }}>
              {s === 'all' ? 'كل الحالات' : (statusMap as any)[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={40} color="var(--primary)" className="animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--muted-foreground)' }}>جاري تحميل الطلبات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: req.request_type === 'company' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: '1px solid var(--border)' }}>
                      {req.request_type === 'company' ? <Building2 color="#22c55e" /> : <Fuel color="#f59e0b" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>{req.company_name || req.station_name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full" 
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          {req.request_type === 'company' ? 'شركة نقل' : 'محطة وقود'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" 
                          style={{ background: (statusMap as any)[req.status].bg, color: (statusMap as any)[req.status].color, opacity: 0.9 }}>
                          {(statusMap as any)[req.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRequest(req)} className="p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                    <Eye size={18} color="#8892b0" />
                  </button>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                    <User size={14} color="var(--muted-foreground)" />
                    <span>{req.manager_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                    <Phone size={14} color="var(--muted-foreground)" />
                    <span>{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                    <MapPin size={14} color="var(--muted-foreground)" />
                    <span>{req.city} {req.address ? `- ${req.address}` : ''}</span>
                  </div>
                  <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--muted)' }}>
                    <div className="flex items-center gap-2">
                      <Zap size={14} color="var(--primary)" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>الباقة المختارة:</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{req.selected_plan}</span>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={!!processingId}
                      className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      موافقة
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={!!processingId}
                      className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      رفض
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20 glass-card">
          <Clock size={48} className="mx-auto mb-4 opacity-5" color="var(--foreground)" />
          <h3 style={{ color: 'var(--foreground)', fontSize: '18px', fontWeight: 700 }}>لا توجد طلبات</h3>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>لم يتم العثور على أي طلبات تطابق المعايير الحالية</p>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', zIndex: 100, backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl glass-card overflow-hidden"
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: selectedRequest.request_type === 'company' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: '1px solid var(--border)' }}>
                    {selectedRequest.request_type === 'company' ? <Building2 color="#22c55e" /> : <Fuel color="#f59e0b" />}
                  </div>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: '18px', color: 'var(--foreground)' }}>تفاصيل طلب الانضمام</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>تم التقديم في: {new Date(selectedRequest.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-xl hover:bg-muted transition-all font-bold">
                  <X size={20} color="var(--muted-foreground)" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-blue-500 uppercase tracking-wider">معلومات المنشأة</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">اسم المنشأة</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.company_name || selectedRequest.station_name}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">نوع النشاط</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.request_type === 'company' ? 'شركة نقل' : 'محطة وقود'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">المدينة والعنوان</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.city} {selectedRequest.address ? `- ${selectedRequest.address}` : ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-blue-500 uppercase tracking-wider">معلومات التواصل</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">اسم المسؤول</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.manager_name}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">رقم الجوال</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.phone}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground opacity-60 mb-1">البريد الإلكتروني</div>
                        <div className="font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="p-5 rounded-2xl" style={{ background: 'var(--primary-glass)', border: '1px solid var(--primary-border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                       بيانات إضافية
                    </h3>
                    <span className="text-xs px-3 py-1 rounded-full font-bold border" style={{ background: 'var(--primary-glass)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}>
                      باقة {selectedRequest.selected_plan}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedRequest.request_type === 'company' ? (
                      <>
                        <div className="text-center p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                          <div className="text-[10px] text-muted-foreground opacity-60 mb-1">المركبات</div>
                          <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.expected_vehicle_count}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                          <div className="text-[10px] text-muted-foreground opacity-60 mb-1">السائقين</div>
                          <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.expected_driver_count}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                          <div className="text-[10px] text-muted-foreground opacity-60 mb-1">الحالة</div>
                          <div className="text-sm font-bold" style={{ color: (statusMap as any)[selectedRequest.status].color }}>
                            {(statusMap as any)[selectedRequest.status].label}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                          <div className="text-[10px] text-muted-foreground opacity-60 mb-1">المضخات</div>
                          <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{selectedRequest.number_of_pumps}</div>
                        </div>
                        <div className="text-center p-3 rounded-xl" style={{ gridColumn: 'span 2', background: 'var(--muted)' }}>
                          <div className="text-[10px] text-muted-foreground opacity-60 mb-1">أنواع الوقود</div>
                          <div className="flex justify-center gap-2 mt-1">
                            {selectedRequest.fuel_types?.map((f: string) => (
                              <span key={f} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--glass-bg)', color: 'var(--muted-foreground)' }}>
                                {f === 'diesel' ? 'ديزل' : f.replace('petrol_', 'بنزين ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="p-6 border-t border-border flex gap-4" style={{ background: 'var(--muted)' }}>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={!!processingId}
                    className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                  >
                    {processingId === selectedRequest.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    اعتماد الطلب وتفعيل الحساب
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={!!processingId}
                    className="px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-red-500/10"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    رفض الطلب
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
