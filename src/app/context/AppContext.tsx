import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../utils/supabase';
import { getCompanies, getStations, getOrders, getUsers, getNotifications, getTransactions, getDetailedLedger, getDrivers, getVehicles, parseError } from '../../services/api';

export type UserRole = 'super_admin' | 'company_admin' | 'station_manager' | 'station_employee' | 'driver' | 'admin' | 'company' | 'station' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  city?: string;
  status: 'active' | 'pending' | 'inactive' | 'expired';
  avatar?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  stationId?: string;
  companyId?: string;
}

export interface FuelOrder {
  id: string;
  orderNumber: string;
  companyId: string;
  companyName: string;
  stationId: string;
  stationName: string;
  driverName: string;
  vehicleNumber: string;
  fuelType: 'بترول' | 'ديزل' | 'غاز' | 'petrol_91' | 'petrol_95' | 'diesel';
  liters: number;
  pricePerLiter: number;
  total: number;
  status: 'pending' | 'confirmed' | 'paid' | 'deferred' | 'cancelled';
  paymentType?: 'نقدي' | 'مؤجل' | 'موافق';
  qrCode: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  company_id?: string;
  station_id?: string;
  request_type: 'company' | 'station';
  company_name: string;
  station_name: string;
  manager_name: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  expected_vehicle_count?: number;
  expected_driver_count?: number;
  number_of_pumps?: number;
  fuel_types?: string[];
  selected_plan: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  email: string;
  city: string;
  status: 'active' | 'pending' | 'inactive' | 'expired';
  logo?: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  totalOrders: number;
  totalDebt: number;
  createdAt: string;
}

export interface Station {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  status: 'active' | 'pending' | 'inactive';
  logo?: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  fuelTypes: string[];
  totalOrders: number;
  totalRevenue: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  stationId: string;
  stationName: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId?: string;
}

export interface FuelTransaction {
  id: string;
  transaction_code: string;
  company_id: string;
  company_name: string;
  station_id: string;
  station_name: string;
  vehicle_id: string;
  vehicle_plate: string;
  fuel_type: string;
  driver_id: string;
  driver_name: string;
  order_id?: string;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  transaction_date: string;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  company_id: string;
  company_name: string;
  debit: number;
  credit: number;
  balance_after: number;
  description: string;
  created_at: string;
  created_by?: string;
  created_by_name?: string;
  transaction_details?: {
    vehicle_plate?: string;
    driver_name?: string;
    station_name?: string;
    fuel_type?: string;
    liters?: number;
    price?: number;
  };
}

export interface Vehicle {
  id: string;
  company_id: string;
  company_name: string;
  plate_number: string;
  vehicle_type: string;
  fuel_type: string;
  monthly_limit: number;
  current_consumption: number;
  remaining_liters: number;
  status: string;
  created_at: string;
}

export interface Driver {
  id: string;
  company_id: string;
  company_name: string;
  full_name: string;
  phone: string;
  status: string;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  orders: FuelOrder[];
  setOrders: React.Dispatch<React.SetStateAction<FuelOrder[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  transactions: FuelTransaction[];
  ledgerEntries: LedgerEntry[];
  allVehicles: Vehicle[];
  allDrivers: Driver[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  registerAccount: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: any = {
  ar: {
    dashboard: 'لوحة التحكم',
    companies: 'شركات النقل',
    stations: 'محطات الوقود',
    employees: 'الموظفين',
    orders: 'الطلبات',
    subscriptions: 'الاشتراكات',
    subscription_requests: 'طلبات الاشتراك',
    saas_plans: 'خطط الاشتراك',
    active_subscriptions: 'الاشتراكات النشطة',
    reports: 'التقارير',
    account_statement: 'كشف الحساب',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    search: 'ابحث...',
    system_status: 'النظام يعمل',
    new_notifications: 'إشعار جديد',
    welcome: 'مرحباً',
    light_mode: 'وضع نهاري',
    dark_mode: 'وضع ليلي',
    auto_mode: 'تلقائي',
    language: 'اللغة',
    save_settings: 'حفظ الإعدادات',
  },
  en: {
    dashboard: 'Dashboard',
    companies: 'Transport Companies',
    stations: 'Fuel Stations',
    employees: 'Employees',
    orders: 'Orders',
    subscriptions: 'Subscriptions',
    reports: 'Reports',
    account_statement: 'Account Statement',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    search: 'Search...',
    system_status: 'System Online',
    new_notifications: 'new notifications',
    welcome: 'Welcome',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    auto_mode: 'Auto',
    language: 'Language',
    save_settings: 'Save Settings',
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<FuelOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('dark');
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');

  const unreadCount = notifications.filter(n => !n.read).length;

  const setTheme = (t: 'light' | 'dark' | 'auto') => {
    setThemeState(t);
    localStorage.setItem('fuelapp_theme', t);
  };

  const setLanguage = (l: 'ar' | 'en') => {
    setLanguageState(l);
    localStorage.setItem('fuelapp_lang', l);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      
      // Watch for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  const refreshData = async () => {
    try {
      const [resCompanies, resStations, resOrders, resUsers, resNotifs, resTrans, resLedger, resDrivers, resVehicles] = await Promise.all([
        getCompanies(),
        getStations(),
        getOrders(),
        getUsers(),
        getNotifications(),
        getTransactions(),
        getDetailedLedger(),
        getDrivers(),
        getVehicles()
      ]);

      setCompanies(resCompanies.map((c: any) => ({
        id: c.id,
        name: c.company_name,
        managerName: '-',
        phone: c.phone || '',
        email: c.email || '',
        city: c.address || '',
        status: c.status as any,
        subscriptionStart: c.created_at,
        subscriptionEnd: '',
        paymentStatus: c.status === 'active' ? 'paid' : 'unpaid',
        totalOrders: 0,
        totalDebt: c.company_wallets?.[0]?.used_balance || 0,
        createdAt: c.created_at
      })));

      setStations(resStations.map((s: any) => ({
        id: s.id,
        name: s.station_name,
        managerName: '-',
        phone: s.phone || '',
        email: '',
        city: '',
        address: s.address || '',
        status: s.status as any,
        subscriptionStart: s.created_at,
        subscriptionEnd: '',
        paymentStatus: 'paid',
        fuelTypes: ['بترول', 'ديزل'],
        totalOrders: s.station_accounts?.[0]?.total_transactions || 0,
        totalRevenue: s.station_accounts?.[0]?.total_sales || 0,
        createdAt: s.created_at
      })));

      setOrders(resOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.id.split('-')[0], // Using part of UUID for order num
        companyId: o.company_id,
        companyName: o.companies?.company_name || 'غير معروف',
        stationId: o.station_id || '',
        stationName: o.fuel_stations?.station_name || 'غير معروف',
        driverName: o.drivers?.full_name || 'غير معروف',
        vehicleNumber: o.vehicles?.plate_number || '',
        fuelType: o.vehicles?.fuel_type === 'diesel' ? 'ديزل' : 'بترول',
        liters: o.liters_requested || 0,
        pricePerLiter: o.price_per_liter || 0.85,
        total: (o.liters_requested || 0) * (o.price_per_liter || 0.85),
        status: o.order_status as any,
        qrCode: o.qr_code,
        createdAt: o.created_at
      })));

      setUsers(resUsers.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        phone: '',
        role: u.role as UserRole,
        status: u.status,
        companyId: u.company_id,
        stationId: u.station_id
      })));

      setNotifications(resNotifs.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type as any || 'info',
        read: n.is_read,
        createdAt: n.created_at
      })));

      // Populate employees from users with station roles
      const stationMap = new Map(resStations.map((s: any) => [s.id, s.station_name]));
      setEmployees(resUsers
        .filter((u: any) => u.role === 'station_manager' || u.role === 'station_employee')
        .map((u: any) => ({
          id: u.id,
          name: u.full_name,
          phone: u.email.includes('@demo.sa') ? u.email.split('@')[0] : '', // Fallback for phone
          email: u.email,
          stationId: u.station_id || '',
          stationName: stationMap.get(u.station_id) || 'غير معروف',
          role: u.role,
          status: (u.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
          createdAt: u.created_at
        }))
      );

      setTransactions(resTrans.map((t: any) => ({
        id: t.id,
        transaction_code: t.transaction_code,
        company_id: t.company_id,
        company_name: t.companies?.company_name || 'غير معروف',
        station_id: t.station_id,
        station_name: t.fuel_stations?.station_name || 'غير معروف',
        vehicle_id: t.vehicle_id,
        vehicle_plate: t.vehicles?.plate_number || '',
        fuel_type: t.vehicles?.fuel_type || 'بترول',
        driver_id: t.driver_id,
        driver_name: t.drivers?.full_name || 'غير معروف',
        order_id: t.order_id,
        liters: t.liters,
        price_per_liter: t.price_per_liter,
        total_amount: t.total_amount,
        transaction_date: t.transaction_date,
        notes: t.notes
      })));

      setLedgerEntries(resLedger.map((l: any) => ({
        id: l.id,
        company_id: l.company_id,
        company_name: l.companies?.company_name || 'غير معروف',
        debit: l.debit,
        credit: l.credit,
        balance_after: l.balance_after,
        description: l.description,
        created_at: l.created_at,
        created_by: l.created_by,
        created_by_name: l.users?.full_name || 'النظام',
        transaction_details: l.fuel_transactions ? {
          vehicle_plate: l.fuel_transactions.vehicles?.plate_number,
          driver_name: l.fuel_transactions.drivers?.full_name,
          station_name: l.fuel_transactions.fuel_stations?.station_name,
          fuel_type: l.fuel_transactions.vehicles?.fuel_type,
          liters: l.fuel_transactions.liters,
          price: l.fuel_transactions.price_per_liter
        } : undefined
      })));

      setAllDrivers(resDrivers.map((d: any) => ({
        id: d.id,
        company_id: d.company_id,
        company_name: d.companies?.company_name || 'غير معروف',
        full_name: d.full_name,
        phone: d.phone,
        status: d.status,
        created_at: d.created_at
      })));

      setAllVehicles(resVehicles.map((v: any) => ({
        id: v.id,
        company_id: v.company_id,
        company_name: v.companies?.company_name || 'غير معروف',
        plate_number: v.plate_number,
        vehicle_type: v.vehicle_type,
        fuel_type: v.fuel_type,
        monthly_limit: v.monthly_fuel_limit,
        current_consumption: v.current_consumption,
        remaining_liters: v.remaining_liters,
        status: v.status,
        created_at: v.created_at
      })));

    } catch (e) {
      console.error("Error fetching data from Supabase", e);
    }
  };

  const login = async (credentials: { identifier: string; password: string }) => {
    let loginEmail = credentials.identifier;

    // Is it a phone number? (Rough check: only numbers)
    if (/^\d+$/.test(credentials.identifier)) {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .not('status', 'in', '("inactive","expired","pending","rejected","suspended")') 
        .or(`email.eq.${credentials.identifier},full_name.eq.${credentials.identifier}`)
        .limit(1)
        .maybeSingle();

      if (userData) loginEmail = userData.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: credentials.password,
    });

    if (authError || !authData.user) {
      return { success: false, error: parseError(authError) };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      return { success: false, error: parseError(userError || new Error('لم يتم العثور على ملف المستخدم')) };
    }

    // Check status
    if (['pending', 'rejected', 'expired', 'suspended'].includes(userData.status)) {
      await logout();
      return { success: false, error: 'حسابك في انتظار المراجعة أو غير نشط. يرجى التواصل مع الإدارة.' };
    }

    const roleMapping: any = {
      super_admin: 'admin',
      company_admin: 'company',
      station_manager: 'station',
      station_employee: 'station',
      driver: 'employee'
    };

    const mappedUser: User = {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      phone: '',
      role: roleMapping[userData.role] || userData.role,
      status: userData.status as any,
      companyId: userData.company_id,
      stationId: userData.station_id
    };

    setUser(mappedUser);
    localStorage.setItem('fuelapp_user', JSON.stringify(mappedUser));
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('fuelapp_user');
  };

  const registerAccount = async (data: any) => {
    // 1. Sign Up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.managerName,
          role: data.accountType === 'company' ? 'company_admin' : 'station_manager'
        }
      }
    });

    if (authError || !authData.user) return { success: false, error: parseError(authError) };

    const userId = authData.user.id;
    const isCompany = data.accountType === 'company';
    const orgId = crypto.randomUUID();

    // 2. Create Organization (Pending)
    const orgTable = isCompany ? 'companies' : 'fuel_stations';
    const orgData: any = {
      id: orgId,
      status: 'pending', // Pending approval
    };

    if (isCompany) {
      orgData.company_code = 'PENDING-' + Date.now().toString().slice(-4);
      orgData.company_name = data.companyName;
      orgData.email = data.email;
      orgData.phone = data.phone;
      orgData.address = data.city;
    } else {
      orgData.station_code = 'PENDING-' + Date.now().toString().slice(-4);
      orgData.station_name = data.companyName;
      orgData.phone = data.phone;
      orgData.address = data.address || data.city;
    }

    const { error: orgError } = await supabase.from(orgTable).insert([orgData]);
    if (orgError) return { success: false, error: parseError(orgError) };

    // 3. Create User Profile
    const { error: userError } = await supabase.from('users').insert([{
      id: userId,
      company_id: isCompany ? orgId : null,
      station_id: !isCompany ? orgId : null,
      full_name: data.managerName,
      email: data.email,
      role: isCompany ? 'company_admin' : 'station_manager',
      status: 'pending' // User also pending
    }]);

    if (userError) return { success: false, error: parseError(userError) };

    // 4. Create Subscription Request
    const { error: reqError } = await supabase.from('subscription_requests').insert([{
      user_id: userId,
      company_id: isCompany ? orgId : null,
      station_id: !isCompany ? orgId : null,
      request_type: data.accountType,
      company_name: isCompany ? data.companyName : null,
      station_name: !isCompany ? data.companyName : null,
      manager_name: data.managerName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      address: data.address || data.city,
      expected_vehicle_count: parseInt(data.expectedVehicleCount || '0'),
      expected_driver_count: parseInt(data.expectedDriverCount || '0'),
      number_of_pumps: parseInt(data.numberOfPumps || '0'),
      fuel_types: data.fuelTypes || [],
      selected_plan: data.selectedPlan,
      status: 'pending'
    }]);

    if (reqError) return { success: false, error: parseError(reqError) };

    addNotification({
      title: 'طلب انضمام جديد خاضع للمراجعة',
      message: `تم إنشاء حسابك وننتظر مراجعة الإدارة لطلب انضمام ${data.companyName}.`,
      type: 'info',
    });

    return { success: true };
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    await supabase.from('notifications').insert([{
      title: notif.title,
      message: notif.message,
      type: notif.type,
      is_read: false
    }]);
    refreshData();
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('fuelapp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { }
    }

    const savedTheme = localStorage.getItem('fuelapp_theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) setThemeState(savedTheme);

    const savedLang = localStorage.getItem('fuelapp_lang') as 'ar' | 'en';
    if (savedLang) setLanguageState(savedLang);

    // Initial fetch from DB
    refreshData();
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, isAuthenticated: !!user,
      login, logout,
      companies, setCompanies,
      stations, setStations,
      employees, setEmployees,
      orders, setOrders,
      notifications, setNotifications,
      addNotification, markNotificationRead,
      unreadCount, sidebarOpen, setSidebarOpen,
      users, setUsers, registerAccount, refreshData,
      theme, setTheme, language, setLanguage, t,
      transactions, ledgerEntries, allVehicles, allDrivers
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
