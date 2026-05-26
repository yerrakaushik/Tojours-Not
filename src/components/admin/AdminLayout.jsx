import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  LayoutDashboard, 
  Package, 
  Ticket, 
  ShoppingCart, 
  Sliders, 
  Star, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    localStorage.removeItem('admin_verified');
    await authService.signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { path: '/admin/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { path: '/admin/coupons', label: 'Coupons', icon: <Ticket className="w-5 h-5" /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/admin/options', label: 'Custom Options', icon: <Sliders className="w-5 h-5" /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { path: '/admin/content', label: 'Site Content', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h2 className="text-2xl font-playfair font-bold text-gray-800">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
              
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sage-mist text-white shadow-md shadow-sage-mist/20'
                    : 'text-gray-600 hover:bg-sage-mist/10 hover:text-sage-mist'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {navItems.find(item =>
                item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path)
              )?.label || 'Admin Panel'}
            </h1>
            <div className="text-sm text-gray-500">
              Manage your store from the central command center.
            </div>
          </header>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
