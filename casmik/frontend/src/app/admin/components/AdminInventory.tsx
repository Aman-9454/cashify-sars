'use client';
import React, { useState } from 'react';
import { brands } from '@/lib/casmikData';
import { Search, Plus, Share2, ChevronDown, Package, AlertTriangle, Warehouse, CheckSquare } from 'lucide-react';

interface InventoryItem {
  id: string;
  invId: string;
  modelId: string;
  modelName: string;
  category: string;
  brand: string;
  basePrice: number;
  stockLevel: number;
  alertThreshold: number;
  location: string;
  photos: string[];
  status: 'Good Stock' | 'Reorder Needed';
}

const initialInventory: InventoryItem[] = [
  /* Static mock inventory commented out for live data:
  { id: 'inv-1', invId: 'INV-001', modelId: 'iphone-15-pro-max', modelName: 'iPhone 15 Pro Max', category: 'Smartphones', brand: 'Apple', basePrice: 75000, stockLevel: 84, alertThreshold: 3, location: 'Warehouse - Mumbai Miraroad', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_17b82fb7a-1772960574407.png'], status: 'Good Stock' },
  { id: 'inv-2', invId: 'INV-002', modelId: 'macbook-pro-14-m4', modelName: 'MacBook Pro M3', category: 'Laptops', brand: 'Apple', basePrice: 95000, stockLevel: 100, alertThreshold: 10, location: 'Warehouse Mumbai', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_11ad868de-1766607648821.png'], status: 'Good Stock' },
  { id: 'inv-3', invId: 'INV-003', modelId: 's23', modelName: 'Galaxy S23 FE', category: 'Smartphones', brand: 'Samsung', basePrice: 28000, stockLevel: 40, alertThreshold: 5, location: 'Main Warehouse', photos: [], status: 'Good Stock' },
  { id: 'inv-4', invId: 'INV-004', modelId: 'dell-xps-15', modelName: 'Dell XPS 15', category: 'Laptops', brand: 'Dell', basePrice: 85000, stockLevel: 80, alertThreshold: 5, location: 'Noida', photos: [], status: 'Good Stock' },
  { id: 'inv-5', invId: 'INV-AUTO-8392-0', modelId: 'iphone-15-pro-max', modelName: 'iPhone 15 Pro Max', category: 'Smartphones', brand: 'Apple', basePrice: 75000, stockLevel: 0, alertThreshold: 5, location: 'Pending Assignment', photos: [], status: 'Reorder Needed' },
  { id: 'inv-6', invId: 'INV-AUTO-8392-1', modelId: 'iphone-15-pro', modelName: 'iPhone 15 Pro', category: 'Smartphones', brand: 'Apple', basePrice: 68000, stockLevel: 0, alertThreshold: 5, location: 'Pending Assignment', photos: [], status: 'Reorder Needed' },
  { id: 'inv-7', invId: 'INV-AUTO-8392-2', modelId: 'iphone-17-pro-max', modelName: 'iPhone 17 Pro Max', category: 'Smartphones', brand: 'Apple', basePrice: 105000, stockLevel: 12, alertThreshold: 5, location: 'Warehouse - Delhi', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_1ac872aa5-1772414311954.png'], status: 'Good Stock' },
  { id: 'inv-8', invId: 'INV-005', modelId: 's25-ultra', modelName: 'Galaxy S25 Ultra', category: 'Smartphones', brand: 'Samsung', basePrice: 78000, stockLevel: 22, alertThreshold: 5, location: 'Warehouse - Bangalore', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_122e5667e-1772368533819.png'], status: 'Good Stock' },
  { id: 'inv-9', invId: 'INV-006', modelId: 'oneplus-13', modelName: 'OnePlus 13', category: 'Smartphones', brand: 'OnePlus', basePrice: 55000, stockLevel: 35, alertThreshold: 8, location: 'Main Warehouse', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_1bec49e58-1772994604500.png'], status: 'Good Stock' },
  { id: 'inv-10', invId: 'INV-007', modelId: 'pixel-9-pro', modelName: 'Pixel 9 Pro', category: 'Smartphones', brand: 'Google', basePrice: 52000, stockLevel: 2, alertThreshold: 5, location: 'Warehouse - Chennai', photos: [], status: 'Reorder Needed' },
  { id: 'inv-11', invId: 'INV-008', modelId: 'macbook-air-m3', modelName: 'MacBook Air M3', category: 'Laptops', brand: 'Apple', basePrice: 95000, stockLevel: 18, alertThreshold: 5, location: 'Warehouse Mumbai', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_11003c8b0-1773211912290.png'], status: 'Good Stock' },
  { id: 'inv-12', invId: 'INV-009', modelId: 'fold-5', modelName: 'Galaxy Z Fold 5', category: 'Smartphones', brand: 'Samsung', basePrice: 72000, stockLevel: 8, alertThreshold: 3, location: 'Warehouse - Hyderabad', photos: [], status: 'Good Stock' },
  { id: 'inv-13', invId: 'INV-010', modelId: 'xiaomi-14-ultra', modelName: 'Xiaomi 14 Ultra', category: 'Smartphones', brand: 'Xiaomi', basePrice: 45000, stockLevel: 0, alertThreshold: 5, location: 'Pending Assignment', photos: [], status: 'Reorder Needed' },
  { id: 'inv-14', invId: 'INV-011', modelId: 'dell-xps-13', modelName: 'Dell XPS 13', category: 'Laptops', brand: 'Dell', basePrice: 72000, stockLevel: 14, alertThreshold: 5, location: 'Noida', photos: [], status: 'Good Stock' },
  { id: 'inv-15', invId: 'INV-012', modelId: 'iphone-14-pro-max', modelName: 'iPhone 14 Pro Max', category: 'Smartphones', brand: 'Apple', basePrice: 58000, stockLevel: 28, alertThreshold: 5, location: 'Warehouse - Bangalore', photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_103da8441-1770037000517.png'], status: 'Good Stock' },
  { id: 'inv-16', invId: 'INV-013', modelId: 's24-ultra', modelName: 'Galaxy S24 Ultra', category: 'Smartphones', brand: 'Samsung', basePrice: 68000, stockLevel: 3, alertThreshold: 5, location: 'Main Warehouse', photos: [], status: 'Reorder Needed' },
  { id: 'inv-17', invId: 'INV-014', modelId: 'oneplus-12', modelName: 'OnePlus 12', category: 'Smartphones', brand: 'OnePlus', basePrice: 48000, stockLevel: 45, alertThreshold: 8, location: 'Warehouse - Mumbai', photos: [], status: 'Good Stock' },
  { id: 'inv-18', invId: 'INV-015', modelId: 'ipad-pro-13-m4', modelName: 'Apple iPad Pro 13" M4', category: 'Tablets', brand: 'Apple', basePrice: 98000, stockLevel: 25, alertThreshold: 5, location: 'Warehouse - Bangalore', photos: [], status: 'Good Stock' },
  { id: 'inv-19', invId: 'INV-016', modelId: 'galaxy-tab-s9-ultra', modelName: 'Galaxy Tab S9 Ultra', category: 'Tablets', brand: 'Samsung', basePrice: 74000, stockLevel: 14, alertThreshold: 4, location: 'Warehouse - Delhi', photos: [], status: 'Good Stock' },
  { id: 'inv-20', invId: 'INV-017', modelId: 'cam-sony-a7iii', modelName: 'Sony Alpha A7 III', category: 'Cameras', brand: 'Sony', basePrice: 85000, stockLevel: 12, alertThreshold: 3, location: 'Warehouse - Mumbai', photos: [], status: 'Good Stock' },
  { id: 'inv-21', invId: 'INV-018', modelId: 'cam-canon-rp', modelName: 'Canon EOS RP', category: 'Cameras', brand: 'Canon', basePrice: 58000, stockLevel: 8, alertThreshold: 2, location: 'Warehouse - Noida', photos: [], status: 'Good Stock' },
  */
];

export default function AdminInventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterBrand, setFilterBrand] = useState('All Brands');
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ modelName: '', category: 'Smartphones', brand: 'Apple', basePrice: '', stockLevel: '', alertThreshold: '', location: '' });

  const filtered = inventory.filter(item => {
    const matchSearch = item.modelName.toLowerCase().includes(search.toLowerCase()) || item.invId.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All Categories' || item.category === filterCategory;
    const matchBrand = filterBrand === 'All Brands' || item.brand === filterBrand;
    return matchSearch && matchCat && matchBrand;
  });

  const totalTracked = inventory.length;
  const totalStock = inventory.reduce((s, i) => s + i.stockLevel, 0);
  const lowStockAlerts = inventory.filter(i => i.status === 'Reorder Needed').length;
  const warehousesActive = [...new Set(inventory.map(i => i.location.split(' - ')[0]))].length;

  const openAdd = () => { setEditItem(null); setForm({ modelName: '', category: 'Smartphones', brand: 'Apple', basePrice: '', stockLevel: '', alertThreshold: '5', location: '' }); setShowModal(true); };
  const openEdit = (item: InventoryItem) => { setEditItem(item); setForm({ modelName: item.modelName, category: item.category, brand: item.brand, basePrice: String(item.basePrice), stockLevel: String(item.stockLevel), alertThreshold: String(item.alertThreshold), location: item.location }); setShowModal(true); };

  const handleSave = () => {
    const stock = Number(form.stockLevel);
    const threshold = Number(form.alertThreshold);
    const status: 'Good Stock' | 'Reorder Needed' = stock <= threshold ? 'Reorder Needed' : 'Good Stock';
    if (editItem) {
      setInventory(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form, basePrice: Number(form.basePrice), stockLevel: stock, alertThreshold: threshold, status } : i));
    } else {
      const newItem: InventoryItem = { id: `inv-${Date.now()}`, invId: `INV-${String(inventory.length + 1).padStart(3, '0')}`, modelId: '', ...form, basePrice: Number(form.basePrice), stockLevel: stock, alertThreshold: threshold, photos: [], status };
      setInventory(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const deleteItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));
  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(i => i.id));

  const uniqueCategories = ['All Categories', ...new Set(inventory.map(i => i.category))];
  const uniqueBrands = ['All Brands', ...new Set(inventory.map(i => i.brand))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Inventory Stock Management</h2>
          <p className="text-sm text-gray-500">Track and update warehouse stock levels by device model category & brand</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
            <Share2 size={15} /> Share Filtered Stock
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
            <Plus size={15} /> Track Model Stock
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Tracked Items</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalTracked}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <Package size={22} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total In-Stock Qty</p>
            <p className="text-3xl font-black text-green-600 mt-1">{totalStock}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckSquare size={22} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Low Stock Alerts</p>
            <p className="text-3xl font-black text-red-600 mt-1">{lowStockAlerts}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Warehouses Active</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{warehousesActive}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Warehouse size={22} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            {uniqueCategories.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            {uniqueBrands.map(b => <option key={b}>{b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search models..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">INV ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Device Model</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Photos</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Base Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Stock Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Alert Threshold</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selected.includes(item.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-primary">{item.invId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">{item.modelName}</p>
                    <p className="text-xs text-gray-400">ID: {item.modelId}</p>
                  </td>
                  <td className="px-4 py-3">
                    {item.photos.length > 0 ? (
                      <img src={item.photos[0]} alt={item.modelName} className="w-8 h-8 object-contain rounded-lg bg-gray-50" />
                    ) : (
                      <span className="text-xs text-gray-400">No photos</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.brand}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{item.basePrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${item.stockLevel === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stockLevel} Units
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.alertThreshold} Units</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-32">{item.location}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.status === 'Good Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(item)} className="text-xs font-bold text-blue-600 hover:underline">Quick Edit</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-xs font-bold text-green-600 hover:underline">Share</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => deleteItem(item.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">{editItem ? 'Quick Edit Inventory' : 'Track New Model Stock'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Device Model Name</label>
                <input value={form.modelName} onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. iPhone 15 Pro Max" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Smartphones</option><option>Laptops</option><option>Tablets</option><option>Smartwatches</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Brand</label>
                  <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {brands.map(b => <option key={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Base Price (₹)</label>
                <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Stock Level (Units)</label>
                  <input type="number" value={form.stockLevel} onChange={e => setForm(f => ({ ...f, stockLevel: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Alert Threshold</label>
                  <input type="number" value={form.alertThreshold} onChange={e => setForm(f => ({ ...f, alertThreshold: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Location / Warehouse</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Warehouse - Mumbai" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90">
                {editItem ? 'Save Changes' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
