import React, { useEffect, useState } from 'react';
import { productsService } from '../../services/supabaseService';
import { Plus, Edit2, Trash2, Sliders, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const AdminCustomOptions = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    type: 'flower', name: '', price: '', image: ''
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    setIsLoading(true);
    try {
      const data = await productsService.getCustomOptions();
      setOptions(data);
    } catch (err) {
      console.error('Error fetching options:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = (option = null) => {
    if (option) {
      setEditingOption(option);
      setFormData(option);
    } else {
      setEditingOption(null);
      setFormData({ type: 'flower', name: '', price: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOption) {
        await productsService.updateCustomOption(editingOption.id, formData);
      } else {
        await productsService.createCustomOption(formData);
      }
      setIsModalOpen(false);
      await fetchOptions();
    } catch (err) {
      alert('Error saving option: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await productsService.deleteCustomOption(id);
        await fetchOptions();
      } catch (err) {
        alert('Error deleting option: ' + err.message);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading options...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Custom Options</h1>
          <p className="text-gray-500 text-sm mt-1">Manage flowers, fillers, and paper styles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Add Option</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Option Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {options.map(option => (
                <tr key={option.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                        {option.image ? <img src={option.image} alt={option.name} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                      </div>
                      <span className="font-medium text-gray-800">{option.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                      <Sliders size={12} />
                      {option.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {formatCurrency(option.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(option)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(option.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {options.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Sliders className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No custom options found. Add some flowers or papers!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingOption ? 'Edit Option' : 'Add New Option'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all bg-white"
                >
                  <option value="flower">Flower</option>
                  <option value="filler">Filler</option>
                  <option value="paper">Paper</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all" placeholder="e.g. Red Rose" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all" placeholder="50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-colors">
                  {editingOption ? 'Save Changes' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomOptions;
