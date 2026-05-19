import { Outlet, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';

export function MainLayout() {
  const { isAuthenticated, sidebarOpen } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)', direction: 'rtl' }}>
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 20%, var(--primary) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, var(--accent) 0%, transparent 50%)',
        opacity: 0.1,
        zIndex: 0
      }} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative w-full overflow-x-hidden" style={{ zIndex: 1 }}>
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 w-full max-w-full">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
          }
        }}
      />
    </div>
  );
}
