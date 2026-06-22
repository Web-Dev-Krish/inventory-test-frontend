import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Package, QrCode, User, LogOut, Plus, Download, Printer, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string; name: string; code: string; category: string; quantity: number; location: string; unit: string; barcode: string;
}

interface Toast { id: number; message: string; type: 'success' | 'error'; }

export default function MobileQRInventory() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'qrcodes' | 'profile'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<Product | null>(null);
  const [qrPrefix, setQrPrefix] = useState('INV-');
  const [defaultLocation, setDefaultLocation] = useState('Main Store');
  const [newItem, setNewItem] = useState({ name: '', code: '', category: '', quantity: 1, location: 'Main Store', unit: 'pcs' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const saved = localStorage.getItem('qr_settings');
    if (saved) {
      const s = JSON.parse(saved);
      setQrPrefix(s.prefix || 'INV-');
      setDefaultLocation(s.location || 'Main Store');
      setDarkMode(s.darkMode || false);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('qr_settings', JSON.stringify({ prefix: qrPrefix, location: defaultLocation, darkMode }));
    showToast('Settings saved');
  };

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterLocation === 'All' || p.location === filterLocation)
  );

  const locations = ['All', ...new Set(products.map(p => p.location).filter(Boolean))];

  const stats = {
    totalItems: products.length,
    totalUnits: products.reduce((sum, p) => sum + p.quantity, 0),
    qrCodes: products.length,
    locations: new Set(products.map(p => p.location)).size
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.code) { showToast('Name and Code required', 'error'); return; }
    const barcode = qrPrefix + Date.now().toString().slice(-6);
    await supabase.from('products').insert([{ ...newItem, barcode }]);
    showToast('Item added successfully');
    setShowAddModal(false);
    setNewItem({ name: '', code: '', category: '', quantity: 1, location: defaultLocation, unit: 'pcs' });
    fetchProducts();
  };

  const duplicateItem = async (product: Product) => {
    const newCode = product.code + '-COPY';
    const barcode = qrPrefix + Date.now().toString().slice(-6);
    await supabase.from('products').insert([{ ...product, code: newCode, barcode, id: undefined as any }]);
    showToast('Item duplicated');
    fetchProducts();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('products').delete().eq('id', id);
    showToast('Item deleted');
    fetchProducts();
  };

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await supabase.from('products').update({ quantity: newQty }).eq('id', id);
    fetchProducts();
  };

  const openQR = (product: Product) => { setSelectedQR(product); setShowQRModal(true); };

  const downloadQR = (product: Product, format: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1A2744'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#C8960C'; ctx.font = 'bold 16px Arial';
    ctx.fillText(product.barcode, 30, 150); ctx.fillText(product.name, 30, 180);
    const link = document.createElement('a');
    link.download = `${product.code}.${format}`;
    link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg');
    link.click();
    showToast(`${format.toUpperCase()} downloaded`);
  };

  const exportAll = (type: string) => {
    if (type === 'csv') {
      const csv = ['Name,Code,Quantity,Location,Barcode', ...products.map(p => `"${p.name}","${p.code}",${p.quantity},"${p.location}","${p.barcode}"`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
    }
    showToast(`${type.toUpperCase()} export complete`);
  };

  const bg = darkMode ? 'bg-[#0F172A]' : 'bg-white';
  const cardBg = darkMode ? 'bg-[#1E293B]' : 'bg-white';

  return (
    <div className={`max-w-[420px] mx-auto min-h-[calc(100vh-41px)] flex flex-col border-x border-gray-200 ${bg} text-[#1A2744]`}>
      <div className="bg-[#1A2744] text-white px-5 py-4 flex justify-between items-center">
        <div><div className="font-bold text-lg">CSJMU QR Inventory</div><div className="text-xs text-[#C8960C]">Labour • Enterprise</div></div>
        <button onClick={logout} className="text-xs px-3 py-1 bg-white/10 rounded flex items-center gap-1"><LogOut size={14} /> Logout</button>
      </div>

      <div className="fixed top-14 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`px-4 py-2 rounded-lg shadow text-white text-sm ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{t.message}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div><div className="text-2xl font-bold">Dashboard</div><div className="text-sm text-[#C8960C]">Enterprise Overview</div></div>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-[#1A2744] text-white">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[{ label: 'Total Items', value: stats.totalItems }, { label: 'Total Units', value: stats.totalUnits }, { label: 'QR Codes', value: stats.qrCodes }, { label: 'Locations', value: stats.locations }].map((stat, i) => (
                <div key={i} className={`${cardBg} p-5 rounded-2xl border border-[#C8960C]/20`}>
                  <div className="text-4xl font-bold text-[#C8960C]">{stat.value}</div>
                  <div className="text-sm mt-1 text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAddModal(true)} className="w-full py-4 bg-[#C8960C] text-[#1A2744] rounded-2xl font-semibold flex items-center justify-center gap-2"><Plus size={20} /> Add New Item</button>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-4"><div className="text-xl font-bold">Inventory</div><button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#C8960C] text-[#1A2744] text-sm rounded-xl font-medium">+ Add</button></div>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full mb-3 px-4 py-3 rounded-xl border" />
            <div className="flex gap-2 mb-4 flex-wrap">{locations.map(loc => <button key={loc} onClick={() => setFilterLocation(loc)} className={`px-3 py-1 text-xs rounded-full border ${filterLocation === loc ? 'bg-[#C8960C] text-[#1A2744]' : ''}`}>{loc}</button>)}</div>
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className={`${cardBg} p-4 rounded-2xl border border-[#C8960C]/10`}>
                  <div className="flex justify-between"><div><div className="font-semibold">{product.name}</div><div className="text-xs text-gray-400">{product.code} • {product.location}</div></div><div className="text-right"><div className="font-mono text-[#C8960C]">{product.barcode}</div><div className="text-xs">{product.quantity} {product.unit}</div></div></div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-3"><button onClick={() => updateQuantity(product.id, product.quantity - 1)} className="w-8 h-8 rounded-full bg-[#1A2744] text-white">-</button><span className="font-semibold text-lg">{product.quantity}</span><button onClick={() => updateQuantity(product.id, product.quantity + 1)} className="w-8 h-8 rounded-full bg-[#1A2744] text-white">+</button></div>
                    <div className="flex gap-2"><button onClick={() => duplicateItem(product)} className="text-xs px-3 py-1 border rounded">Duplicate</button><button onClick={() => deleteItem(product.id)} className="text-xs px-3 py-1 text-red-500 border border-red-200 rounded">Delete</button><button onClick={() => openQR(product)} className="text-xs px-3 py-1 bg-[#C8960C] text-[#1A2744] rounded">QR</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qrcodes' && (
          <div><div className="text-xl font-bold mb-4">QR Management</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => exportAll('pdf')} className="py-3 bg-[#1A2744] text-white rounded-2xl text-sm">Export PDF</button>
              <button onClick={() => exportAll('png')} className="py-3 bg-[#1A2744] text-white rounded-2xl text-sm">Export PNG</button>
              <button onClick={() => exportAll('csv')} className="py-3 bg-[#1A2744] text-white rounded-2xl text-sm">Export CSV</button>
              <button onClick={() => exportAll('excel')} className="py-3 bg-[#1A2744] text-white rounded-2xl text-sm">Export Excel</button>
            </div>
            <div className="text-sm font-medium mb-3">QR Preview Grid</div>
            <div className="grid grid-cols-2 gap-3">{products.slice(0, 6).map(p => <div key={p.id} onClick={() => openQR(p)} className="bg-[#1A2744] p-4 rounded-2xl cursor-pointer text-center"><div className="h-24 flex items-center justify-center text-[#C8960C] text-xs font-mono">{p.barcode}</div><div className="text-xs mt-1 truncate">{p.name}</div></div>)}</div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div><div className="text-center py-8"><div className="mx-auto w-20 h-20 bg-[#C8960C] rounded-full flex items-center justify-center mb-4 text-[#1A2744] text-3xl font-bold">CS</div><div className="font-semibold text-xl">{user?.name}</div><div className="text-sm text-gray-400 mt-1">{user?.email}</div></div>
            <div className={`${cardBg} p-5 rounded-2xl mb-4`}><div className="font-medium mb-3 flex items-center gap-2"><Settings size={18} /> QR Settings</div><input value={qrPrefix} onChange={e => setQrPrefix(e.target.value)} className="w-full mb-3 px-4 py-2.5 rounded-xl border" /><input value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)} className="w-full mb-3 px-4 py-2.5 rounded-xl border" /><button onClick={saveSettings} className="w-full py-3 bg-[#C8960C] text-[#1A2744] rounded-2xl font-semibold">Save Settings</button></div>
          </div>
        )}
      </div>

      <div className="border-t bg-[#1A2744] flex text-sm text-white">
        {[{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'inventory', label: 'Inventory', icon: Package }, { id: 'qrcodes', label: 'QR Codes', icon: QrCode }, { id: 'profile', label: 'Profile', icon: User }].map(item => <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-[#C8960C]' : 'text-white/60'}`}><item.icon size={19} />{item.label}</button>)}
      </div>

      <AnimatePresence>{showAddModal && <div className="fixed inset-0 bg-black/50 flex items-end z-50"><motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className={`${cardBg} w-full p-6 rounded-t-3xl`}><div className="text-lg font-semibold mb-4">Add New Item</div><input placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full mb-3 px-4 py-3 border rounded-xl" /><input placeholder="Item Code" value={newItem.code} onChange={e => setNewItem({ ...newItem, code: e.target.value })} className="w-full mb-3 px-4 py-3 border rounded-xl" /><div className="flex gap-3"><button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border rounded-2xl">Cancel</button><button onClick={addItem} className="flex-1 py-3 bg-[#C8960C] text-[#1A2744] rounded-2xl font-semibold">Add Item</button></div></motion.div></div>}</AnimatePresence>

      <AnimatePresence>{showQRModal && selectedQR && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className={`${cardBg} w-full max-w-[340px] p-6 rounded-3xl`}><div className="text-center"><div className="mx-auto w-56 h-56 bg-[#1A2744] rounded-2xl flex items-center justify-center mb-4"><div className="text-[#C8960C] text-center"><div className="font-mono text-sm tracking-[3px] mb-1">{selectedQR.barcode}</div><div className="text-xs">{selectedQR.name}</div></div></div><div className="flex gap-3 mt-6"><button onClick={() => downloadQR(selectedQR, 'png')} className="flex-1 py-3 border rounded-2xl flex items-center justify-center gap-2"><Download size={16} /> PNG</button><button onClick={() => downloadQR(selectedQR, 'pdf')} className="flex-1 py-3 border rounded-2xl flex items-center justify-center gap-2"><Printer size={16} /> Print</button></div></div><button onClick={() => setShowQRModal(false)} className="mt-6 w-full py-3 text-sm text-gray-400">Close</button></div></div>}</AnimatePresence>
    </div>
  );
}
