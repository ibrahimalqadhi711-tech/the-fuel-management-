import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import StationsPage from './pages/StationsPage';
import EmployeesPage from './pages/EmployeesPage';
import OrdersPage from './pages/OrdersPage';
import QRScannerPage from './pages/QRScannerPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ReportsPage from './pages/ReportsPage';
import AccountStatementPage from './pages/AccountStatementPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionRequestsPage from './pages/SubscriptionRequestsPage';
import PlansPage from './pages/PlansPage';
import ActiveSubscriptionsPage from './pages/ActiveSubscriptionsPage';

function NotFound() {
  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  {
    Component: MainLayout,
    children: [
      { path: '/dashboard', Component: DashboardPage },
      { path: '/companies', Component: CompaniesPage },
      { path: '/stations', Component: StationsPage },
      { path: '/employees', Component: EmployeesPage },
      { path: '/orders', Component: OrdersPage },
      { path: '/qr-scanner', Component: QRScannerPage },
      { path: '/subscriptions', Component: SubscriptionsPage },
      { path: '/reports', Component: ReportsPage },
      { path: '/account-statement', Component: AccountStatementPage },
      { path: '/settings', Component: SettingsPage },
      { path: '/notifications', Component: NotificationsPage },
      { path: '/profile', Component: ProfilePage },
      { path: '/admin/requests', Component: SubscriptionRequestsPage },
      { path: '/admin/plans', Component: PlansPage },
      { path: '/admin/subscriptions', Component: ActiveSubscriptionsPage },
    ],
  },
  { path: '*', Component: NotFound },
]);