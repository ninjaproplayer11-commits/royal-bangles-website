import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import PremiumFooter from '../components/PremiumFooter';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, products, toggleWishlist, wishlist, applyCoupon, percentageDiscount, fixedDiscount, isLoading, currentUser } = useShop();
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{success: boolean, message: string} | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6" />
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Consulting the Treasury...</p>
      </div>
    );
  }

  const cartItems = cart.map(item => {
    const product = products.find(p => String(p.id) === String(item.id));
    return product ? { ...product, quantity: item.quantity, size: item.size } : null;
  }).filter(Boolean) as any[];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const percentageDiscountAmount = Math.round((subtotal * (percentageDiscount || 0)) / 100);
  const total = Math.max(0, subtotal - percentageDiscountAmount - (fixedDiscount || 0));

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const result = await applyCoupon(couponCode);
    setCouponStatus(result);
  };

  const handleMoveToWishlist = (id: string, size?: string) => {
    if (!wishlist.includes(id)) toggleWishlist(id);
    removeFromCart(id, size);
  };

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins">
      <div className="pt-40 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-20 text-center"
          >
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] mb-6 block">Your Curation</p>
            <h1 className="text-6xl md:text-8xl font-playfair font-bold italic text-shadow-gold">Shopping Bag</h1>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-40 glass-card"
            >
              <div className="text-8xl mb-10 opacity-20">👜</div>
              <p className="text-white/40 mb-12 text-xl font-playfair italic tracking-widest">Your bag is awaiting its first masterpiece.</p>
              <Link to="/shop">
                <PremiumButton variant="primary" className="px-16 py-6">Begin Exploring</PremiumButton>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-10">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={`${item.id}-${item.size}`} 
                      layout
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      className="group relative flex flex-col md:flex-row gap-10 p-10 bg-white/5 border border-white/5 rounded-[3rem] hover:border-gold/20 transition-all duration-500"
                    >
                      <div className="w-full md:w-56 aspect-square overflow-hidden rounded-[2rem] bg-[#111] border border-white/5 shadow-2xl">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <p className="text-[9px] text-gold font-bold uppercase tracking-[0.4em]">{item.category}</p>
                              {item.size && <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[8px] font-bold uppercase text-white/60">Size: {item.size}</span>}
                            </div>
                            <h3 className="text-3xl font-playfair font-bold mb-4 italic leading-tight group-hover:text-gold transition-colors">{item.name}</h3>
                            <div className="flex gap-6">
                              <button 
                                onClick={() => handleMoveToWishlist(item.id, item.size)}
                                className="text-[10px] text-white/40 font-bold uppercase tracking-widest hover:text-gold transition-all flex items-center gap-2"
                              >
                                <span>✨</span> Move to Treasury
                              </button>
                              <button 
                                onClick={() => removeFromCart(item.id, item.size)}
                                className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest hover:text-red-500 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="text-3xl font-playfair font-bold text-gold italic">₹{item.price}</p>
                        </div>

                        <div className="flex justify-between items-center mt-10">
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} 
                              className="text-gold text-2xl px-4 hover:scale-125 transition-transform"
                            >
                              −
                            </button>
                            <span className="mx-8 text-sm font-bold w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} 
                              className="text-gold text-2xl px-4 hover:scale-125 transition-transform"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Subtotal</p>
                            <p className="text-xl font-bold text-white/90 font-playfair italic">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 sticky top-32">
                <div className="bg-[#111] p-12 rounded-[3.5rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                  <h3 className="text-3xl font-playfair font-bold mb-10 italic border-b border-white/5 pb-8">Order Summary</h3>
                  
                  {/* Coupon Box */}
                  <div className="mb-12 space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Gift Card / Promo Code</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE" 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-gold/40 transition-all font-bold tracking-widest"
                      />
                      <button 
                        onClick={handleApplyCoupon} 
                        className="bg-gold text-luxury-black text-[10px] font-bold uppercase px-8 rounded-2xl hover:bg-gold-light transition-all shadow-lg shadow-gold/10 flex items-center justify-center"
                      >
                        Apply
                      </button>
                    </div>
                    {couponStatus && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${couponStatus.success ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {couponStatus.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
                      <span className="text-white/40">Bag Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {percentageDiscount > 0 && (
                      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">
                        <span>Exclusive Discount ({percentageDiscount}%)</span>
                        <span>− ₹{percentageDiscountAmount}</span>
                      </div>
                    )}
                    {(fixedDiscount > 0 && !percentageDiscount) && (
                      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">
                        <span>Promo Discount Applied</span>
                        <span>− ₹{fixedDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-gold">
                      <span>Shipping & Handling</span>
                      <span>Complimentary</span>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/10 mb-12 flex justify-between items-baseline">
                    <span className="text-xl font-playfair font-bold italic">Total Amount</span>
                    <span className="text-5xl font-playfair font-bold text-gold text-shadow-gold">₹{total}</span>
                  </div>

                  <PremiumButton 
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/auth');
                      } else {
                        navigate('/checkout');
                      }
                    }} 
                    variant="primary" 
                    className="w-full py-8 text-sm shadow-2xl shadow-gold/20"
                  >
                    Proceed to Private Checkout
                  </PremiumButton>

                  <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payments</span>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Express Delivery</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/shop')}
                  className="w-full mt-8 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-gold transition-all"
                >
                  ← Continue Exploring
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Cart;