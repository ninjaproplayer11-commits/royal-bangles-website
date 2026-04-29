import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../lib/firebase';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useShop } from '../context/ShopContext';

const PremiumFooter: React.FC = () => {
  const { storeSettings } = useShop();
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'exists'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      const q = query(collection(db, 'newsletter'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) { setSubStatus('exists'); return; }
      await addDoc(collection(db, 'newsletter'), { email, subscribedAt: new Date().toISOString() });
      setSubStatus('success');
      setEmail('');
    } catch { setSubStatus('idle'); }
  };
  return (
    <footer className="bg-luxury-black border-t border-white/5 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <h3 className="text-2xl font-playfair font-bold tracking-tighter uppercase">
                <span className="text-white">{storeSettings?.storeName?.split(' ')[0] || 'ROYAL'}</span>
                <span className="text-gold ml-2">{storeSettings?.storeName?.split(' ').slice(1).join(' ') || 'BANGLES'}</span>
              </h3>
            </Link>
            <p className="text-white/50 font-poppins text-sm leading-relaxed mb-8">
              Crafting timeless elegance for the modern woman. Each piece is handcrafted with precision and passion, ensuring a legacy of beauty.
            </p>
            <div className="flex gap-4">
              {[
                { id: 'instagram', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                { id: 'facebook', icon: <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.324-1.325z"/> }
              ].map((social) => (
                <motion.a
                  key={social.id}
                  href={storeSettings?.[social.id] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, color: '#D4AF37' }}
                  className="text-white/40 transition-colors"
                  aria-label={social.id}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    {social.icon}
                  </svg>
                </motion.a>
              ))}
            </div>
            <div className="mt-10 pt-10 border-t border-white/5">
              <h4 className="text-gold font-playfair font-bold text-xs mb-4 uppercase tracking-[0.2em]">Our Boutique</h4>
              <p className="text-white/40 text-[11px] leading-relaxed font-poppins italic">
                {storeSettings?.address || '123 Heritage Lane, Old City, \nJewelry District, Jaipur, Rajasthan 302001'}
              </p>
              <p className="text-white/20 text-[9px] mt-2 uppercase tracking-widest font-bold">
                Mon - Sat: 10:00 AM - 8:00 PM
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gold font-playfair font-bold text-lg mb-8">Collection</h4>
            <ul className="space-y-4">
              {[
                { name: 'Bridal Sets', path: '/shop?category=Bridal' },
                { name: 'Daily Wear', path: '/shop?category=Daily Wear' },
                { name: 'Festive Special', path: '/shop?category=Festive' },
                { name: 'Limited Edition', path: '/shop?category=Limited' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-white/60 hover:text-white transition-colors text-sm font-poppins">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-playfair font-bold text-lg mb-8">Client Care</h4>
            <ul className="space-y-4">
              {[
                { name: 'Shipping Policy', slug: 'shipping-policy' },
                { name: 'Returns & Exchange', slug: 'returns-exchange' },
                { name: 'Jewelry Care', slug: 'jewelry-care' },
                { name: 'Size Guide', slug: 'size-guide' }
              ].map((item) => (
                <li key={item.slug}>
                  <Link to={`/policy/${item.slug}`} className="text-white/60 hover:text-white transition-colors text-sm font-poppins">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gold font-playfair font-bold text-lg mb-8">Newsletter</h4>
            <p className="text-white/50 text-sm mb-6">Join the Royal Circle for exclusive access to new arrivals and offers.</p>
            {subStatus === 'success' ? (
              <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">✓ You're on the list! Welcome to the Royal Circle.</p>
            ) : subStatus === 'exists' ? (
              <p className="text-gold text-[10px] font-bold uppercase tracking-widest">✓ Already subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-gold outline-none transition-colors pr-10"
                />
                <button type="submit" disabled={subStatus === 'loading'} className="absolute right-0 top-1/2 -translate-y-1/2 text-gold hover:text-white transition-colors disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
            &copy; 2026 ROYAL BANGLES. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-white/30 text-[10px] uppercase tracking-widest font-bold">
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-gold transition-colors opacity-20 hover:opacity-100">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
