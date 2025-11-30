import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Users } from 'lucide-react';
import { StoreProfile } from '../types';

interface DashboardProps {
  storeProfile: StoreProfile | null;
}

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export const Dashboard: React.FC<DashboardProps> = ({ storeProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        {storeProfile && (
           <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${storeProfile.storeOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-2 h-2 rounded-full ${storeProfile.storeOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {storeProfile.storeOpen ? 'Store Open' : 'Store Closed'}
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₱24,500</h3>
            </div>
            <div className="p-3 bg-ayoo-50 rounded-lg text-ayoo-600">
              <span className="text-xl font-bold">₱</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              12%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">1,203</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">New Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">432</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 flex items-center font-medium">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              2%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
              <Bar dataKey="sales" fill="#fd0ec9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};