import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import PremiumFooter from '../components/PremiumFooter';
import GiftWrapOption from '../components/GiftWrapOption';
import ErrorModal from '../components/ErrorModal';

const Checkout: React.FC = () => {
  const { cart, products, addresses, placeOrder, currentUser, percentageDiscount, fixedDiscount } = useShop();
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || (addresses.length > 0 ? addresses[0].id : ''));
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity, size: item.size } : null;
  }).filter(Boolean) as any[];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const percentageDiscountAmount = Math.round((subtotal * (percentageDiscount || 0)) / 100);
  const discountAmount = percentageDiscountAmount + (fixedDiscount || 0);
  const deliveryCharge = subtotal > 2000 ? 0 : 150;
  const giftWrapCharge = giftWrap ? 199 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge + giftWrapCharge);

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setPincodeStatus('valid');
    } else {
      setPincodeStatus('invalid');
    }
  };

  const initiateRazorpay = () => {
    return new Promise((resolve, reject) => {
      if (!(window as any).Razorpay) {
        reject(new Error("Razorpay SDK not loaded. Please check your internet or disable ad-blockers."));
        return;
      }

      const options = {
        key: "rzp_test_Sfwb5B8IAIuO30", // This is a test key
        amount: Math.round(finalTotal * 100), // Amount in paise
        currency: "INR",
        name: "Royal Bangles",
        description: "Exquisite Jewelry Purchase",
        image: "https://firebasestorage.googleapis.com/v0/b/store-64f33.appspot.com/o/logo.png?alt=media",
        handler: function (response: any) {
          if (response.razorpay_payment_id) {
            resolve(response.razorpay_payment_id);
          } else {
            reject(new Error("Payment failed or payment ID missing."));
          }
        },
        prefill: {
          name: currentUser?.displayName || currentUser?.email?.split('@')[0] || "Customer",
          email: currentUser?.email || "",
          contact: addresses.find(a => a.id === selectedAddressId)?.phone || ""
        },
        theme: { color: "#D4AF37" },
        modal: {
          ondismiss: function() {
            reject(new Error("Payment window closed."));
          }
        }
      };
      
      try {
        const rzp = (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          reject(new Error(response.error.description || "Payment failed."));
        });
        rzp.open();
      } catch (err: any) {
        reject(new Error("Failed to initialize Razorpay: " + err.message));
      }
    });
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) return navigate('/auth');
    if (!selectedAddressId) return alert("Select an address first!");
    
    setIsProcessing(true);
    try {
      let paymentId = 'COD_PENDING';
      
      // If not COD, trigger Razorpay
      if (paymentMethod !== 'COD') {
        paymentId = await initiateRazorpay() as string;
      }

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const orderId = await placeOrder({
        items: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image, size: i.size })),
        subtotal,
        discount: discountAmount,
        deliveryCharge,
        giftWrap,
        giftMessage: giftWrap ? giftMessage : '',
        giftWrapCharge,
        total: finalTotal,
        address: selectedAddress,
        paymentMethod,
        paymentId,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
      });
      
      navigate(`/order-success?id=${orderId}`);
    } catch (e: any) {
      console.error("Order Error:", e);
      setErrorMessage("Your payment didn't go through due to a temporary issue. Any debited amount will be refunded in 4-5 business days.");
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins">
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-7xl">
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-gold text-luxury-black shadow-lg shadow-gold/20' : 'bg-white/5 text-white/20'}`}>{s}</div>
                  {s < 3 && <div className={`w-16 h-[2px] ${step > s ? 'bg-gold' : 'bg-white/5'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                
                {/* Step 1: Address */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="text-4xl font-playfair font-bold mb-10 italic text-gold">Shipping Destination</h2>
                    <div className="space-y-6 mb-10">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`p-8 rounded-[2rem] border cursor-pointer transition-all flex items-center gap-6 ${selectedAddressId === addr.id ? 'bg-gold/5 border-gold shadow-xl shadow-gold/10' : 'bg-[#111] border-white/5 hover:border-white/20'}`}>
                          <input type="radio" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="w-5 h-5 accent-gold" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-bold">{addr.name}</h4>
                              {addr.isDefault && <span className="text-[8px] uppercase tracking-widest bg-gold text-luxury-black px-3 py-1 rounded-full font-bold">Default</span>}
                            </div>
                            <p className="text-sm text-white/40">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-[10px] text-white/20 mt-2">📞 {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                      <button onClick={() => navigate('/profile')} className="w-full p-8 border-2 border-dashed border-white/10 rounded-[2rem] text-sm font-bold uppercase tracking-widest text-white/40 hover:border-gold/40 hover:text-gold transition-all">+ Add New Address</button>
                    </div>
                    <PremiumButton onClick={() => setStep(2)} variant="primary" className="px-12 py-5" disabled={!selectedAddressId}>Continue to Summary</PremiumButton>
                  </motion.div>
                )}

                {/* Step 2: Order Review */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="text-4xl font-playfair font-bold mb-10 italic text-gold">Review Selection</h2>
                    <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden mb-10">
                      {cartItems.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="p-8 flex gap-8 items-center border-b border-white/5 last:border-0">
                          <img src={item.image} className="w-24 h-24 object-cover rounded-2xl" alt="" />
                          <div className="flex-1">
                            <h4 className="text-xl font-playfair font-bold">{item.name}</h4>
                            <p className="text-[10px] text-gold font-bold uppercase tracking-widest">
                              {item.category} • Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                            </p>
                          </div>
                          <p className="text-xl font-bold">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    {/* Gift Wrap */}
                    <div className="mb-10">
                      <GiftWrapOption
                        selected={giftWrap}
                        message={giftMessage}
                        onToggle={() => setGiftWrap(!giftWrap)}
                        onMessageChange={setGiftMessage}
                      />
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="px-10 py-5 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Back</button>
                      <PremiumButton onClick={() => setStep(3)} variant="primary" className="flex-1 py-5">Proceed to Payment</PremiumButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="text-4xl font-playfair font-bold mb-10 italic text-gold">Secure Payment</h2>
                    <div className="space-y-6 mb-10">
                      {[
                        { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', icon: '📱' },
                        { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
                        { id: 'COD', label: 'Cash on Delivery', icon: '🚚' }
                      ].map(method => (
                        <label key={method.id} className={`p-8 rounded-[2rem] border cursor-pointer transition-all flex items-center gap-6 ${paymentMethod === method.id ? 'bg-gold/5 border-gold shadow-xl shadow-gold/10' : 'bg-[#111] border-white/5 hover:border-white/20'}`}>
                          <input type="radio" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id as any)} className="w-5 h-5 accent-gold" />
                          <span className="text-3xl">{method.icon}</span>
                          <span className="text-lg font-bold">{method.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setStep(2)} className="px-10 py-5 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Back</button>
                      <PremiumButton onClick={handlePlaceOrder} variant="primary" className="flex-1 py-5" disabled={isProcessing}>
                        {isProcessing ? 'Verifying Securely...' : `Pay ₹${finalTotal} & Confirm`}
                      </PremiumButton>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Price Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 sticky top-32">
                <h3 className="text-2xl font-playfair font-bold mb-8 italic">Cart Summary</h3>
                
                {/* Pincode Checker */}
                <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block mb-3">Check Delivery Availability</label>
                  <div className="flex gap-2">
                    <input type="text" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter Pincode" className="flex-1 bg-transparent border-b border-white/10 py-2 text-sm outline-none" />
                    <button onClick={handlePincodeCheck} className="text-gold text-[10px] font-bold uppercase">Check</button>
                  </div>
                  {pincodeStatus && (
                    <p className={`text-[8px] font-bold uppercase mt-2 ${pincodeStatus === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
                      {pincodeStatus === 'valid' ? '✓ Delivery Available within 3-5 days' : '✗ Service not available at this location'}
                    </p>
                  )}
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-white/40">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {percentageDiscount > 0 && (
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-green-500">
                      <span>Exclusive Discount ({percentageDiscount}%)</span>
                      <span>- ₹{percentageDiscountAmount}</span>
                    </div>
                  )}
                  {fixedDiscount > 0 && (
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-green-500">
                      <span>{percentageDiscount > 0 ? 'Additional Rewards' : 'Rewards & Promo Discount'}</span>
                      <span>- ₹{fixedDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gold">
                    <span>Shipping</span>
                    <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-pink-400">
                      <span>🎁 Gift Wrapping</span>
                      <span>₹{giftWrapCharge}</span>
                    </div>
                  )}
                </div>
                <div className="pt-8 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-lg font-playfair font-bold italic">Final Total</span>
                  <span className="text-4xl font-playfair font-bold text-gold italic">₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <PremiumFooter />
      <ErrorModal 
        isOpen={showError} 
        onClose={() => setShowError(false)} 
        title="Checkout Issue" 
        message={errorMessage} 
      />
    </div>
  );
};

export default Checkout;