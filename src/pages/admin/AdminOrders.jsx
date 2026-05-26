import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import { notificationService } from '../../services/notificationService';
import { Package, Truck, CheckCircle, XCircle, Search, Eye, Filter, Calendar } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateNote, setUpdateNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrdersAdmin();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status, updateNote);
      
      // Find the order to get customer email for notification
      const order = orders.find(o => o.id === orderId);
      let notificationSent = false;
      let notificationError = null;

      if (order) {
        const result = await notificationService.sendTrackingUpdateEmail(order.customer_email, orderId, status, updateNote);
        if (result.success) {
          notificationSent = true;
        } else {
          notificationError = result.error;
        }
      }

      if (notificationSent) {
        alert('Order status updated successfully and customer notified via email.');
      } else {
        alert(`Order status updated, but email notification failed: ${notificationError || 'Unknown error'}`);
      }

      setSelectedOrder(null);
      setUpdateNote(''); // Clear note after update
      await fetchOrders();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blossom-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-charcoal-berry mb-2">Order Management</h1>
          <p className="text-charcoal-berry/60">Manage your customers orders and shipping status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 border border-pink-50 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-berry/30" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-creamy-vanilla rounded-2xl border-none focus:ring-2 focus:ring-blossom-pink transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-charcoal-berry/40" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-creamy-vanilla px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-blossom-pink outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-creamy-vanilla border-b border-pink-50">
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60">Order ID</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60">Customer</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60">Date</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60">Amount</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60">Status</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-charcoal-berry/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-creamy-vanilla/50 transition-colors">
                <td className="px-6 py-4 font-bold text-charcoal-berry">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-xs text-charcoal-berry/40">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-bold">{formatCurrency(order.final_amount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 hover:bg-blossom-pink/20 rounded-xl text-blossom-pink transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-charcoal-berry/20 mb-4" />
            <p className="text-charcoal-berry/40">No orders found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-berry/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-charcoal-berry">Order Details</h2>
                <p className="text-blossom-pink font-bold">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-creamy-vanilla rounded-full transition-colors">
                <XCircle className="text-charcoal-berry/20" size={32} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal-berry/40">Customer Info</h3>
                <div className="bg-creamy-vanilla p-6 rounded-3xl border border-pink-50">
                  <p className="font-bold text-charcoal-berry">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-charcoal-berry/60">{selectedOrder.customer_email}</p>
                  <p className="mt-4 text-sm leading-relaxed">
                    {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.zip}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal-berry/40">Financials</h3>
                <div className="bg-creamy-vanilla p-6 rounded-3xl border border-pink-50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-berry/60">Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-pink-100">
                    <span>Total:</span>
                    <span className="text-blossom-pink">{formatCurrency(selectedOrder.final_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-pink-50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal-berry/40">Update Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/40 ml-1">STATUS</label>
                  <select
                    value={selectedOrder.status}
                    onChange={e => setSelectedOrder({...selectedOrder, status: e.target.value})}
                    className="w-full p-4 bg-creamy-vanilla rounded-2xl border-none focus:ring-2 focus:ring-blossom-pink outline-none font-bold"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/40 ml-1">TRACKING NOTES</label>
                  <input
                    value={updateNote}
                    onChange={e => setUpdateNote(e.target.value)}
                    placeholder="E.g. Shipped via BlueDart"
                    className="w-full p-4 bg-creamy-vanilla rounded-2xl border-none focus:ring-2 focus:ring-blossom-pink outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, selectedOrder.status)}
                className="w-full py-5 bg-blossom-pink text-white rounded-2xl font-bold shadow-magic hover:bg-pink-400 transition-all flex items-center justify-center gap-2 group"
              >
                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                Update Order & Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

