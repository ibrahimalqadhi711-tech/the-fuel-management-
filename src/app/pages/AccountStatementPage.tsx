import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Calendar, Download, Printer, CheckCircle, 
  Clock, AlertTriangle, Filter, ChevronDown, Wallet, TrendingUp, 
  ArrowDownCircle, ArrowUpCircle, Building2, Truck, Users, Layout
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FinancialTable } from '../components/reports/FinancialTable';

type StatementType = 'company' | 'vehicle' | 'driver' | 'station' | 'all';

export default function AccountStatementPage() {
  const { ledgerEntries, companies, stations, allVehicles, allDrivers, user } = useApp();
  
  // States
  const [statementType, setStatementType] = useState<StatementType>('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtering & Calculations ---
  const filteredData = useMemo(() => {
    // 1. Initial Filtering by role and selection
    let filtered = ledgerEntries.filter(l => {
      // Role-based access
      if (user?.role === 'company' && l.company_id !== user.companyId) return false;
      if (user?.role === 'station' && l.transaction_details?.station_name !== stations.find(s => s.id === user.stationId)?.name) {
        // This is tricky as ledger is per company, station context might be different
        // For now, stations see what they are involved in if joined
      }

      // Entity Filtering
      if (statementType === 'company' && selectedEntity !== 'all' && l.company_id !== selectedEntity) return false;
      if (statementType === 'vehicle' && selectedEntity !== 'all' && l.transaction_details?.vehicle_plate !== selectedEntity) return false;
      if (statementType === 'driver' && selectedEntity !== 'all' && l.transaction_details?.driver_name !== selectedEntity) return false;
      
      // Date Range
      if (dateFrom && new Date(l.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(l.created_at) > new Date(dateTo + 'T23:59:59')) return false;

      // Search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          l.description.toLowerCase().includes(searchLower) ||
          l.transaction_details?.vehicle_plate?.toLowerCase().includes(searchLower) ||
          l.transaction_details?.driver_name?.toLowerCase().includes(searchLower) ||
          l.id.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // 2. Sorting (Oldest first for running balance)
    return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [ledgerEntries, statementType, selectedEntity, dateFrom, dateTo, searchTerm, user, stations]);

  // --- Opening Balance Calculation ---
  const openingBalance = useMemo(() => {
    if (!dateFrom) return 0;
    const preEntries = ledgerEntries.filter(l => {
        if (user?.role === 'company' && l.company_id !== user.companyId) return false;
        if (statementType === 'company' && selectedEntity !== 'all' && l.company_id !== selectedEntity) return false;
        return new Date(l.created_at) < new Date(dateFrom);
    });
    return preEntries.reduce((sum, l) => sum + (l.credit || 0) - (l.debit || 0), 0);
  }, [ledgerEntries, dateFrom, statementType, selectedEntity, user]);

  const summary = useMemo(() => {
    const periodDebits = filteredData.reduce((s, l) => s + (l.debit || 0), 0);
    const periodCredits = filteredData.reduce((s, l) => s + (l.credit || 0), 0);
    const finalBalance = openingBalance + periodCredits - periodDebits;
    return { debit: periodDebits, credit: periodCredits, balance: finalBalance };
  }, [filteredData, openingBalance]);

  // --- Export Logic ---
  const handleExportCSV = () => {
    const headers = ["التاريخ", "البيان", "الرقم المرجعي", "مدين", "دائن", "الرصيد"];
    let currentBalance = openingBalance;
    const rows = filteredData.map(l => {
      currentBalance += (l.credit || 0) - (l.debit || 0);
      return [
        new Date(l.created_at).toLocaleDateString('ar-SA'),
        l.description,
        l.id,
        l.debit || 0,
        l.credit || 0,
        currentBalance
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `statement_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: 'excel' | 'pdf' | 'print') => {
    if (format === 'print') {
        window.print();
        return;
    }
    if (format === 'excel') {
        handleExportCSV();
        return;
    }
    // PDF placeholder
    console.log(`Exporting as ${format}...`);
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }} className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Wallet className="text-blue-500" />
            سجل الأستاذ وكشوفات العمليات
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>مركز المراجعة والتدقيق المالي الشامل</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('excel')} className="pro-btn bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600/20">
            <Download size={18} />
            Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="pro-btn bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600/20">
            <FileText size={18} />
            PDF
          </button>
          <button onClick={() => handleExport('print')} className="pro-btn bg-blue-600/10 text-blue-500 border-blue-600/20 hover:bg-blue-600/20">
            <Printer size={18} />
            طباعة الكشف
          </button>
        </div>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="الرصيد الافتتاحي" value={openingBalance} icon={Wallet} color="text-yellow-500" />
        <SummaryCard label="إجمالي السحبيات (مدين)" value={summary.debit} icon={ArrowDownCircle} color="text-red-500" />
        <SummaryCard label="إجمالي الإيداعات (دائن)" value={summary.credit} icon={ArrowUpCircle} color="text-green-500" />
        <SummaryCard label="الرصيد الختامي" value={summary.balance} icon={TrendingUp} color="text-blue-500" highlight />
      </div>

      {/* Advanced Filter Bar */}
      <div className="glass-card p-6 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          {/* Statement Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>نوع الكشف</label>
            <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <TypeToggle active={statementType === 'all'} onClick={() => {setStatementType('all'); setSelectedEntity('all');}} icon={Layout} label="عام" />
              <TypeToggle active={statementType === 'company'} onClick={() => {setStatementType('company'); setSelectedEntity('all');}} icon={Building2} label="شركات" />
              <TypeToggle active={statementType === 'vehicle'} onClick={() => {setStatementType('vehicle'); setSelectedEntity('all');}} icon={Truck} label="مركبات" />
              <TypeToggle active={statementType === 'driver'} onClick={() => {setStatementType('driver'); setSelectedEntity('all');}} icon={Users} label="سائقين" />
            </div>
          </div>

          {/* Dynamic Entity Selector */}
          {statementType !== 'all' && (
            <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>اختيار الحساب</label>
                <select 
                    value={selectedEntity} 
                    onChange={e => setSelectedEntity(e.target.value)}
                    className="pro-input"
                >
                    <option value="all">كل الحسابات</option>
                    {statementType === 'company' && companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {statementType === 'vehicle' && allVehicles.map(v => <option key={v.id} value={v.plate_number}>{v.plate_number}</option>)}
                    {statementType === 'driver' && allDrivers.map(d => <option key={d.id} value={d.full_name}>{d.full_name}</option>)}
                </select>
            </div>
          )}

          {/* Date Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>الفترة من</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="pro-input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>إلى</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="pro-input" />
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
            <label className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>البحث في السجلات</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={16} color="var(--muted-foreground)" />
              <input 
                type="text" 
                placeholder="ابحث برقم العملية، المركبة، أو الوصف..." 
                className="pro-input pr-10 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <FinancialTable 
        title={`كشف حساب: ${statementType === 'all' ? 'دفتـر الأستاذ العام' : statementType === 'company' ? 'كشف مديونية شركة' : 'سجل عمليات مفصل'}`}
        subtitle={`للفترة من ${dateFrom || 'البداية'} إلى ${dateTo || 'اليوم'}`}
        data={filteredData}
        openingBalance={openingBalance}
      />

      {/* Footer Branding for Print */}
      <div className="hidden print:block border-t border-gray-200 mt-10 pt-6 text-center">
        <p className="text-sm font-bold text-gray-800">صادر عن نظام Fuel ERP - المركز المالي الموحد</p>
        <div className="flex justify-between items-end mt-10 px-10">
            <div className="text-sm text-gray-600">توقيع المحاسب: ..........................</div>
            <div className="text-sm text-gray-600">ختم الشركة: ..........................</div>
            <div className="text-[10px] text-gray-400">تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SummaryCard({ label, value, icon: Icon, color, highlight = false }: any) {
  return (
    <div className={`glass-card p-5 relative overflow-hidden ${highlight ? 'ring-2 ring-blue-500/30' : ''}`}
      style={{ background: highlight ? 'var(--primary-glass)' : 'var(--glass-bg)' }}>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 opacity-10 ${color}`}>
        <Icon size={80} />
      </div>
      <div className="text-xs mb-2 font-bold" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
      <div className={`text-2xl font-black ${color}`}>
        {value.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-xs">ر.س</span>
      </div>
    </div>
  );
}

function TypeToggle({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all`}
      style={{
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--muted-foreground)',
        cursor: 'pointer'
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
