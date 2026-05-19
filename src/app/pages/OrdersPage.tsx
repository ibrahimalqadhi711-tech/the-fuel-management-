import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Search, Filter, QrCode, CheckCircle, Clock, AlertTriangle, X, Loader2, Eye, DollarSign, Droplets, Building2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp, FuelOrder } from '../context/AppContext';
import { toast } from 'sonner';
import { parseError, getDriverByName, addDriver, getVehicleByPlate, addVehicle, addOrder } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'معلق', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  confirmed: { label: 'مؤكد', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', icon: CheckCircle },
  paid: { label: 'مسدد', color: '#2563eb', bg: 'rgba(37,99,235,0.15)', icon: CheckCircle },
  deferred: { label: 'مؤجل', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: AlertTriangle },
  cancelled: { label: 'ملغي', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: X },
};

const fuelTypes = ['بترول', 'ديزل', 'غاز'] as const;

export default function OrdersPage() {
  const { orders, setOrders, stations, companies, user, addNotification, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState<FuelOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    driverName: '',
    vehicleNumber: '',
    stationId: '',
    fuelType: 'ديزل' as typeof fuelTypes[number],
    liters: '',
    pricePerLiter: '0.85',
  });

  const activeStations = stations.filter(s => s.status === 'active');

  const getTotal = () => {
    const l = parseFloat(form.liters) || 0;
    const p = parseFloat(form.pricePerLiter) || 0;
    return (l * p).toFixed(2);
  };

  const getFilteredOrders = () => {
    return orders.filter(o => {
      const matchSearch = o.orderNumber.includes(search) || o.driverName.includes(search) ||
        o.vehicleNumber.includes(search) || o.companyName.includes(search);
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchFuel = filterFuel === 'all' || o.fuelType === filterFuel;
      const matchUser = user?.role === 'admin' ? true :
        user?.role === 'company' ? o.companyId === user.companyId :
          user?.role === 'station' ? o.stationId === user.stationId : true;
      return matchSearch && matchStatus && matchFuel && matchUser;
    });
  };

  const handleCreateOrder = async () => {
    if (!form.driverName || !form.vehicleNumber || !form.stationId || !form.liters) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);

    const orderNum = `ORD-2025-${String(orders.length + 1).padStart(3, '0')}`;
    const company = companies.find((c: any) => c.id === user?.companyId) || companies[0];
    const companyId = user?.companyId || company?.id;

    if (!companyId) {
      toast.error('لا يمكن تحديد الشركة المصدرة');
      setLoading(false);
      return;
    }

    try {
      // 1. Create or get driver
      let driverData = await getDriverByName(form.driverName, companyId);
      if (!driverData) {
        driverData = await addDriver({ company_id: companyId, full_name: form.driverName });
      }

      // 2. Create or get vehicle
      let vehicleData = await getVehicleByPlate(form.vehicleNumber);
      if (!vehicleData) {
        vehicleData = await addVehicle({
           company_id: companyId, 
           plate_number: form.vehicleNumber, 
           driver_id: driverData?.id,
           fuel_type: form.fuelType === 'ديزل' ? 'diesel' : 'petrol_91' 
        });
      }

      // 3. Insert order
      await addOrder({
        company_id: companyId,
        driver_id: driverData?.id,
        vehicle_id: vehicleData?.id,
        station_id: form.stationId,
        liters_requested: parseFloat(form.liters),
        qr_code: orderNum,
        order_status: 'pending'
      });

      setShowModal(false);
      setForm({ driverName: '', vehicleNumber: '', stationId: '', fuelType: 'ديزل', liters: '', pricePerLiter: '0.85' });
      toast.success(`تم إنشاء الطلب ${orderNum} بنجاح!`);
      addNotification({ title: 'طلب وقود جديد', message: `طلب ${orderNum} تم إنشاؤه`, type: 'info' });
      if (refreshData) refreshData();
    } catch (e: any) {
      toast.error('خطأ أثناء الإنشاء: ' + parseError(e));
    } finally {
      setLoading(false);
    }
  };

  const filtered = getFilteredOrders();
  const totalLiters = filtered.reduce((sum: number, o: any) => sum + o.liters, 0);
  const totalAmount = filtered.reduce((sum: number, o: any) => sum + o.total, 0);

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '4px' }}>طلبات الوقود</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>إنشاء ومتابعة جميع طلبات الوقود</p>
        </div>
        {(user?.role === 'company' || user?.role === 'admin') && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
            <Plus size={16} />
            طلب جديد
          </button>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: filtered.length, color: '#2563eb', icon: ShoppingCart },
          { label: 'معلق', value: filtered.filter(o => o.status === 'pending').length, color: '#f59e0b', icon: Clock },
          { label: 'إجمالي اللترات', value: `${totalLiters.toLocaleString('ar-SA')} ل`, color: '#22c55e', icon: Droplets },
          { label: 'إجمالي المبلغ', value: `${totalAmount.toFixed(0)} ر`, color: '#d4af37', icon: DollarSign },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative" style={{ minWidth: '200px', flex: 1 }}>
          <Search size={16} color="var(--muted-foreground)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب، السائق، المركبة..."
            className="w-full py-2.5 pr-10 pl-4 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="py-2.5 px-3 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '12px' }}>
            <option value="all" style={{ background: 'var(--popover)' }}>كل الحالات</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k} style={{ background: 'var(--popover)' }}>{v.label}</option>
            ))}
          </select>
          <select value={filterFuel} onChange={e => setFilterFuel(e.target.value)}
            className="py-2.5 px-3 rounded-xl outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '12px' }}>
            <option value="all" style={{ background: 'var(--popover)' }}>كل الأنواع</option>
            {fuelTypes.map(ft => <option key={ft} value={ft} style={{ background: 'var(--popover)' }}>{ft}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full pro-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                {['رقم الطلب', 'الشركة / السائق', 'المحطة', 'الوقود', 'الكمية', 'المبلغ', 'الحالة', 'الدفع', 'التاريخ', 'QR'].map(h => (
                  <th key={h} style={{ textAlign: 'right', fontSize: '12px', color: 'var(--primary)', padding: '12px 14px', background: 'var(--secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const sc = statusConfig[order.status];
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-glass-hover transition-colors"
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Building2 size={12} color="var(--primary)" />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>{order.companyName || 'غير معروف'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{order.driverName} · {order.vehicleNumber}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--foreground)' }}>{order.stationName}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: order.fuelType === 'ديزل' ? 'rgba(37,99,235,0.15)' : order.fuelType === 'بترول' ? 'rgba(34,197,94,0.15)' : 'rgba(212,175,55,0.15)',
                          color: order.fuelType === 'ديزل' ? '#2563eb' : order.fuelType === 'بترول' ? '#22c55e' : '#d4af37',
                        }}>
                        {order.fuelType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{order.liters} ل</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--gold)', fontWeight: 700 }}>{order.total.toFixed(2)} ر</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44` }}>
                        <sc.icon size={10} />
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {order.paymentType ? (
                        <span style={{ fontSize: '12px', color: order.paymentType === 'نقدي' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                          {order.paymentType}
                        </span>
                      ) : <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>-</span>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => setShowQR(order)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                        <QrCode size={14} color="#d4af37" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              <ShoppingCart size={40} color="var(--border)" style={{ margin: '0 auto 12px' }} />
              <p>لا توجد طلبات</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--foreground)' }}>إنشاء طلب وقود جديد</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-glass-hover">
                  <X size={18} color="var(--muted-foreground)" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'driverName', label: 'اسم السائق', placeholder: 'الاسم الكامل' },
                    { key: 'vehicleNumber', label: 'رقم المركبة', placeholder: 'أ ب ج 1234' },
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
                </div>

                {/* Station */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>المحطة</label>
                  <select value={form.stationId} onChange={e => setForm(p => ({ ...p, stationId: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl outline-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: form.stationId ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: '13px' }}>
                    <option value="" disabled style={{ background: 'var(--popover)' }}>اختر المحطة</option>
                    {activeStations.map((s: any) => <option key={s.id} value={s.id} style={{ background: 'var(--popover)' }}>{s.name} - {s.city}</option>)}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '6px' }}>نوع الوقود</label>
                  <div className="flex gap-3">
                    {fuelTypes.map(ft => (
                      <button key={ft} onClick={() => setForm(p => ({ ...p, fuelType: ft }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: form.fuelType === ft ?
                            (ft === 'ديزل' ? 'var(--secondary)' : ft === 'بترول' ? 'var(--secondary)' : 'var(--secondary)') : 'var(--muted)',
                          border: form.fuelType === ft ?
                            (ft === 'ديزل' ? '1px solid var(--primary)' : ft === 'بترول' ? '1px solid var(--success)' : '1px solid var(--gold)') : '1px solid var(--border)',
                          color: form.fuelType === ft ?
                            (ft === 'ديزل' ? 'var(--primary)' : ft === 'بترول' ? 'var(--success)' : 'var(--gold)') : 'var(--muted-foreground)',
                          cursor: 'pointer',
                        }}>
                        {ft}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'liters', label: 'عدد اللترات', placeholder: '200' },
                    { key: 'pricePerLiter', label: 'سعر اللتر (ريال)', placeholder: '0.85' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>{f.label}</label>
                      <input
                        type="number"
                        value={(form as any)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full py-2.5 px-4 rounded-xl outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf6', fontSize: '13px' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-4 rounded-xl flex items-center justify-between"
                  style={{ background: 'var(--accent)', border: '1px solid var(--gold)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted-foreground)', fontWeight: 600 }}>الإجمالي:</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gold)' }}>{getTotal()} ريال</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleCreateOrder} disabled={loading}
                    className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-xl"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', zIndex: 100, backdropFilter: 'blur(8px)' }}
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-8 text-center"
              style={{ maxWidth: '380px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--foreground)' }}>QR Code الطلب</h2>
                <button onClick={() => setShowQR(null)} className="p-2 rounded-xl hover:bg-glass-hover">
                  <X size={18} color="var(--muted-foreground)" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-6 inline-block">
                <QRCodeSVG value={showQR.orderNumber} size={200} />
              </div>

              <div className="space-y-2 text-right">
                <div style={{ fontWeight: 800, fontSize: '20px', color: '#d4af37' }}>{showQR.orderNumber}</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'الشركة', value: showQR.companyName },
                    { label: 'السائق', value: showQR.driverName },
                    { label: 'المركبة', value: showQR.vehicleNumber },
                    { label: 'المحطة', value: showQR.stationName },
                    { label: 'الوقود', value: `${showQR.fuelType} - ${showQR.liters} لتر` },
                    { label: 'المبلغ', value: `${showQR.total.toFixed(2)} ريال` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b"
                      style={{ borderColor: 'var(--border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => window.print()}
                className="mt-5 w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b14', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                <QrCode size={16} />
                طباعة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
