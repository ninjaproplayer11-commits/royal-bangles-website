import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import PremiumButton from '../components/PremiumButton';
import PremiumFooter from '../components/PremiumFooter';
import ProductCard from '../components/ProductCard';
import LoyaltyWidget from '../components/LoyaltyWidget';
import ReferralWidget from '../components/ReferralWidget';
import { generateInvoice } from '../utils/invoiceGenerator';

const Profile: React.FC = () => {
  const { currentUser, logout, wishlist, orders, addresses, addAddress, deleteAddress, products, updateOrderStatus, toggleWishlist, addToCart, shareWishlist } = useShop();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', city: '', state: '', pincode: '', isDefault: false });
  const [shareMsg, setShareMsg] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const wishlistProducts = products.filter(p => (wishlist || []).includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress({ id: Date.now().toString(), ...newAddress });
    setIsAddingAddress(false);
    setNewAddress({ name: '', phone: '', line1: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '✨' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'wishlist', label: 'Treasury', icon: '💎' },
    { id: 'addresses', label: 'Addresses', icon: '🏠' },
    { id: 'loyalty', label: 'Loyalty', icon: '👑' },
  ];

  return (
    <div className="min-h-screen bg-luxury-black text-white font-poppins">
      <div className="pt-40 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            
            {/* Luxury Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] border border-white/5 p-10 rounded-[3.5rem] sticky top-40 shadow-2xl">
                <div className="relative group mb-8">
                  <div className="w-24 h-24 bg-gold/10 rounded-full mx-auto flex items-center justify-center border border-gold/20 text-3xl font-playfair font-bold text-gold group-hover:scale-110 transition-transform duration-500">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-playfair font-bold text-center mb-1">{currentUser.displayName || 'Royal Member'}</h2>
                <p className="text-white/20 text-[10px] uppercase tracking-widest text-center mb-12">{currentUser.email}</p>
                
                <nav className="space-y-3">
                  {tabs.map(tab => (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)} 
                      className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                        activeTab === tab.id ? 'bg-gold text-luxury-black shadow-xl shadow-gold/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span> {tab.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all mt-10">
                    <span className="text-lg">🚪</span> Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 group hover:border-gold/30 transition-all">
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] mb-4">Acquisitions</p>
                        <h4 className="text-5xl font-playfair font-bold text-gold italic">{orders?.length || 0}</h4>
                      </div>
                      <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 group hover:border-gold/30 transition-all">
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] mb-4">Treasury Pieces</p>
                        <h4 className="text-5xl font-playfair font-bold text-gold italic">{wishlist?.length || 0}</h4>
                      </div>
                      <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 group hover:border-gold/30 transition-all">
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] mb-4">Member Tier</p>
                        <h4 className="text-5xl font-playfair font-bold text-gold italic">Elite</h4>
                      </div>
                    </div>                    
                    <div className="bg-[#111] p-16 rounded-[4rem] border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-colors" />
                      <h3 className="text-4xl font-playfair font-bold mb-8 italic text-gold leading-tight">Welcome to the <br/>Royal Inner Circle</h3>
                      <p className="text-white/40 text-sm leading-relaxed mb-12 max-w-lg">As a distinguished member of Royal Bangles, you have exclusive access to our master artisans' newest creations and priority fulfillment on every order.</p>
                      <PremiumButton onClick={() => navigate('/shop')} variant="primary" className="px-12 py-5 text-xs">Explore New Arrivals</PremiumButton>
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="mb-12">
                      <h2 className="text-4xl font-playfair font-bold italic mb-2">My Acquisitions</h2>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                        Live tracking — updates instantly
                      </p>
                    </div>
                    
                    {(orders || []).length > 0 ? (
                      [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
                        const stages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
                        const labels = ['Received', 'Verified', 'Crafting', 'En Route', 'Arrived'];
                        const icons = ['📋', '✅', '⚒️', '🚚', '🏠'];
                        const currentIdx = stages.indexOf(order.status);
                        const progressPct = currentIdx < 0 ? 0 : Math.round((currentIdx / (stages.length - 1)) * 100);
                        const isCancelled = order.status === 'Cancelled';
                        const isRefunded = order.status === 'Refunded';
                        const isDelivered = order.status === 'Delivered';

                        const statusColors: Record<string, string> = {
                          Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                          Confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                          Processing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                          Shipped: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
                          Delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
                          Cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
                          Refunded: 'text-blue-300 bg-blue-300/10 border-blue-300/20',
                        };

                        const estimatedDelivery = new Date(order.createdAt);
                        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

                        return (
                          <motion.div
                            key={order.id}
                            layout
                            className={`bg-[#111] p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                              isDelivered ? 'border-green-500/20' : isCancelled ? 'border-red-500/10' : 'border-white/5 hover:border-gold/20'
                            }`}
                          >
                            {/* Delivered glow */}
                            {isDelivered && <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />}

                            {/* Top row */}
                            <div className="flex flex-wrap justify-between items-start gap-6 mb-8 pb-8 border-b border-white/5">
                              <div>
                                <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-1">Order Reference</p>
                                <p className="text-base font-bold font-mono text-gold tracking-widest">{order.orderId}</p>
                                <p className="text-[9px] text-white/20 mt-1">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${statusColors[order.status] || 'text-white/40 bg-white/5 border-white/10'}`}>
                                  {order.status}
                                </span>
                                <p className="text-2xl font-playfair font-bold italic text-gold">₹{Math.max(0, order.total)}</p>
                              </div>
                            </div>

                            {/* Progress Tracker */}
                            {!isCancelled && !isRefunded ? (
                              <div className="mb-10">
                                <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-6">Masterpiece Journey</p>
                                <div className="relative pt-2 pb-8">
                                  {/* Track line */}
                                  <div className="absolute left-0 right-0 h-[2px] bg-white/5 top-[18px] z-0 rounded-full" />
                                  <div
                                    className="absolute left-0 h-[2px] bg-gradient-to-r from-gold to-gold/60 top-[18px] z-0 rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                  <div className="flex justify-between relative z-10">
                                    {stages.map((stage, i) => {
                                      const done = i <= currentIdx;
                                      const active = i === currentIdx;
                                      return (
                                        <div key={stage} className="flex flex-col items-center gap-2 w-1/5">
                                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${
                                            active
                                              ? 'bg-gold border-gold text-luxury-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.6)]'
                                              : done
                                              ? 'bg-gold/20 border-gold text-gold'
                                              : 'bg-[#1A1A1A] border-white/10 text-white/20'
                                          }`}>
                                            {icons[i]}
                                          </div>
                                          <p className={`text-[8px] font-bold uppercase tracking-wider text-center leading-tight transition-colors duration-500 ${
                                            done ? 'text-gold' : 'text-white/20'
                                          }`}>{labels[i]}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ETA */}
                                {!isDelivered && (
                                  <div className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-2xl px-6 py-4 mt-2">
                                    <span className="text-lg">📅</span>
                                    <div>
                                      <p className="text-[9px] text-white/30 uppercase tracking-widest">Estimated Delivery</p>
                                      <p className="text-xs font-bold text-white/70">{estimatedDelivery.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                    </div>
                                    {order.status === 'Shipped' && (
                                      <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-400/10 border border-orange-400/20 px-3 py-1 rounded-full animate-pulse">
                                        Out for Delivery
                                      </span>
                                    )}
                                  </div>
                                )}
                                {isDelivered && (
                                  <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-2xl px-6 py-4 mt-2">
                                    <span className="text-lg">🎉</span>
                                    <p className="text-xs font-bold text-green-400">Your masterpiece has arrived! We hope you love it.</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`flex items-center gap-4 rounded-2xl px-6 py-5 mb-8 border ${isCancelled ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-400/5 border-blue-400/20'}`}>
                                <span className="text-2xl">{isCancelled ? '❌' : '↩️'}</span>
                                <div>
                                  <p className={`text-sm font-bold ${isCancelled ? 'text-red-400' : 'text-blue-300'}`}>
                                    {isCancelled ? 'Order Cancelled' : 'Refund Initiated'}
                                  </p>
                                  <p className="text-[9px] text-white/30 mt-1">
                                    {isCancelled 
                                      ? (order.paymentMethod === 'COD' ? 'This order was cancelled successfully.' : 'This order was cancelled. Refund will be processed within 5–7 business days.')
                                      : 'Your refund is being processed. Allow 5–7 business days.'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Items */}
                            <div className="space-y-4 mb-8">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-5 items-center bg-white/3 rounded-2xl p-4 border border-white/5">
                                  <div className="w-14 h-14 bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover" alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/VWVx6Z8/logo-gold.png'; }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold font-playfair italic truncate">{item.name}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">
                                      Qty: {item.quantity} · ₹{item.price} {item.size && `· Size ${item.size}`}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-gold flex-shrink-0">₹{item.price * item.quantity}</p>
                                </div>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-white/5">
                              <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase tracking-widest">
                                <span>💳</span> {order.paymentMethod || 'COD'}
                              </div>
                              <div className="flex items-center gap-6">
                                <button onClick={() => generateInvoice(order)} className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline decoration-gold/30 flex items-center gap-2">
                                  Download Invoice 📄
                                </button>
                                {order.status === 'Pending' && (
                                  <button
                                    onClick={() => setCancellingOrderId(order.id)}
                                    className="text-red-500/50 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-40 bg-[#111] rounded-[3rem] border border-white/5">
                        <div className="text-6xl mb-6 opacity-10">📦</div>
                        <p className="text-white/20 italic font-playfair text-xl">No acquisitions recorded yet.</p>
                        <button onClick={() => navigate('/shop')} className="mt-6 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline">Start Shopping</button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Wishlist / Treasury Tab */}
                {activeTab === 'wishlist' && (
                  <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <div className="mb-12">
                      <div className="flex justify-between items-end">
                        <div>
                          <h2 className="text-4xl font-playfair font-bold italic mb-2">The Treasury</h2>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">Pieces you've curated for your collection</p>
                        </div>
                        {wishlistProducts.length > 0 && (
                          <button
                            onClick={() => {
                              const url = shareWishlist();
                              navigator.clipboard.writeText(url);
                              setShareMsg('Link copied!');
                              setTimeout(() => setShareMsg(''), 2000);
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-gold/60 hover:text-gold transition-colors border border-gold/20 px-6 py-3 rounded-xl hover:bg-gold/5"
                          >
                            🔗 Share Wishlist
                          </button>
                        )}
                      </div>
                      {shareMsg && <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mt-2">{shareMsg}</p>}
                    </div>

                    {wishlistProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {wishlistProducts.map(p => (
                          <div key={p.id} className="relative group flex flex-col">
                            <ProductCard product={p} />
                            <div className="mt-6 flex gap-4">
                              <button 
                                onClick={() => { addToCart(p.id); toggleWishlist(p.id); }}
                                className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-500"
                              >
                                Move to Cart
                              </button>
                              <button 
                                onClick={() => toggleWishlist(p.id)}
                                className="px-6 bg-white/5 border border-white/10 py-4 rounded-2xl text-red-500/60 hover:text-red-500 transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-40 text-center glass-card">
                        <div className="text-6xl mb-8 opacity-10">💎</div>
                        <p className="text-white/20 italic font-playfair text-xl">Your treasury is empty. <br/>Start curating your collection.</p>
                        <button onClick={() => navigate('/shop')} className="mt-8 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline">Explore Collection</button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-4xl font-playfair font-bold italic mb-2">Shipping Vault</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest">Saved addresses for express fulfillment</p>
                      </div>
                      <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="bg-gold text-luxury-black text-[9px] font-bold uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-gold/20 hover:bg-gold-light transition-all">Add New Address</button>
                    </div>

                    {isAddingAddress && (
                      <motion.form 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSaveAddress} 
                        className="bg-[#111] p-12 rounded-[3.5rem] border border-gold/20 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl"
                      >
                        <input placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-gold/50 transition-all" required />
                        <input placeholder="Phone Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-gold/50 transition-all" required />
                        <input placeholder="House No / Street" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm md:col-span-2 outline-none focus:border-gold/50 transition-all" required />
                        <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-gold/50 transition-all" required />
                        <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-gold/50 transition-all" required />
                        <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-gold/50 transition-all" required />
                        <div className="md:col-span-2 flex gap-4 mt-4">
                          <button type="submit" className="flex-1 bg-gold text-luxury-black py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-gold/20 hover:bg-gold-light transition-all">Save to Vault</button>
                          <button type="button" onClick={() => setIsAddingAddress(false)} className="px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/30 hover:bg-white/5 transition-all">Cancel</button>
                        </div>
                      </motion.form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(addresses || []).map((addr, idx) => (
                        <div key={idx} className="bg-[#111] p-10 rounded-[3rem] border border-white/5 group hover:border-gold/30 transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button onClick={() => deleteAddress(idx)} className="absolute top-8 right-8 text-red-500/40 hover:text-red-500 transition-colors z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                          <h4 className="text-xl font-playfair font-bold mb-4 italic text-white/90">{addr.name}</h4>
                          <p className="text-white/40 text-sm leading-relaxed mb-8">{addr.line1}, {addr.city}<br/>{addr.state} - {addr.pincode}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold/60">
                            <span>📱</span> {addr.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Loyalty Tab */}
                {activeTab === 'loyalty' && (
                  <motion.div key="loyalty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                    <div className="mb-12">
                      <h2 className="text-4xl font-playfair font-bold italic mb-2">Royal Loyalty</h2>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest">Earn points on every purchase, redeem for discounts</p>
                    </div>
                    <LoyaltyWidget />
                    <ReferralWidget />
                    <div className="bg-[#111] border border-white/5 rounded-[3rem] p-10">
                      <h3 className="text-2xl font-playfair font-bold italic text-gold mb-8">How It Works</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { icon: '🛍️', title: 'Shop & Earn', desc: 'Get 1 loyalty point for every ₹10 spent on any order.' },
                          { icon: '💰', title: 'Redeem Points', desc: 'Every 100 points = ₹1 discount on your next purchase.' },
                          { icon: '👑', title: 'Unlock Tiers', desc: 'Silver → Gold → Platinum → Royal. Higher tiers get exclusive perks.' },
                        ].map((item, i) => (
                          <div key={i} className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/5">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h4 className="font-bold text-gold mb-2">{item.title}</h4>
                            <p className="text-white/40 text-[10px] leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {cancellingOrderId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrderId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[3rem] p-12 shadow-2xl"
            >
              <h3 className="text-3xl font-playfair font-bold text-gold italic mb-4 text-center">Cancel Order</h3>
              <p className="text-white/40 text-center text-xs mb-8 leading-relaxed">We are sorry to see you go. Please let us know the reason for cancellation to help us improve our royal service.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-white/30 ml-1">Cancellation Reason</label>
                  <textarea 
                    autoFocus
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter your reason here..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-gold/30 transition-all min-h-[120px] resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setCancellingOrderId(null)}
                    className="py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Go Back
                  </button>
                  <button 
                    disabled={!cancellationReason.trim()}
                    onClick={() => {
                      updateOrderStatus(cancellingOrderId, 'Cancelled', cancellationReason);
                      setCancellingOrderId(null);
                      setCancellationReason('');
                    }}
                    className="py-4 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PremiumFooter />
    </div>
  );
};

export default Profile;
