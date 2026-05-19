import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Search, CheckCircle, DollarSign, Clock, Truck, Fuel, Building2, Hash, Loader2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp, FuelOrder } from '../context/AppContext';
import { toast } from 'sonner';
import { parseError, getOrderByQRCode, addTransaction } from '../../services/api';
export default function QRScannerPage() {
  const { orders, setOrders, addNotification, refreshData } = useApp();
  const [orderNumber, setOrderNumber] = useState('');
  const [foundOrder, setFoundOrder] = useState<FuelOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paymentType, setPaymentType] = useState<'نقدي' | 'مؤجل' | 'موافق' | null>(null);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setNotFound(false);
    setFoundOrder(null);

    try {
      const orderData = await getOrderByQRCode(orderNumber.trim());
      if (orderData) {
        setFoundOrder({
          id: orderData.id,
          orderNumber: orderData.qr_code,
          companyId: orderData.company_id,
          companyName: orderData.companies?.company_name || 'غير معروف',
          stationId: orderData.station_id || '',
          stationName: orderData.fuel_stations?.station_name || '-',
          driverName: orderData.drivers?.full_name || '-',
          vehicleNumber: orderData.vehicles?.plate_number || '-',
          fuelType: orderData.vehicles?.fuel_type === 'diesel' ? 'ديزل' : 'بترول',
          liters: orderData.liters_requested,
          pricePerLiter: 0.85, 
          total: orderData.liters_requested * 0.85,
          status: orderData.order_status as any,
          qrCode: orderData.qr_code,
          createdAt: orderData.created_at,
          _driverId: orderData.driver_id,
          _vehicleId: orderData.vehicle_id
        } as any);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!foundOrder || !paymentType) {
      toast.error('يرجى اختيار نوع الدفع');
      return;
    }
    setConfirming(true);

    const transactionCode = `TRX-${Date.now()}`;
    try {
      await addTransaction({
        transaction_code: transactionCode,
        company_id: foundOrder.companyId,
        station_id: foundOrder.stationId,
        vehicle_id: (foundOrder as any)._vehicleId,
        driver_id: (foundOrder as any)._driverId,
        order_id: foundOrder.id,
        liters: foundOrder.liters,
        price_per_liter: foundOrder.pricePerLiter || 0.85,
        total_amount: foundOrder.total,
        notes: paymentType,
        transaction_date: new Date().toISOString()
      });

      toast.success(`تم تأكيد الطلب بنجاح! طُبقت الخصومات تلقائياً.`);
      addNotification({ title: 'عملية تعبئة مكتملة', message: `تم تأكيد ${foundOrder.orderNumber}`, type: 'success' });
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error('فشل في التأكيد: ' + e.message);
    }

    setConfirming(false);
    setFoundOrder(null);
    setOrderNumber('');
    setPaymentType(null);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'معلق - يمكن تأكيده', color: '#f59e0b', canConfirm: true };
      case 'confirmed': return { label: 'مؤكد مسبقاً', color: '#22c55e', canConfirm: false };
      case 'paid': return { label: 'مسدد', color: '#2563eb', canConfirm: false };
      case 'deferred': return { label: 'مؤجل', color: '#f59e0b', canConfirm: false };
      case 'cancelled': return { label: 'ملغي', color: '#ef4444', canConfirm: false };
      default: return { label: status, color: '#8892b0', canConfirm: false };
    }
  };

  const recentOrders = orders.filter((o: any) => o.status === 'pending').slice(0, 5);

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#e8eaf6', marginBottom: '4px' }}>مسح QR Code</h1>
        <p style={{ color: '#8892b0', fontSize: '13px' }}>امسح الكود أو أدخل رقم الطلب للتحقق منه</p>
      </motion.div>

      {/* Scanner Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 text-center"
      >
        {/* QR Icon Animation */}
        <div className="relative mx-auto mb-6" style={{ width: '160px', height: '160px' }}>
          <div className="absolute inset-0 rounded-2xl"
            style={{
              background: 'rgba(37,99,235,0.1)',
              border: '2px solid rgba(37,99,235,0.3)',
              animation: 'pulse 2s infinite',
            }} />
          <div className="absolute inset-4 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(37,99,235,0.08)' }}>
            <QrCode size={64} color="#2563eb" style={{ opacity: 0.8 }} />
          </div>
          {/* Corner markers */}
          {['top-0 right-0', 'top-0 left-0', 'bottom-0 right-0', 'bottom-0 left-0'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-6 h-6`}
              style={{
                borderTop: i < 2 ? '3px solid #2563eb' : 'none',
                borderBottom: i >= 2 ? '3px solid #2563eb' : 'none',
                borderRight: (i === 0 || i === 2) ? '3px solid #2563eb' : 'none',
                borderLeft: (i === 1 || i === 3) ? '3px solid #2563eb' : 'none',
              }} />
          ))}
        </div>

        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
          اسحب الكاميرا فوق QR Code أو أدخل رقم الطلب يدوياً
        </p>

        {/* Manual Input */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Hash size={16} color="#4b5563" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="أدخل رقم الطلب (مثال: ORD-2025-001)"
              className="w-full py-3 pr-10 pl-4 rounded-xl outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8eaf6', fontSize: '13px' }}
            />
          </div>
          <button onClick={handleSearch} disabled={loading}
            className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            بحث
          </button>
        </div>
      </motion.div>

      {/* Not Found */}
      <AnimatePresence>
        {notFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 text-center"
            style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
          >
            <X size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#ef4444', fontSize: '15px', fontWeight: 700 }}>الطلب غير موجود</p>
            <p style={{ color: '#8892b0', fontSize: '13px', marginTop: '4px' }}>
              تأكد من رقم الطلب وأعد المحاولة
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Found Order */}
      <AnimatePresence>
        {foundOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
            style={{ border: '1px solid rgba(34,197,94,0.2)' }}
          >
            {/* Order Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#d4af37' }}>{foundOrder.orderNumber}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: getStatusDisplay(foundOrder.status).color }} />
                  <span style={{ fontSize: '13px', color: getStatusDisplay(foundOrder.status).color, fontWeight: 600 }}>
                    {getStatusDisplay(foundOrder.status).label}
                  </span>
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG value={foundOrder.orderNumber} size={70} />
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon: Building2, label: 'الشركة', value: foundOrder.companyName, color: '#22c55e' },
                { icon: Truck, label: 'السائق', value: foundOrder.driverName, color: '#3b82f6' },
                { icon: Hash, label: 'المركبة', value: foundOrder.vehicleNumber, color: '#8b5cf6' },
                { icon: Fuel, label: 'نوع الوقود', value: foundOrder.fuelType, color: '#f59e0b' },
                { icon: CheckCircle, label: 'الكمية', value: `${foundOrder.liters} لتر`, color: '#22c55e' },
                { icon: DollarSign, label: 'المبلغ الإجمالي', value: `${foundOrder.total.toFixed(2)} ريال`, color: '#d4af37' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl flex items-start gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}22` }}>
                    <item.icon size={14} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8eaf6' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirmation Section */}
            {getStatusDisplay(foundOrder.status).canConfirm && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '12px' }}>
                  اختر نوع الدفع:
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(['موافق', 'نقدي', 'مؤجل'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setPaymentType(type)}
                      className="py-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: paymentType === type ?
                          (type === 'موافق' ? 'rgba(34,197,94,0.2)' : type === 'نقدي' ? 'rgba(37,99,235,0.2)' : 'rgba(245,158,11,0.2)') : 'rgba(255,255,255,0.04)',
                        border: paymentType === type ?
                          (type === 'موافق' ? '2px solid rgba(34,197,94,0.5)' : type === 'نقدي' ? '2px solid rgba(37,99,235,0.5)' : '2px solid rgba(245,158,11,0.5)') : '1px solid rgba(255,255,255,0.1)',
                        color: paymentType === type ?
                          (type === 'موافق' ? '#22c55e' : type === 'نقدي' ? '#2563eb' : '#f59e0b') : '#6b7280',
                        cursor: 'pointer',
                      }}>
                      {type === 'موافق' ? '✅ موافق' : type === 'نقدي' ? '💵 نقدي' : '⏳ مؤجل'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!paymentType || confirming}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: paymentType ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)',
                    color: paymentType ? 'white' : '#6b7280',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: paymentType ? 'pointer' : 'not-allowed',
                    boxShadow: paymentType ? '0 4px 20px rgba(34,197,94,0.4)' : 'none',
                  }}>
                  {confirming ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  {confirming ? 'جاري التأكيد...' : 'تأكيد العملية'}
                </button>
              </div>
            )}

            {!getStatusDisplay(foundOrder.status).canConfirm && (
              <div className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle size={24} color="#22c55e" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '14px' }}>
                  هذا الطلب {getStatusDisplay(foundOrder.status).label}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Orders Quick Access */}
      {recentOrders.length > 0 && !foundOrder && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#e8eaf6', marginBottom: '16px' }}>
            طلبات معلقة - اضغط للتحقق
          </h3>
          <div className="space-y-2">
            {recentOrders.map(order => (
              <button
                key={order.id}
                onClick={() => {
                  setOrderNumber(order.orderNumber);
                  setFoundOrder(order);
                  setNotFound(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 text-right"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>{order.orderNumber}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{order.companyName} · {order.driverName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#d4af37' }}>{order.total.toFixed(0)} ر</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b' }}>{order.fuelType} - {order.liters}ل</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
