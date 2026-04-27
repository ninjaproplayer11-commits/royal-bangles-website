import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import ProductCard from '../components/ProductCard';
import PremiumFooter from '../components/PremiumFooter';

const Wishlist: React.FC = () => {
  const { wishlist, products, addToCart, toggleWishlist, isLoading } = useShop();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6" />
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Consulting the Treasury...</p>
      </div>
    );
  }

  const wishlistItems = products.filter(p => (wishlist || []).map(id => String(id)).includes(String(p.id)));

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins">
      <div className="pt-40 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-24 text-center"
          >
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] mb-6 block">Private Curation</p>
            <h1 className="text-6xl md:text-8xl font-playfair font-bold italic text-shadow-gold">The Treasury</h1>
            <div className="w-24 h-[1px] bg-gold/30 mx-auto mt-10" />
          </motion.div>

          {wishlistItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-40 glass-card"
            >
              <div className="text-8xl mb-10 opacity-10">💎</div>
              <p className="text-white/20 mb-12 text-2xl font-playfair italic tracking-widest leading-relaxed">
                Your private treasury is currently empty.<br/>
                Every masterpiece begins with a single selection.
              </p>
              <Link to="/shop">
                <PremiumButton variant="primary" className="px-16 py-6">Explore the Gallery</PremiumButton>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="relative group"
                  >
                    <ProductCard product={product} />
                    
                    {/* Quick Actions for Wishlist */}
                    <div className="mt-6 flex gap-4">
                      <button 
                        onClick={() => { addToCart(product.id); toggleWishlist(product.id); }}
                        className="flex-1 bg-gold text-luxury-black py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
                      >
                        Move to Bag
                      </button>
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-red-500/60 hover:text-red-500 transition-colors"
                        title="Remove from Treasury"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Luxury Suggestion Banner */}
          {wishlistItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-40 p-16 rounded-[4rem] bg-gradient-to-r from-gold/10 via-transparent to-gold/10 border border-white/5 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full animate-gold-shine opacity-10" />
              <h3 className="text-3xl font-playfair font-bold italic mb-6">Complete the Ensemble</h3>
              <p className="text-white/40 text-sm mb-10 max-w-xl mx-auto">Luxury is best enjoyed in pairs. Consider adding a matching necklace or ring to complete your royal look.</p>
              <PremiumButton onClick={() => navigate('/shop')} variant="secondary" className="px-12 py-4">View All Masterworks</PremiumButton>
            </motion.div>
          )}

        </div>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Wishlist;
