import React from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import PremiumButton from '../components/PremiumButton';
import PremiumFooter from '../components/PremiumFooter';

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 5);

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins overflow-hidden">
      <div className="pt-48 pb-32 px-6 flex flex-col items-center justify-center">
        
        {/* Success Animation */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-32 h-32 bg-gold rounded-full flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
        >
          <span className="text-6xl text-luxury-black">✓</span>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 italic text-gold">Order Confirmed</h1>
          <p className="text-white/60 text-lg mb-12 leading-relaxed">
            Your royal selection has been received. Our master craftsmen are now preparing your masterpieces for shipment.
          </p>

          <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 mb-12 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Order Reference</p>
              <p className="text-xl font-bold text-gold tracking-widest font-mono">{orderId || 'RB-XXXXXX'}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Estimated Arrival</p>
              <p className="text-xl font-bold">{estimatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/shop">
              <PremiumButton variant="primary" className="px-12 py-5 text-sm">Continue Collection</PremiumButton>
            </Link>
            <Link to="/profile?tab=orders">
              <button className="px-12 py-5 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Track My Order</button>
            </Link>
          </div>
        </motion.div>

      </div>
      <PremiumFooter />
    </div>
  );
};

export default OrderSuccess;
