import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { User } from '../types';
import { User as UserIcon, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        onNavigate={(path) => navigate(path)} 
        onLogout={onLogout}
        activePath={location.pathname}
      />
      
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-900">
            {user?.name || 'Merchant'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Store Owner</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-ayoo-100 flex items-center justify-center text-ayoo-600">
                <UserIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};