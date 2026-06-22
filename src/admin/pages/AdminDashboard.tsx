import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Camera, History, LogOut, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string; name: string; code: string; category: string; description: string; quantity: number; barcode: string;
}
interface StockTransaction { id: string; product_id: string; type: 'in' | 'out'; quantity: number; notes: string; created_at: string; }
interface ProductImage { id: string; product_id: string; image_url: string; uploaded_by: string; created_at: string; }

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'inventory' | 'barcodes' | 'photos' | 'users'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({ name: '', code: '', category: '', description: '', quantity: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);
    const { data: txData } = await supabase.from('stock_transactions').select('*').order('created_at', { ascending: false }).limit(20);
    if (txData) setTransactions(txData);
    const { data: imgData } = await supabase.from('product_images').select('*').order('created_at', { ascending: false });
    if (imgData) setProductImages(imgData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateBarcode = () => 'BAR' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ name: product.name, code: product.code, category: product.category, description: product.description, quantity: product.quantity });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', code: '', category: '', description: '', quantity: 0 });
    }
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.code) return alert('Name and Code required');
    const barcode = editingProduct?.barcode || generateBarcode();

    if (editingProduct) {
      await supabase.from('products').update({ ...productForm }).eq('id', editingProduct.id);
    } else {
      const { data: newProduct } = await supabase.from('products').insert([{ ...productForm, barcode }]).select().single();
      if (newProduct) await supabase.from('barcodes').insert([{ product_id: newProduct.id, barcode }]);
    }
    setShowProductModal(false);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setShowStockModal(true);
  };

  const updateStock = async (type: 'in' | 'out', qty: number, notes: string) => {
    if (!stockProduct) return;
    const newQty = type === 'in' ? stockProduct.quantity + qty : Math.max(0, stockProduct.quantity - qty);
    await supabase.from('products').update({ quantity: newQty }).eq('id', stockProduct.id);
    await supabase.from('stock_transactions').insert([{ product_id: stockProduct.id, type, quantity: qty, notes, created_at: new Date().toISOString() }]);
    setShowStockModal(false);
    fetchData();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)
  );

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-41px)]">
      <div className="w-64 bg-[#1e3a5f] text-white flex flex-col">
        <div className="p-6 border-b border-[#2a4f7a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded flex items-center justify-center text-[#1e3a5f] font-bold">CS</div>
            <div><div className="font-bold">CSJMU Admin</div><div className="text-xs text-[#d4af37]">Web Panel</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[{id:'dashboard',label:'Dashboard',icon:LayoutDashboard},{id:'products',label:'Manage Products',icon:Package},{id:'inventory',label:'Stock Management',icon:History},{id:'barcodes',label:'Barcode Records',icon:Search},{id:'photos',label:'Photo Gallery',icon:Camera},{id:'users',label:'Manage Users',icon:Users}].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 rounded text-left ${activeTab === tab.id ? 'active' : ''}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2a4f7a]">
          <div className="text-sm mb-3 px-2">{user?.name}</div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[#2a4f7a] rounded text-sm"><LogOut size={16} /> Logout</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {loading && <div className="text-center py-12">Loading data...</div>}

        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f] mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow card"><div className="text-[#6c757d]">Total Products</div><div className="text-4xl font-bold text-[#1e3a5f] mt-2">{totalProducts}</div></div>
              <div className="bg-white p-6 rounded-xl shadow card"><div className="text-[#6c757d]">Total Inventory Units</div><div className="text-4xl font-bold text-[#1e3a5f] mt-2">{totalStock}</div></div>
              <div className="bg-white p-6 rounded-xl shadow card"><div className="text-[#6c757d]">Recent Transactions</div><div className="text-4xl font-bold text-[#1e3a5f] mt-2">{transactions.length}</div></div>
            </div>
            <div className="bg-white rounded-xl shadow p-6"><h3 className="font-semibold mb-4">Recent Activity</h3>
              {transactions.slice(0,5).map(tx => <div key={tx.id} className="flex justify-between py-2 border-b text-sm"><span>{tx.type.toUpperCase()} • {tx.quantity} units</span><span className="text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</span></div>)}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between mb-6">
              <h1 className="text-3xl font-bold text-[#1e3a5f]">Product Management</h1>
              <button onClick={() => openProductModal()} className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-[#1e3a5f] rounded-lg font-semibold"><Plus size={18} /> Add Product</button>
            </div>
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="mb-4 w-full max-w-md px-4 py-2 border rounded-lg" />
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full"><thead className="bg-[#1e3a5f] text-white text-sm"><tr><th className="px-6 py-3 text-left">Product</th><th>Code</th><th>Category</th><th>Qty</th><th>Barcode</th><th>Actions</th></tr></thead>
                <tbody>{filteredProducts.map(p => (<tr key={p.id} className="table-row border-b"><td className="px-6 py-4 font-medium">{p.name}</td><td className="px-6 py-4 text-sm text-gray-600">{p.code}</td><td className="px-6 py-4"><span className="px-3 py-0.5 text-xs rounded-full bg-[#d4af37]/20 text-[#1e3a5f]">{p.category}</span></td><td className="px-6 py-4 font-semibold">{p.quantity}</td><td className="px-6 py-4 font-mono text-xs text-[#d4af37]">{p.barcode}</td><td className="px-6 py-4 flex gap-2"><button onClick={() => openProductModal(p)} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={15}/></button><button onClick={() => openStockModal(p)} className="px-3 py-1 text-xs bg-[#1e3a5f] text-white rounded">Stock</button><button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 size={15}/></button></td></tr>))}</tbody></table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div><h1 className="text-3xl font-bold mb-6">Stock Transactions</h1>
            <div className="bg-white rounded-xl shadow overflow-hidden"><table className="w-full text-sm"><thead className="bg-[#1e3a5f] text-white"><tr><th className="px-6 py-3">Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Notes</th></tr></thead>
              <tbody>{transactions.map(tx => <tr key={tx.id} className="border-b"><td className="px-6 py-3 text-xs">{new Date(tx.created_at).toLocaleString()}</td><td className="px-6 py-3">{products.find(pr=>pr.id===tx.product_id)?.name}</td><td><span className={`px-2 py-0.5 rounded text-xs ${tx.type==='in'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{tx.type.toUpperCase()}</span></td><td className="px-6 py-3 font-semibold">{tx.quantity}</td><td>{tx.notes}</td></tr>)}</tbody></table></div>
          </div>
        )}

        {activeTab === 'barcodes' && (
          <div><h1 className="text-3xl font-bold mb-6">Barcode Records</h1>
            <div className="grid gap-3">{products.map(p => <div key={p.id} className="bg-white p-5 rounded-xl shadow flex justify-between items-center"><div><div className="font-medium">{p.name}</div><div className="font-mono text-sm text-[#d4af37]">{p.barcode}</div></div><div className="text-right text-sm text-gray-500">{p.code}</div></div>)}</div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div><h1 className="text-3xl font-bold mb-6">Product Photo Gallery</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{productImages.length ? productImages.map(img => <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow"><img src={img.image_url} className="w-full h-40 object-cover" /><div className="p-3 text-xs text-gray-500">Uploaded {new Date(img.created_at).toLocaleDateString()}</div></div>) : <div className="col-span-4 text-center py-12 text-gray-500">No photos uploaded yet.</div>}</div>
          </div>
        )}

        {activeTab === 'users' && (
          <div><h1 className="text-3xl font-bold mb-6">System Users</h1><div className="bg-white p-8 rounded-xl"><div className="space-y-3"><div className="flex justify-between border-b pb-3"><div>admin@csjmu.ac.in</div><div className="text-[#d4af37]">Administrator</div></div><div className="flex justify-between border-b pb-3"><div>labour@csjmu.ac.in</div><div className="text-[#d4af37]">Labour / User</div></div></div></div></div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-8 modal">
            <h3 className="font-semibold text-xl mb-6">{editingProduct ? 'Edit' : 'Add'} Product</h3>
            <div className="space-y-4">
              <input placeholder="Product Name" value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} className="w-full border px-4 py-2.5 rounded-lg" />
              <input placeholder="Product Code" value={productForm.code} onChange={e=>setProductForm({...productForm,code:e.target.value})} className="w-full border px-4 py-2.5 rounded-lg" />
              <input placeholder="Category" value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value})} className="w-full border px-4 py-2.5 rounded-lg" />
              <textarea placeholder="Description" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})} className="w-full border px-4 py-2.5 rounded-lg h-20" />
              <input type="number" placeholder="Quantity" value={productForm.quantity} onChange={e=>setProductForm({...productForm,quantity:+e.target.value})} className="w-full border px-4 py-2.5 rounded-lg" />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowProductModal(false)} className="flex-1 py-3 border rounded-lg">Cancel</button>
              <button onClick={saveProduct} className="flex-1 py-3 bg-[#1e3a5f] text-white rounded-lg">Save Product</button>
            </div>
          </div>
        </div>
      )}

      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl p-8 modal">
            <h3 className="font-semibold text-xl mb-1">Update Stock: {stockProduct.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Current: {stockProduct.quantity} units</p>
            <div className="flex gap-3">
              <button onClick={() => updateStock('in', 10, 'Stock In')} className="flex-1 py-3 bg-green-600 text-white rounded-lg">+10 Stock In</button>
              <button onClick={() => updateStock('out', 5, 'Stock Out')} className="flex-1 py-3 bg-red-600 text-white rounded-lg">-5 Stock Out</button>
            </div>
            <button onClick={() => setShowStockModal(false)} className="mt-4 w-full py-3 border rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
