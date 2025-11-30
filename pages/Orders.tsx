
import React from 'react';
import { Search, Filter, Eye, ChevronDown, Package, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Order, OrderStatus } from '../types';

interface OrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const statusColors: Record<OrderStatus, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Shipped': 'bg-blue-100 text-blue-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const statusIcons: Record<OrderStatus, React.ElementType> = {
  'Pending': Clock,
  'Shipped': Truck,
  'Delivered': CheckCircle,
  'Cancelled': XCircle
};

export const Orders: React.FC<OrdersProps> = ({ orders, setOrders }) => {
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage your customer orders</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ayoo-500 focus:border-ayoo-500 w-full sm:w-64 transition-all"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Order ID</th>
                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 font-medium text-gray-500">Total</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Items</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-300 mb-3" />
                      <p>No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-ayoo-600">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₱{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group inline-block">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]} cursor-pointer`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status}
                          </span>
                          <div className="hidden group-hover:block absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                            {(['Pending', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(order.id, status)}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${order.status === status ? 'text-ayoo-600 font-medium' : 'text-gray-700'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="whitespace-nowrap">
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-ayoo-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {orders.length} orders</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
