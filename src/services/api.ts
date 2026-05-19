import { supabase } from '../utils/supabase';

export const parseError = (error: any) => {
  if (!error) return 'حدث خطأ غير معروف';
  
  const msg = error.message?.toLowerCase() || '';
  const code = error.code || '';

  if (code === '23505' || msg.includes('duplicate key')) return 'هذا السجل موجود مسبقاً (مكرر)';
  if (code === '23502') return 'يوجد حقول مطلوبة مفقودة';
  if (code === '42501' || msg.includes('row-level security') || msg.includes('rls')) return 'صلاحيات غير كافية (Access denied)';
  if (msg.includes('failed to fetch') || msg.includes('network error')) return 'تأكد من اتصالك بالإنترنت';
  if (msg.includes('jwt') || msg.includes('token')) return 'انتهت الجلسة (Session expired)، الرجاء تسجيل الدخول مجدداً';
  
  return error.message || 'حدث خطأ غير متوقع';
};

// --- Companies ---
export const getCompanies = async () => {
  const { data, error } = await supabase.from('companies').select('*, company_wallets(*)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const addCompany = async (companyData: any) => {
  const { data, error } = await supabase.from('companies').insert([companyData]).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const updateCompany = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const deleteCompany = async (id: string) => {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
};

// --- Stations ---
export const getStations = async () => {
  const { data, error } = await supabase.from('fuel_stations').select('*, station_accounts(*)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const addStation = async (stationData: any) => {
  const { data, error } = await supabase.from('fuel_stations').insert([stationData]).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const updateStation = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('fuel_stations').update(updates).eq('id', id).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const deleteStation = async (id: string) => {
  const { error } = await supabase.from('fuel_stations').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
};

// --- Users ---
export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const addUserInfo = async (userData: any) => {
  const { data, error } = await supabase.from('users').insert([userData]).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const updateUser = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
};

// --- Orders ---
export const getOrders = async () => {
  const { data, error } = await supabase.from('fuel_orders').select('*, companies(company_name), fuel_stations(station_name), drivers(full_name), vehicles(plate_number, fuel_type)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const addOrder = async (orderData: any) => {
  const { data, error } = await supabase.from('fuel_orders').insert([orderData]).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const updateOrder = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('fuel_orders').update(updates).eq('id', id).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase.from('fuel_orders').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
};

// --- Notifications ---
export const getNotifications = async () => {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const markNotificationRead = async (id: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(parseError(error));
};

export const addNotification = async (notification: any) => {
  const { error } = await supabase.from('notifications').insert([{ ...notification, is_read: false }]);
  if (error) throw new Error(parseError(error));
};

// --- Drivers & Vehicles ---
export const getDriverByName = async (name: string, companyId: string) => {
  const { data, error } = await supabase.from('drivers').select('*').eq('full_name', name).eq('company_id', companyId).limit(1).single();
  if (error && error.code !== 'PGRST116') throw new Error(parseError(error)); // Ignore "Not Found" error to return null
  return data;
};

export const addDriver = async (driverData: any) => {
  const { data, error } = await supabase.from('drivers').insert([driverData]).select().single();
  if (error) throw new Error(parseError(error));
  return data;
};

export const getVehicleByPlate = async (plateNumber: string) => {
  const { data, error } = await supabase.from('vehicles').select('*').eq('plate_number', plateNumber).limit(1).single();
  if (error && error.code !== 'PGRST116') throw new Error(parseError(error));
  return data;
};

export const addVehicle = async (vehicleData: any) => {
  const { data, error } = await supabase.from('vehicles').insert([vehicleData]).select().single();
  if (error) throw new Error(parseError(error));
  return data;
};

// --- Orders ---
export const getOrderByQRCode = async (qrCode: string) => {
  const { data, error } = await supabase.from('fuel_orders')
    .select(`*, companies(company_name), fuel_stations(station_name), drivers(full_name), vehicles(plate_number, fuel_type)`)
    .eq('qr_code', qrCode).limit(1).single();
  
  if (error && error.code !== 'PGRST116') throw new Error(parseError(error));
  return data;
};
// --- SaaS Subscriptions ---
export const getSubscriptionRequests = async () => {
  const { data, error } = await supabase.from('subscription_requests').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const updateSubscriptionRequest = async (id: string, updates: any) => {
  const { data, error } = await supabase.from('subscription_requests').update(updates).eq('id', id).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const getSubscriptionPlans = async () => {
  const { data, error } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const getActiveCompanySubscriptions = async () => {
  const { data, error } = await supabase.from('company_subscriptions').select('*, companies(company_name), subscription_plans(name)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const approveSubscriptionRequest = async (request: any) => {
  const isCompany = request.request_type === 'company';
  const orgId = isCompany ? request.company_id : request.station_id;
  const userId = request.user_id;
  
  // 1. Activate Organization & Set Real Code
  const orgTable = isCompany ? 'companies' : 'fuel_stations';
  const orgCode = (isCompany ? 'COMP-' : 'STAT-') + Date.now().toString().slice(-6);
  
  const orgUpdates: any = { status: 'active' };
  if (isCompany) orgUpdates.company_code = orgCode;
  else orgUpdates.station_code = orgCode;

  const { error: orgError } = await supabase.from(orgTable).update(orgUpdates).eq('id', orgId);
  if (orgError) throw new Error(parseError(orgError));

  // 2. Activate User
  const { error: userError } = await supabase.from('users').update({ status: 'active' }).eq('id', userId);
  if (userError) throw new Error(parseError(userError));

  // 3. Create Subscription record
  const planTable = isCompany ? 'company_subscriptions' : 'station_subscriptions';
  const { data: plans } = await supabase.from('subscription_plans').select('id').eq('name', request.selected_plan).limit(1).single();
  
  const subData: any = {
    plan_id: plans?.id,
    status: 'active',
    start_date: new Date().toISOString(),
  };

  if (isCompany) subData.company_id = orgId;
  else subData.station_id = orgId;

  const { error: subError } = await supabase.from(planTable).insert([subData]);
  if (subError) throw new Error(parseError(subError));

  // 4. Create Wallet/Account
  if (isCompany) {
    await supabase.from('company_wallets').upsert([{ company_id: orgId, total_balance: 0, used_balance: 0, remaining_balance: 0 }]);
  } else {
    await supabase.from('station_accounts').upsert([{ station_id: orgId, total_sales: 0, total_transactions: 0 }]);
  }

  // 5. Update Request Status
  await supabase.from('subscription_requests').update({ status: 'approved' }).eq('id', request.id);

  return { success: true };
};

// --- Transactions ---
export const addTransaction = async (transactionData: any) => {
  const { data, error } = await supabase.from('fuel_transactions').insert([transactionData]).select();
  if (error) throw new Error(parseError(error));
  return data;
};

export const getTransactions = async (filters: any = {}) => {
  let query = supabase.from('fuel_transactions')
    .select('*, companies(company_name), fuel_stations(station_name), drivers(full_name), vehicles(plate_number, fuel_type), users!fuel_transactions_created_by_fkey(full_name)')
    .order('transaction_date', { ascending: false });
  
  if (filters.companyId) query = query.eq('company_id', filters.companyId);
  if (filters.stationId) query = query.eq('station_id', filters.stationId);
  if (filters.driverId) query = query.eq('driver_id', filters.driverId);
  if (filters.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
  
  const { data, error } = await query;
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const getDetailedLedger = async (filters: any = {}) => {
  let query = supabase.from('general_ledger')
    .select('*, companies(company_name), fuel_transactions(*, vehicles(plate_number), drivers(full_name), fuel_stations(station_name)), users!general_ledger_created_by_fkey(full_name)')
    .order('created_at', { ascending: false });

  if (filters.companyId) query = query.eq('company_id', filters.companyId);
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const getDrivers = async () => {
  const { data, error } = await supabase.from('drivers').select('*, companies(company_name)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};

export const getVehicles = async () => {
  const { data, error } = await supabase.from('vehicles').select('*, companies(company_name), drivers(full_name)').order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return data || [];
};
