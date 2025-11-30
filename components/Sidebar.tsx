import React from 'react';
import { LayoutDashboard, Store, Tag, Package, Percent, Eye, Settings, LogOut, ShoppingCart } from 'lucide-react';

interface SidebarProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  activePath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout, activePath }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Tag, label: 'Categories', path: '/categories' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Store, label: 'Store Info', path: '/store-info' },
    // { icon: Percent, label: 'Limited Deals', path: '/deals' },
    { icon: Eye, label: 'Preview Store', path: '/preview' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-ayoo-500 p-2 rounded-lg">
          <Store className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Ayoo</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ayoo-50 text-ayoo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-ayoo-500' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};