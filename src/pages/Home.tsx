import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import PremiumFooter from '../components/PremiumFooter';
import PremiumButton from '../components/PremiumButton';
import { db } from '../lib/firebase';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';

const Home: React.FC = () => {
  const { products, categories: dynamicCategories } = useShop();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'success' | 'exists'>('idle');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifyStatus('loading');
    try {
      const q = query(collection(db, 'newsletter'), where('email', '==', notifyEmail));
      const snap = await getDocs(q);
      if (!snap.empty) { setNotifyStatus('exists'); return; }
      await addDoc(collection(db, 'newsletter'), { email: notifyEmail, subscribedAt: new Date().toISOString(), source: 'bridal-edit' });
      setNotifyStatus('success');
      setNotifyEmail('');
    } catch { setNotifyStatus('idle'); }
  };

  const trendingProducts = (products || []).filter(p => p.isFeatured || p.isBestSeller || p.isNew).slice(0, 3);

  const categoryImages: Record<string, string> = {
    'Bridal': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80',
    'Festive': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80',
    'Casual': 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80',
    'Luxury': 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80',
  };

  const occasions = (dynamicCategories || []).slice(0, 4).map(cat => ({
    name: cat,
    image: categoryImages[cat] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80',
    count: `${(products || []).filter(p => p.category === cat).length}+`
  }));

  return (
    <div className="bg-luxury-black text-white">
      {/* Hero Section */}
      <section className="relative h-[110vh] overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ y: y1, scale, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-luxury-black z-10" />
          <img 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=100&w=2000" 
            alt="Luxury Jewelry"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] mb-6 block">
              The Art of Fine Craftsmanship
            </span>
            <h1 className="text-6xl md:text-9xl font-playfair font-bold mb-8 leading-none">
              Timeless <br />
              <span className="text-gold italic">Elegance</span>
            </h1>
            <p className="text-white/60 font-poppins text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Discover our curated collection of handcrafted bangles, where heritage meets modern luxury.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link to="/shop">
                <PremiumButton variant="primary" className="px-12 py-5 text-sm">Explore Collection</PremiumButton>
              </Link>
              <Link to="/about">
                <button className="text-white/80 hover:text-gold transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 group">
                  Our Story
                  <span className="h-[1px] w-8 bg-gold group-hover:w-12 transition-all duration-300"></span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </section>

      {/* Featured Occasions */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Categories</span>
              <h2 className="text-4xl md:text-6xl font-playfair font-bold">Shop by Occasion</h2>
            </div>
            <Link to="/shop" className="text-gold hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold flex items-center gap-2 group">
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {occasions.map((occ, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative h-[500px] overflow-hidden cursor-pointer"
              >
                <img 
                  src={occ.image} 
                  alt={occ.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <span className="text-gold text-[10px] font-bold tracking-widest block mb-2">{occ.count} Designs</span>
                  <h3 className="text-3xl font-playfair font-bold text-white group-hover:text-gold transition-colors">
                    {occ.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      {trendingProducts.length > 0 && (
        <section className="py-32 px-6 bg-[#0F0F0F]">
          <div className="container mx-auto max-w-7xl text-center mb-20">
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Curated Selection</span>
            <h2 className="text-4xl md:text-6xl font-playfair font-bold mb-8">Trending Masterpieces</h2>
            <div className="h-[1px] w-24 bg-gold mx-auto"></div>
          </div>

          <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-20">
            <Link to="/shop">
              <PremiumButton variant="outline" className="px-10">Discover More</PremiumButton>
            </Link>
          </div>
        </section>
      )}

      {/* Brand Trust / Features */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { 
              title: 'Handcrafted Heritage', 
              desc: 'Every piece is meticulously crafted by master artisans with decades of experience.',
              icon: '✨'
            },
            { 
              title: 'Insured Shipping', 
              desc: 'Complementary secure shipping across India, with real-time tracking and insurance.',
              icon: '📦'
            },
            { 
              title: 'Authenticity Guaranteed', 
              desc: 'Each piece comes with a certificate of authenticity and hallmarking.',
              icon: '🛡️'
            }
          ].map((feature, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500 block">{feature.icon}</div>
              <h3 className="text-2xl font-playfair font-bold mb-4 text-gold">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm font-poppins">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Urgency / Offer Banner */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gold-border-gradient p-12 md:p-20 relative overflow-hidden text-center"
          >
            <div className="relative z-10">
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block animate-pulse">Limited Edition Release</span>
              <h2 className="text-4xl md:text-7xl font-playfair font-bold mb-8">The Royal Bridal Edit</h2>
              <p className="text-white/70 max-w-2xl mx-auto mb-12 font-poppins">
                Experience the grandeur of traditional Indian jewelry. Get priority access to our upcoming collection.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                  {notifyStatus === 'success' ? (
                    <p className="text-green-500 font-bold uppercase tracking-widest text-[10px]">✓ You're on the priority list!</p>
                  ) : notifyStatus === 'exists' ? (
                    <p className="text-gold font-bold uppercase tracking-widest text-[10px]">✓ Already on the list!</p>
                  ) : (
                    <form onSubmit={handleNotify} className="flex flex-col md:flex-row gap-4 w-full justify-center">
                      <input 
                        type="email" 
                        value={notifyEmail}
                        onChange={e => setNotifyEmail(e.target.value)}
                        placeholder="Your Email" 
                        required
                        className="bg-white/5 border border-white/10 px-6 py-4 rounded-full w-full md:w-80 outline-none focus:border-gold transition-colors text-sm"
                      />
                      <PremiumButton variant="primary" type="submit" disabled={notifyStatus === 'loading'}>
                        {notifyStatus === 'loading' ? 'Saving...' : 'Notify Me'}
                      </PremiumButton>
                    </form>
                  )}
                </div>
            </div>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full animate-shimmer"></div>
          </motion.div>
        </div>
      </section>

      <PremiumFooter />
    </div>
  );
};

export default Home;