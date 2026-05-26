import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { Store, CreditCard, Truck, Bell, Shield, Settings2, Globe, Mail, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payment');
  const [storeInfo, setStoreInfo] = useState({
    name: 'Bloom & Charm',
    email: 'support@bloomandcharm.com',
    currency: 'INR',
    taxRate: '8.5'
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  async function fetchMethods() {
    setIsLoading(true);
    try {
      const data = await paymentService.getPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      await paymentService.togglePaymentMethod(id, !currentStatus);
      toast.success('Payment method updated');
      await fetchMethods();
    } catch (err) {
      toast.error('Error updating payment method');
    }
  };

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    toast.success('Store settings saved successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-mist"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <Store className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store configuration and preferences</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-sage-mist/10 text-sage-mist' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          {activeTab === 'general' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Store className="w-6 h-6 text-sage-mist" />
                General Settings
              </h2>
              <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input 
                      type="text" 
                      value={storeInfo.name}
                      onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input 
                      type="email" 
                      value={storeInfo.email}
                      onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select 
                      value={storeInfo.currency}
                      onChange={(e) => setStoreInfo({...storeInfo, currency: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all bg-white"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={storeInfo.taxRate}
                      onChange={(e) => setStoreInfo({...storeInfo, taxRate: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" className="bg-sage-mist text-white px-6 py-2.5 rounded-xl font-medium hover:bg-sage-mist/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-sage-mist" />
                  Payment Methods
                </h2>
                <button
                  onClick={() => {
                    const name = prompt('Enter payment method name (e.g. Razorpay, Stripe, COD)');
                    if (name) {
                      paymentService.createPaymentMethod(name, { active: true })
                        .then(() => {
                          toast.success('Payment method added');
                          fetchMethods();
                        })
                        .catch(err => toast.error('Failed to add method: ' + err.message));
                    }
                  }}
                  className="px-4 py-2 bg-sage-mist text-white rounded-xl text-sm font-medium hover:bg-sage-mist/90 transition-colors"
                >
                  Add Method
                </button>
              </div>
              <p className="text-gray-500 mb-8">Enable or disable payment gateways for your store checkout process.</p>

              <div className="space-y-4">
                {methods.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No payment methods configured.</p>
                    <p className="text-sm text-gray-400 mt-1">Add a method to start accepting payments.</p>
                  </div>
                ) : (
                  methods.map(method => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        method.is_active
                          ? 'bg-sage-mist/5 border-sage-mist/30'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${method.is_active ? 'bg-sage-mist/10 text-sage-mist' : 'bg-gray-100 text-gray-500'}`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-bold text-gray-800">{method.name}</h3>
                            <p className="text-sm text-gray-500">{method.is_active ? 'Currently active on checkout' : 'Disabled'}</p>
                          </div>
                          <button
                            onClick={() => {
                              paymentService.deletePaymentMethod(method.id)
                                .then(() => {
                                  toast.success('Method removed');
                                  fetchMethods();
                                })
                                .catch(err => toast.error('Delete failed: ' + err.message));
                            }}
                            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={method.is_active}
                          onChange={() => handleToggle(method.id, method.is_active)}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sage-mist"></div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-sage-mist" />
                  Shipping Settings
                </h2>
              </div>
              <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flat Shipping Rate (₹)</label>
                    <input 
                      type="number" 
                      defaultValue="5.00"
                      step="0.01"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
                    <input 
                      type="number" 
                      defaultValue="50.00"
                      step="0.01"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-mist/20 focus:border-sage-mist transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" className="bg-sage-mist text-white px-6 py-2.5 rounded-xl font-medium hover:bg-sage-mist/90 transition-colors">
                    Save Shipping Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-sage-mist" />
                  Email Notifications
                </h2>
              </div>
              <div className="space-y-4">
                {['Order Confirmation', 'Shipping Updates', 'New Reviews', 'Inventory Alerts'].map((notif, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white">
                    <div>
                      <h3 className="font-bold text-gray-800">{notif}</h3>
                      <p className="text-sm text-gray-500">Send automatic emails to customers and admins.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sage-mist"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-sage-mist" />
                  Security Settings
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Change Admin Password</h3>
                  <form onSubmit={handleSaveStoreSettings} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-200 rounded-xl" />
                    </div>
                    <div>
                      <button type="submit" className="bg-sage-mist text-white px-6 py-2.5 rounded-xl font-medium">Update Password</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
