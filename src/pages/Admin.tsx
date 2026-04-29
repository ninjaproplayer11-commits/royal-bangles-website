import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, Product } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import SalesChart from '../components/SalesChart';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateInvoice } from '../utils/invoiceGenerator';

const Admin: React.FC = () => {
  const { products, categories, refreshProducts, addCategory, deleteCategory, adminUser, logout, coupons, addCoupon, deleteCoupon, updateOrderStatus, storeSettings, taxSettings, flashSale, saveStoreSettings, saveTaxSettings, saveFlashSale, bulkDeleteProducts, bulkUpdateProducts, toggleFeaturedProduct, deleteReview } = useShop();
  const [activeTab, setActiveTab] = useState<'list'|'orders'|'analytics'|'coupons'|'categories'|'newsletter'|'form'|'customers'|'settings'|'flashsale'|'returns'|'reviews'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [newCatName, setNewCatName] = useState('');
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, expiry: '', type: 'percentage', singleUse: false });
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');

  // Store settings local state
  const [localSettings, setLocalSettings] = useState({ storeName: '', logo: '', phone: '', email: '', address: '', instagram: '', facebook: '', whatsapp: '' });
  const [localTax, setLocalTax] = useState<Record<string, number>>({});
  const [localSale, setLocalSale] = useState({ active: false, discount: 10, label: 'Flash Sale', endTime: '' });

  // UI State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const deleteAllProducts = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete EVERY masterpiece? This cannot be undone.')) return;
    setLoading(true);
    try {
      const pCol = collection(db, 'products');
      const snap = await getDocs(pCol);
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'products', d.id)));
      await Promise.all(deletePromises);
      await refreshProducts();
      alert('Inventory cleared. 🌪️');
    } catch (e) {
      alert('Clear failed.');
    } finally {
      setLoading(false);
    }
  };

  // Load All Orders for Admin
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setAllOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubNews = onSnapshot(collection(db, 'newsletter'), (snap) => {
      setNewsletterSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Load all users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Load all reviews
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      setAllReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub(); unsubNews(); unsubReviews(); unsubUsers(); };
  }, []);

  // Sync settings into local state when loaded
  useEffect(() => {
    if (storeSettings && Object.keys(storeSettings).length > 0) setLocalSettings(s => ({ ...s, ...storeSettings }));
  }, [storeSettings]);
  useEffect(() => {
    if (taxSettings && Object.keys(taxSettings).length > 0) setLocalTax(taxSettings);
  }, [taxSettings]);
  useEffect(() => {
    if (flashSale) setLocalSale(s => ({ ...s, ...flashSale }));
  }, [flashSale]);
  
  const resetForm = () => {
    setCurrentProduct({ category: categories[0] || '', stock: 10, rating: 5, reviews: 0 });
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const cloudName = 'dcruls60r';
    const uploadPreset = 'gpfzk293';

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
        else alert(`Upload failed: ${data.error?.message}`);
      }

      if (uploadedUrls.length > 0) {
        setCurrentProduct(prev => {
          const existingImages: string[] = prev.images || (prev.image ? [prev.image] : []);
          const allImages = [...existingImages, ...uploadedUrls];
          return { ...prev, images: allImages, image: allImages[0] };
        });
      }
    } catch (e) {
      alert('Network Error. Please check your internet.');
    } finally {
      setUploading(false);
      // Reset input so same files can be re-selected
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setCurrentProduct(prev => {
      const imgs = [...(prev.images || [])];
      imgs.splice(index, 1);
      return { ...prev, images: imgs, image: imgs[0] || '' };
    });
  };

  const setMainImage = (index: number) => {
    setCurrentProduct(prev => {
      const imgs = [...(prev.images || [])];
      const [selected] = imgs.splice(index, 1);
      const reordered = [selected, ...imgs];
      return { ...prev, images: reordered, image: reordered[0] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = { ...currentProduct, updatedAt: new Date().toISOString() };
      if (isEditing && currentProduct.id) {
        await setDoc(doc(db, 'products', currentProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      await refreshProducts();
      setActiveTab('list');
      resetForm();
    } catch (e) { alert('Error saving.'); } finally { setLoading(false); }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.expiry) return;
    setLoading(true);
    try {
      await addCoupon(newCoupon);
      setNewCoupon({ code: '', discount: 10, expiry: '', type: 'percentage', singleUse: false });
      alert('Coupon Created! 🎟️✨');
    } catch (err: any) { alert('Failed to add coupon.'); } finally { setLoading(false); }
  };

  const filteredProducts = (products || []).filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = products.filter(p => (p.stock ?? 99) <= 5).length;

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelectedIds(filteredProducts.map(p => p.id));
  const clearSelection = () => setSelectedIds([]);

  const filteredOrders = allOrders.filter(o => {
    const matchSearch = !orderSearch || o.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) || o.address?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchFrom = !orderDateFrom || new Date(o.createdAt) >= new Date(orderDateFrom);
    const matchTo = !orderDateTo || new Date(o.createdAt) <= new Date(orderDateTo + 'T23:59:59');
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-10 text-center lg:text-left">
          <div>
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-gold mb-2 italic">Store Manager</h1>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Admin Console • {adminUser?.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { id: 'list', label: 'Inventory', icon: '💎', badge: lowStockCount > 0 ? lowStockCount : null },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'analytics', label: 'Analytics', icon: '💰' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' },
              { id: 'customers', label: 'Customers', icon: '👥' },
              { id: 'returns', label: 'Returns', icon: '🔄' },
              { id: 'coupons', label: 'Coupons', icon: '🎟️' },
              { id: 'categories', label: 'Categories', icon: '📁' },
              { id: 'newsletter', label: 'Newsletter', icon: '📧' },
              { id: 'flashsale', label: 'Flash Sale', icon: '⚡' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'form', label: '+ New', icon: '✨' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); if(tab.id === 'form' && !isEditing) resetForm(); }}
                className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 relative ${
                  activeTab === tab.id ? 'bg-gold text-luxury-black shadow-lg shadow-gold/20' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{tab.badge}</span>
                )}
              </button>
            ))}
            <button onClick={logout} className="px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all ml-4">Logout</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <input type="text" placeholder="Filter inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-gold/30 transition-all" />
                <div className="flex gap-4 flex-wrap justify-center">
                  <button onClick={deleteAllProducts} className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">🌪️ Clear All</button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gold/10 border border-gold/30 rounded-2xl p-6 flex flex-wrap gap-4 items-center">
                  <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{selectedIds.length} selected</span>
                  <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-xs outline-none">
                    <option value="">Change Category...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={async () => { if (bulkCategory) { await bulkUpdateProducts(selectedIds, { category: bulkCategory }); clearSelection(); setBulkCategory(''); }}} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-[9px] font-bold uppercase">Apply Category</button>
                  <input type="number" value={bulkStock} onChange={e => setBulkStock(e.target.value)} placeholder="Set stock..." className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-xs outline-none w-28" />
                  <button onClick={async () => { if (bulkStock) { await bulkUpdateProducts(selectedIds, { stock: Number(bulkStock) }); clearSelection(); setBulkStock(''); }}} className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-[9px] font-bold uppercase">Set Stock</button>
                  <button onClick={async () => { if(window.confirm(`Delete ${selectedIds.length} products?`)) { await bulkDeleteProducts(selectedIds); clearSelection(); }}} className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-[9px] font-bold uppercase">Delete All</button>
                  <button onClick={clearSelection} className="text-white/30 text-[9px] font-bold uppercase ml-auto">Clear</button>
                </motion.div>
              )}

              {/* Select All */}
              <div className="flex items-center gap-4">
                <button onClick={selectedIds.length === filteredProducts.length ? clearSelection : selectAll} className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-colors">
                  {selectedIds.length === filteredProducts.length ? '☑ Deselect All' : '☐ Select All'}
                </button>
                {lowStockCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1 rounded-full text-[9px] font-bold uppercase">⚠️ {lowStockCount} Low Stock</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(p => {
                  const isLow = (p.stock ?? 99) <= 5;
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div key={p.id} className={`bg-[#111] border rounded-[2rem] overflow-hidden group transition-all ${isSelected ? 'border-gold shadow-lg shadow-gold/10' : isLow ? 'border-red-500/30' : 'border-white/5 hover:border-gold/30'}`}>
                      <div className="aspect-square relative overflow-hidden">
                        <img src={p.image || 'https://i.ibb.co/VWVx6Z8/logo-gold.png'} onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/VWVx6Z8/logo-gold.png'; }} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="" />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="px-3 py-1 bg-black/60 rounded-full text-[8px] font-bold uppercase text-gold">{p.category}</span>
                          {isLow && <span className="px-3 py-1 bg-red-500/80 rounded-full text-[8px] font-bold uppercase text-white">⚠️ Low Stock: {p.stock}</span>}
                          {!isLow && p.stock !== undefined && <span className="px-3 py-1 bg-black/60 rounded-full text-[8px] font-bold uppercase text-white/50">Stock: {p.stock}</span>}
                          {p.isFeatured && <span className="px-3 py-1 bg-gold/80 rounded-full text-[8px] font-bold uppercase text-luxury-black">⭐ Featured</span>}
                        </div>
                        {/* Checkbox */}
                        <button onClick={() => toggleSelect(p.id)} className={`absolute top-4 right-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-gold border-gold text-luxury-black' : 'bg-black/40 border-white/20 text-transparent hover:border-gold'}`}>
                          ✓
                        </button>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-playfair font-bold mb-1 italic">{p.name}</h3>
                        <p className="text-xl font-bold text-gold italic mb-1">₹{p.price}</p>
                        {p.sizes && p.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.sizes.map(s => {
                              const sizeStock = (p as any).stockBySize?.[s];
                              return (
                                <span key={s} className={`text-[8px] border px-2 py-1 rounded-full font-bold flex items-center gap-1 ${sizeStock !== undefined && sizeStock <= 3 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-gold/10 border-gold/20 text-gold'}`}>
                                  {s}
                                  {sizeStock !== undefined && <span className="text-[7px] opacity-70">({sizeStock})</span>}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.tags.map(t => <span key={t} className="text-[8px] bg-white/5 border border-white/10 px-2 py-1 rounded-full text-white/40">#{t}</span>)}
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                          <button onClick={() => { const normalized = { ...p, images: p.images?.length ? p.images : (p.image ? [p.image] : []) }; setCurrentProduct(normalized); setIsEditing(true); setActiveTab('form'); }} className="px-3 py-3 bg-white/5 hover:bg-gold hover:text-luxury-black rounded-xl text-[9px] font-bold uppercase">Edit</button>
                          <button onClick={() => toggleFeaturedProduct(p.id)} className={`px-3 py-3 rounded-xl text-[9px] font-bold uppercase transition-all ${p.isFeatured ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-white/5 hover:bg-gold/10 text-white/40'}`}>⭐</button>
                          <button onClick={async () => { if(window.confirm('Delete?')) { await deleteDoc(doc(db, 'products', p.id)); refreshProducts(); }}} className="px-3 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-bold uppercase">Del</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : activeTab === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
                <div className="flex-1">
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">Search Order / Customer</label>
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Order ID or customer name..." className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-gold/30 transition-all" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">Status</label>
                  <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-gold">
                    {['All','Pending','Confirmed','Processing','Shipped','Delivered','Cancelled','Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">From</label>
                  <input type="date" value={orderDateFrom} onChange={e => setOrderDateFrom(e.target.value)} className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">To</label>
                  <input type="date" value={orderDateTo} onChange={e => setOrderDateTo(e.target.value)} className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none" />
                </div>
                <button onClick={() => { setOrderSearch(''); setOrderStatusFilter('All'); setOrderDateFrom(''); setOrderDateTo(''); }} className="text-[9px] font-bold uppercase text-white/30 hover:text-gold transition-colors px-4 py-4">Clear</button>
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-4">{filteredOrders.length} orders found</p>
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-[#111] p-10 rounded-[3rem] border border-white/5 grid grid-cols-1 lg:grid-cols-4 gap-10">
                  <div className="lg:col-span-1 border-r border-white/5 pr-10">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Order Ref</p>
                    <p className="text-sm font-bold font-mono text-gold mb-4">{order.orderId}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-sm font-bold">{order.address?.name}</p>
                    <p className="text-[10px] text-white/20">{order.address?.phone}</p>
                    <p className="text-[9px] text-white/20 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Items Summary</p>
                    <div className="space-y-3">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex gap-4 items-center">
                          <img src={item.image} className="w-10 h-10 object-cover rounded-lg" alt="" />
                          <p className="text-xs font-bold">{item.name} <span className="text-white/40">x{item.quantity} {item.size && `• Size: ${item.size}`}</span></p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] leading-relaxed text-white/30">{order.address?.line1}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Order Status</p>
                      <select 
                        disabled={order.status === 'Cancelled'}
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)} 
                        className={`w-full bg-[#1A1A1A] border border-white/10 p-3 rounded-xl text-[10px] font-bold uppercase transition-all ${order.status === 'Cancelled' ? 'text-red-500 border-red-500/30 opacity-50' : order.status === 'Refunded' ? 'text-blue-400 border-blue-400/30' : 'text-gold'}`}
                      >
                        {['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled','Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {order.status === 'Cancelled' && order.cancellationReason && (
                        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <p className="text-[8px] text-red-500 uppercase tracking-widest font-bold mb-1">Cancellation Reason</p>
                          <p className="text-[10px] text-white/50 italic leading-relaxed">"{order.cancellationReason}"</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Payment</p>
                        <p className="text-xs font-bold">{order.paymentMethod} • ₹{Math.max(0, order.total)}</p>
                      </div>
                      <button onClick={() => generateInvoice(order)} className="text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/30 px-4 py-2 rounded-xl hover:bg-gold hover:text-luxury-black transition-all">📄</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'analytics' ? (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'Total Revenue', value: `₹${allOrders.reduce((acc, o) => acc + Math.max(0, (o.total || 0)), 0).toLocaleString()}`, icon: '💰' },
                  { label: 'Total Orders', value: allOrders.length, icon: '📦' },
                  { label: 'Active Customers', value: new Set(allOrders.map(o => o.userId)).size, icon: '👑' },
                  { label: 'Avg. Order Value', value: `₹${Math.round(allOrders.reduce((acc, o) => acc + Math.max(0, (o.total || 0)), 0) / (allOrders.length || 1)).toLocaleString()}`, icon: '📈' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-[100%] transition-transform group-hover:scale-110" />
                    <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] mb-4">{stat.label}</p>
                    <h4 className="text-4xl font-playfair font-bold text-gold italic">{stat.value}</h4>
                    <span className="absolute bottom-6 right-8 text-2xl opacity-20">{stat.icon}</span>
                  </div>
                ))}
              </div>

              {/* Sales Charts */}
              <SalesChart orders={allOrders} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Top Products */}
                <div className="bg-[#111] p-12 rounded-[4rem] border border-white/5">
                  <h3 className="text-2xl font-playfair font-bold mb-10 italic text-gold">Most Coveted Masterpieces</h3>
                  <div className="space-y-8">
                    {(() => {
                      const counts: any = {};
                      allOrders.forEach(o => o.items.forEach((i: any) => counts[i.name] = (counts[i.name] || 0) + i.quantity));
                      return Object.entries(counts)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]: any, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                              <span className="text-gold/40 font-playfair italic text-xl">0{idx + 1}</span>
                              <p className="text-sm font-bold text-white/80 group-hover:text-gold transition-colors">{name}</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-white">{count}</span>
                              <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Sold</span>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-[#111] p-12 rounded-[4rem] border border-white/5">
                  <h3 className="text-2xl font-playfair font-bold mb-10 italic text-gold">Order Status Breakdown</h3>
                  <div className="space-y-6">
                    {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
                      const count = allOrders.filter(o => o.status === status).length;
                      const pct = allOrders.length > 0 ? (count / allOrders.length) * 100 : 0;
                      const colors: Record<string, string> = {
                        Pending: 'bg-yellow-500', Confirmed: 'bg-blue-400', Processing: 'bg-purple-400',
                        Shipped: 'bg-orange-400', Delivered: 'bg-green-500', Cancelled: 'bg-red-500'
                      };
                      return (
                        <div key={status}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{status}</span>
                            <span className="text-[10px] font-bold text-white/50">{count}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[status]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'coupons' ? (
            <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto bg-[#111] p-16 rounded-[3rem] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-playfair font-bold mb-10 text-gold italic">Coupons Control</h2>
              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-end">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Promo Code</label>
                  <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. ROYAL50" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Discount Value ({newCoupon.type === 'percentage' ? '%' : '₹'})</label>
                  <input type="number" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})} placeholder={newCoupon.type === 'percentage' ? '%' : '₹'} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Expiry Date</label>
                  <input type="date" value={newCoupon.expiry} onChange={e => setNewCoupon({...newCoupon, expiry: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Discount Type</label>
                  <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 h-[52px]">
                  <input type="checkbox" id="singleUse" checked={newCoupon.singleUse} onChange={e => setNewCoupon({...newCoupon, singleUse: e.target.checked})} className="w-4 h-4 accent-gold" />
                  <label htmlFor="singleUse" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">One Time Use Only</label>
                </div>
                <button type="submit" className="lg:col-span-1 bg-gold text-luxury-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-light transition-all h-[52px]">Create Promo Code</button>
              </form>
              <div className="space-y-4">
                {(coupons || []).map((c: any) => (
                  <div key={c.id} className="flex justify-between p-6 bg-white/5 rounded-2xl border border-white/5 items-center">
                    <div>
                      <span className="text-lg font-bold text-gold">{c.code}</span> 
                      <span className="text-[10px] text-white/40 font-bold ml-2">
                        {c.type === 'fixed' ? `₹${c.discount}` : `${c.discount}%`} OFF
                        {c.singleUse && <span className="ml-2 text-purple-400 opacity-60">• ONE TIME USE</span>}
                      </span>
                    </div>
                    <button onClick={() => deleteCoupon(c.id)} className="text-red-500 text-[10px] font-bold">Delete</button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'customers' ? (
            <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-playfair font-bold text-gold italic">Customer List</h2>
                <button onClick={() => {
                  const csv = 'Email,Orders,Total Spend,Loyalty Points\n' + allUsers.map(u => {
                    const userOrders = allOrders.filter(o => o.userId === u.id);
                    const spend = userOrders.reduce((a: number, o: any) => a + Math.max(0, (o.total || 0)), 0);
                    return `${u.profile?.email || u.id},${userOrders.length},${spend},${u.loyaltyPoints || 0}`;
                  }).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
                }} className="bg-gold/10 border border-gold/30 text-gold px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all">Export CSV</button>
              </div>
              <div className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Registered</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Customer</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Stats (T/D/C)</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Total Spend</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Loyalty Pts</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Tier</th>
                      <th className="text-right p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => {
                      const userOrders = allOrders.filter(o => o.userId === u.id);
                      const deliveredOrders = userOrders.filter(o => o.status === 'Delivered').length;
                      const cancelledOrders = userOrders.filter(o => o.status === 'Cancelled').length;
                      const spend = userOrders.reduce((a: number, o: any) => a + Math.max(0, (o.total || 0)), 0);
                      const pts = u.loyaltyPoints || 0;
                      const tier = pts >= 5000 ? 'Royal' : pts >= 2000 ? 'Platinum' : pts >= 500 ? 'Gold' : 'Silver';
                      const tierColor: Record<string,string> = { Royal: 'text-purple-400', Platinum: 'text-blue-300', Gold: 'text-gold', Silver: 'text-white/40' };
                      
                      // Status Logic
                      const lastSeenDate = u.lastSeen ? new Date(u.lastSeen) : null;
                      const isOnline = lastSeenDate && (Date.now() - lastSeenDate.getTime() < 45000); // 45 seconds timeout
                      
                      return (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-5">
                            <p className="text-[10px] font-bold text-white/60">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Legacy'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-white/10'}`} />
                              <span className={`text-[7px] font-bold uppercase tracking-tighter ${isOnline ? 'text-green-500' : 'text-white/20'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <p className="font-bold text-sm">{u.profile?.name || 'Member'}</p>
                              <p className="text-[9px] text-white/30 truncate max-w-[150px]">{u.email || u.id}</p>
                              {u.profile?.phone && <p className="text-[9px] text-gold/60">{u.profile.phone}</p>}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <p className="font-bold text-gold text-sm">{userOrders.length} Total</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest">{deliveredOrders} Del.</span>
                                <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">{cancelledOrders} Can.</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 font-bold">₹{spend.toLocaleString()}</td>
                          <td className="p-5 font-bold">{pts}</td>
                          <td className={`p-5 font-bold text-[10px] uppercase tracking-widest ${tierColor[tier]}`}>{tier}</td>
                          <td className="p-5 text-right">
                            <p className="text-[10px] font-bold text-white/60">
                              {lastSeenDate ? lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                            </p>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest">
                              {lastSeenDate ? lastSeenDate.toLocaleDateString() : '-'}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allUsers.length === 0 && <p className="text-white/20 italic text-center py-10">No customers yet.</p>}
              </div>
            </motion.div>

          ) : activeTab === 'returns' ? (
            <motion.div key="returns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-3xl font-playfair font-bold text-gold italic mb-8">Returns & Refunds</h2>
              {allOrders.filter(o => o.status === 'Delivered' || o.status === 'Refunded').length === 0 ? (
                <div className="text-center py-20 bg-[#111] rounded-[3rem] border border-white/5">
                  <p className="text-white/20 italic">No delivered or refunded orders yet.</p>
                </div>
              ) : allOrders.filter(o => o.status === 'Delivered' || o.status === 'Refunded').map(order => (
                <div key={order.id} className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Order</p>
                    <p className="font-bold text-gold font-mono">{order.orderId}</p>
                    <p className="text-sm text-white/60 mt-1">{order.address?.name} • ₹{Math.max(0, order.total)}</p>
                    <p className="text-[9px] text-white/20 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest ${order.status === 'Refunded' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                      {order.status}
                    </span>
                    {order.status !== 'Refunded' && (
                      <button onClick={() => { if(window.confirm('Mark this order as Refunded?')) updateOrderStatus(order.id, 'Refunded'); }} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-5 py-2 rounded-xl text-[9px] font-bold uppercase hover:bg-blue-500 hover:text-white transition-all">
                        Mark Refunded
                      </button>
                    )}
                    <button onClick={() => generateInvoice(order)} className="text-gold text-[9px] font-bold uppercase border border-gold/30 px-4 py-2 rounded-xl hover:bg-gold hover:text-luxury-black transition-all">📄 Invoice</button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'reviews' ? (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-3xl font-playfair font-bold text-gold italic mb-8">Customer Reviews</h2>
              <div className="bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Product</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">User</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Rating</th>
                      <th className="text-left p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Comment</th>
                      <th className="text-right p-5 text-[9px] font-bold uppercase tracking-widest text-white/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReviews.map(review => {
                      const product = products.find(p => p.id === review.productId);
                      return (
                        <tr key={review.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-5">
                            <p className="font-bold text-sm">{product?.name || 'Unknown Product'}</p>
                            <p className="text-[9px] text-white/30">{review.productId.slice(0, 8)}</p>
                          </td>
                          <td className="p-5">
                            <p className="font-bold text-sm">{review.userName}</p>
                            <p className="text-[9px] text-white/30">{review.userId.slice(0, 8)}</p>
                          </td>
                          <td className="p-5">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-[10px] ${i < review.rating ? 'text-gold' : 'text-white/10'}`}>★</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-5">
                            <p className="text-xs text-white/60 line-clamp-2 max-w-xs">{review.comment}</p>
                            <p className="text-[8px] text-white/20 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => { if(window.confirm('Delete this review?')) deleteReview(review.id, review.productId); }}
                              className="text-red-500 text-[10px] font-bold uppercase hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allReviews.length === 0 && <p className="text-white/20 italic text-center py-10">No reviews found.</p>}
              </div>
            </motion.div>
          

          ) : activeTab === 'flashsale' ? (
            <motion.div key="flashsale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-[#111] p-16 rounded-[3rem] border border-white/10 shadow-2xl space-y-10">
              <h2 className="text-3xl font-playfair font-bold text-gold italic">Flash Sale Manager</h2>
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Sale Active</span>
                <button onClick={() => setLocalSale(s => ({ ...s, active: !s.active }))} className={`w-14 h-7 rounded-full transition-all relative ${localSale.active ? 'bg-gold shadow-lg shadow-gold/20' : 'bg-white/10'}`}>
                  <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white transition-all ${localSale.active ? 'left-8' : 'left-1.5'}`} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">Banner Label</label>
                  <input type="text" value={localSale.label} onChange={e => setLocalSale(s => ({ ...s, label: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all" placeholder="e.g. Royal Sale" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">Discount %</label>
                  <input type="number" value={localSale.discount} onChange={e => setLocalSale(s => ({ ...s, discount: Number(e.target.value) }))} min={1} max={90} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">End Date & Time</label>
                  <input type="datetime-local" value={localSale.endTime} onChange={e => setLocalSale(s => ({ ...s, endTime: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all" />
                </div>
              </div>
              <button onClick={async () => { setLoading(true); await saveFlashSale(localSale); setLoading(false); alert('Flash sale saved! ⚡'); }} disabled={loading} className="w-full bg-gold text-luxury-black py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-light transition-all">
                {loading ? 'Saving...' : 'Save Flash Sale'}
              </button>
            </motion.div>

          ) : activeTab === 'settings' ? (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto">
              {/* Store Info */}
              <div className="bg-[#111] p-12 rounded-[3rem] border border-white/10 space-y-8">
                <h2 className="text-2xl font-playfair font-bold text-gold italic">Store Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: 'storeName', label: 'Store Name', placeholder: 'Royal Bangles' },
                    { key: 'phone', label: 'Phone', placeholder: '+91 99999 99999' },
                    { key: 'email', label: 'Email', placeholder: 'hello@royalbangles.com' },
                    { key: 'address', label: 'Address', placeholder: 'City, State' },
                    { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                    { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                    { key: 'pinterest', label: 'Pinterest URL', placeholder: 'https://pinterest.com/...' },
                    { key: 'twitter', label: 'Twitter URL', placeholder: 'https://twitter.com/...' },
                    { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '919999999999' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">{label}</label>
                      <input type="text" value={(localSettings as any)[key] || ''} onChange={e => setLocalSettings(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest block mb-2">Logo URL</label>
                  <input type="text" value={localSettings.logo || ''} onChange={e => setLocalSettings(s => ({ ...s, logo: e.target.value }))} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all" />
                </div>
                <button onClick={async () => { setLoading(true); await saveStoreSettings(localSettings); setLoading(false); alert('Store settings saved! ✅'); }} disabled={loading} className="bg-gold text-luxury-black px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-light transition-all">
                  {loading ? 'Saving...' : 'Save Store Settings'}
                </button>
              </div>

              {/* Tax Settings */}
              <div className="bg-[#111] p-12 rounded-[3rem] border border-white/10 space-y-8">
                <h2 className="text-2xl font-playfair font-bold text-gold italic">GST / Tax Settings</h2>
                <p className="text-white/30 text-sm">Set GST % per category. Leave 0 for tax-free.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map(cat => (
                    <div key={cat} className="flex items-center gap-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 w-32 flex-shrink-0">{cat}</label>
                      <div className="flex items-center gap-2 flex-1">
                        <input type="number" value={localTax[cat] || 0} onChange={e => setLocalTax(t => ({ ...t, [cat]: Number(e.target.value) }))} min={0} max={28} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold/40 transition-all" />
                        <span className="text-white/30 text-sm font-bold">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={async () => { setLoading(true); await saveTaxSettings(localTax); setLoading(false); alert('Tax settings saved! ✅'); }} disabled={loading} className="bg-gold text-luxury-black px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-light transition-all">
                  {loading ? 'Saving...' : 'Save Tax Settings'}
                </button>
              </div>
            </motion.div>

          ) : activeTab === 'newsletter' ? (
            <motion.div key="newsletter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto bg-[#111] p-16 rounded-[3rem] border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-playfair font-bold text-gold italic">Newsletter Subscribers</h2>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{newsletterSubs.length} total subscribers</p>
                </div>
                <button
                  onClick={() => {
                    const csv = 'Email,Date\n' + newsletterSubs.map(s => `${s.email},${new Date(s.subscribedAt).toLocaleDateString()}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click();
                  }}
                  className="bg-gold/10 border border-gold/30 text-gold px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all"
                >
                  Export CSV
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {newsletterSubs.length === 0 ? (
                  <p className="text-white/20 italic text-center py-10">No subscribers yet.</p>
                ) : newsletterSubs.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold">{sub.email}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'categories' ? (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto bg-[#111] p-16 rounded-[3rem] border border-white/10">
              <h2 className="text-3xl font-playfair font-bold mb-10 text-gold italic">Inventory Categories</h2>
              <div className="flex gap-4 mb-12">
                <input type="text" placeholder="New category..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 bg-transparent border-b border-white/10 py-4 text-sm" />
                <button onClick={() => { if(newCatName) { addCategory(newCatName); setNewCatName(''); }}} className="bg-gold text-luxury-black px-10 py-4 rounded-xl text-[10px] font-bold uppercase">Create</button>
              </div>
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat} className="flex justify-between p-6 bg-white/5 rounded-2xl border border-white/5 items-center">
                    <span className="text-lg font-playfair font-bold italic">{cat}</span>
                    <button onClick={() => deleteCategory(cat)} className="text-red-500 text-[10px] font-bold">Remove</button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111] border border-white/5 rounded-[3rem] p-20 max-w-5xl mx-auto shadow-2xl">
              <h2 className="text-4xl font-playfair font-bold mb-16 text-gold italic">{isEditing ? 'Edit Masterpiece' : 'Publish New Masterpiece'}</h2>
              <form onSubmit={handleSave} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Product Name</label>
                    <input type="text" required value={currentProduct.name || ''} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-5 text-lg outline-none font-playfair italic" placeholder="Enter name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Price (INR ₹)</label>
                    <input type="number" required value={currentProduct.price || ''} onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-5 text-lg outline-none" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Category</label>
                    <select value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} className="w-full bg-[#1A1A1A] border-b border-white/10 py-5 text-sm outline-none">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-white/30 ml-1">General Stock</label>
                    <input type="number" value={currentProduct.stock || ''} onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-5 text-lg outline-none" placeholder="e.g. 50" />
                  </div>
                  <div className="py-3 md:col-span-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-4">Sizes & Stock Per Size</p>
                    {/* Preset size toggle buttons */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {['2', '4', '6', '8', '10'].map(s => {
                        const selected = (currentProduct.sizes || []).includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              const prev = currentProduct.sizes || [];
                              const updated = selected ? prev.filter(x => x !== s) : [...prev, s];
                              // Remove stockBySize entry if deselected
                              const prevStock = (currentProduct as any).stockBySize || {};
                              if (selected) { delete prevStock[s]; }
                              setCurrentProduct({ ...currentProduct, sizes: updated, stockBySize: prevStock } as any);
                            }}
                            className={`w-12 h-12 rounded-full border-2 text-[11px] font-bold transition-all duration-200 ${selected ? 'bg-gold border-gold text-luxury-black shadow-lg shadow-gold/20' : 'bg-transparent border-white/15 text-white/50 hover:border-gold/50 hover:text-white'}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-size stock inputs — only for selected sizes */}
                    {(currentProduct.sizes || []).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-5">
                        {(currentProduct.sizes || []).map(size => {
                          const stockVal = ((currentProduct as any).stockBySize || {})[size] ?? '';
                          return (
                            <div key={size} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-gold/30 transition-all">
                              <span className="text-gold font-bold text-sm">Size {size}</span>
                              <input
                                type="number"
                                min={0}
                                value={stockVal}
                                onChange={e => {
                                  const prev = (currentProduct as any).stockBySize || {};
                                  const updated = { ...prev, [size]: Number(e.target.value) };
                                  // Also update total stock as sum
                                  const total = Object.values(updated).reduce((a: number, b) => a + (b as number), 0);
                                  setCurrentProduct({ ...currentProduct, stockBySize: updated, stock: total } as any);
                                }}
                                className="w-full bg-transparent border-b border-white/20 text-center text-lg font-bold outline-none text-white py-1 focus:border-gold/50 transition-all"
                                placeholder="0"
                              />
                              <span className="text-[8px] text-white/30 uppercase tracking-widest">units</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom sizes text input */}
                    <input
                      type="text"
                      value={(currentProduct.sizes || []).filter(s => !['2','4','6','8','10'].includes(s)).join(', ')}
                      onChange={(e) => {
                        const presets = (currentProduct.sizes || []).filter(s => ['2','4','6','8','10'].includes(s));
                        const custom = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setCurrentProduct({ ...currentProduct, sizes: [...presets, ...custom] } as any);
                      }}
                      className="bg-transparent border-b border-white/10 py-3 text-sm outline-none w-full text-white/60"
                      placeholder="Custom sizes (e.g. 2.4, 2.6, 2.8) — comma separated"
                    />

                    {(currentProduct.sizes || []).length > 0 && (
                      <p className="text-[9px] text-gold/60 mt-3 font-bold uppercase tracking-widest">
                        Selected: {currentProduct.sizes!.join(' · ')} &nbsp;·&nbsp; Total Stock: {currentProduct.stock ?? 0}
                      </p>
                    )}
                  </div>
                  <input type="text" value={(currentProduct as any).tags?.join(', ') || ''} onChange={(e) => setCurrentProduct({...currentProduct, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)} as any)} className="bg-transparent border-b border-white/10 py-5 text-lg outline-none" placeholder="Tags (e.g. gold, kundan, bridal)" />
                  <input type="number" value={currentProduct.originalPrice || ''} onChange={(e) => setCurrentProduct({...currentProduct, originalPrice: Number(e.target.value)})} className="bg-transparent border-b border-white/10 py-5 text-lg outline-none" placeholder="Original Price (for discount display)" />
                </div>
                <div className="flex gap-6 flex-wrap">
                  {[
                    { key: 'isNew', label: '🆕 New Arrival' },
                    { key: 'isBestSeller', label: '🏆 Best Seller' },
                    { key: 'isFeatured', label: '⭐ Featured on Home' },
                    { key: 'showInGallery', label: '🖼️ Show in Gallery' },
                  ].map(({ key, label }) => (
                    <label key={key} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border cursor-pointer transition-all ${(currentProduct as any)[key] ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                      <input type="checkbox" checked={!!(currentProduct as any)[key]} onChange={e => setCurrentProduct({ ...currentProduct, [key]: e.target.checked } as any)} className="accent-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Product Images <span className="text-gold">(first image = main)</span></p>

                  {/* Existing images grid */}
                  {(currentProduct.images && currentProduct.images.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {currentProduct.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white/10 hover:border-gold/50 transition-all">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          {/* Main badge */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-gold text-luxury-black text-[7px] font-bold uppercase px-2 py-1 rounded-full">Main</span>
                          )}
                          {/* Set as main */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setMainImage(idx)}
                              className="absolute top-2 left-2 bg-black/70 text-white text-[7px] font-bold uppercase px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set Main
                            </button>
                          )}
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Add more slot */}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-gold/40 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gold/5">
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <span className="text-2xl mb-1">{uploading ? '⏳' : '+'}</span>
                        <span className="text-[8px] font-bold uppercase text-white/30">{uploading ? 'Uploading...' : 'Add More'}</span>
                      </label>
                    </div>
                  )}

                  {/* Empty state — first upload */}
                  {(!currentProduct.images || currentProduct.images.length === 0) && (
                    <label className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/5 transition-all min-h-[200px]">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <span className="text-4xl mb-4">{uploading ? '⏳' : '📸'}</span>
                      <span className="text-[10px] font-bold uppercase text-white/40 mb-1">
                        {uploading ? 'Uploading to Vault...' : 'Upload Images'}
                      </span>
                      <span className="text-[9px] text-white/20">Select multiple files at once</span>
                    </label>
                  )}

                  {/* Paste URL */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      id="pasteUrl"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs outline-none focus:border-gold/40 transition-all"
                      placeholder="Or paste an image URL and press +"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setCurrentProduct(prev => {
                              const imgs = [...(prev.images || []), val];
                              return { ...prev, images: imgs, image: imgs[0] };
                            });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('pasteUrl') as HTMLInputElement;
                        const val = input?.value.trim();
                        if (val) {
                          setCurrentProduct(prev => {
                            const imgs = [...(prev.images || []), val];
                            return { ...prev, images: imgs, image: imgs[0] };
                          });
                          input.value = '';
                        }
                      }}
                      className="bg-gold text-luxury-black px-5 py-3 rounded-2xl text-sm font-bold hover:bg-gold-light transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
                <textarea rows={4} value={currentProduct.description || ''} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 text-sm outline-none" placeholder="Craftsmanship Narrative..." />
                <div className="flex gap-6">
                  <PremiumButton variant="primary" type="submit" className="flex-1 py-6 text-sm" disabled={loading || uploading}>{isEditing ? 'Update Masterpiece' : 'Publish Masterpiece'}</PremiumButton>
                  <button type="button" onClick={() => setActiveTab('list')} className="px-12 py-6 border border-white/10 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
