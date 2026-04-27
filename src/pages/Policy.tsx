import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PremiumFooter from '../components/PremiumFooter';

const Policy: React.FC = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const policies: Record<string, { title: string, content: React.ReactNode }> = {
    'shipping-policy': {
      title: 'Shipping Policy',
      content: (
        <div className="space-y-8">
          <p className="text-white/60 leading-relaxed">At Royal Bangles, we ensure that your luxury acquisitions reach you in pristine condition and with regal speed.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
              <h4 className="text-gold font-bold mb-4 uppercase tracking-widest text-xs">Processing Time</h4>
              <p className="text-sm text-white/40">Every piece is inspected for quality before dispatch. Orders are processed within 24-48 hours.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
              <h4 className="text-gold font-bold mb-4 uppercase tracking-widest text-xs">Delivery Timeline</h4>
              <p className="text-sm text-white/40">Domestic orders (India) typically arrive within 3-7 business days via our premium express partners.</p>
            </div>
          </div>
          <p className="text-sm text-white/40 italic">* We offer complimentary insured shipping on all orders above ₹999.</p>
        </div>
      )
    },
    'returns-exchange': {
      title: 'Returns & Exchange',
      content: (
        <div className="space-y-8">
          <p className="text-white/60 leading-relaxed">Your satisfaction is our ultimate priority. If a piece does not meet your expectations, we offer a seamless return process.</p>
          <ul className="space-y-4 text-sm text-white/40">
            <li className="flex gap-4"><span>✨</span> 7-Day Hassle-Free Returns from the date of delivery.</li>
            <li className="flex gap-4"><span>✨</span> Items must be unworn, in original packaging with all tags intact.</li>
            <li className="flex gap-4"><span>✨</span> Exchange is available for different sizes or designs of equal value.</li>
          </ul>
          <div className="p-8 bg-red-500/5 rounded-3xl border border-red-500/10 mt-8">
            <p className="text-xs text-red-500/60 uppercase tracking-widest font-bold">Note</p>
            <p className="text-sm text-white/40">Customized or engraved pieces are not eligible for returns unless defective.</p>
          </div>
        </div>
      )
    },
    'jewelry-care': {
      title: 'Jewelry Care Guide',
      content: (
        <div className="space-y-8">
          <p className="text-white/60 leading-relaxed">Preserve the eternal shine of your Royal Bangles masterpieces with these care instructions.</p>
          <div className="grid grid-cols-1 gap-6">
            {[
              { t: 'Avoid Chemicals', d: 'Remove jewelry before using perfumes, hairsprays, or detergents.' },
              { t: 'Water Protection', d: 'Keep away from water. Remove before swimming or showering.' },
              { t: 'Safe Storage', d: 'Store each piece separately in the provided velvet box to avoid scratches.' },
              { t: 'Gentle Cleaning', d: 'Clean only with a soft, dry microfiber cloth after every use.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start p-6 bg-white/5 rounded-2xl">
                <span className="text-gold">✦</span>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{item.t}</h4>
                  <p className="text-xs text-white/40">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    'size-guide': {
      title: 'Bangle Size Guide',
      content: (
        <div className="space-y-8">
          <p className="text-white/60 leading-relaxed">Finding your perfect fit is essential for elegance and comfort.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 text-gold text-xs uppercase tracking-widest">Bangle Size</th>
                  <th className="py-4 text-gold text-xs uppercase tracking-widest">Inner Diameter (Inches)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-white/40">
                <tr className="border-b border-white/5"><td className="py-4 font-bold text-white">2.2</td><td className="py-4">2.125"</td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-bold text-white">2.4</td><td className="py-4">2.25"</td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-bold text-white">2.6</td><td className="py-4">2.375"</td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-bold text-white">2.8</td><td className="py-4">2.5"</td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-bold text-white">3.0</td><td className="py-4">2.625"</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-white/20 italic mt-8 font-bold uppercase tracking-widest">Tip: Measure the diameter of an existing bangle that fits you perfectly.</p>
        </div>
      )
    }
  };

  const currentPolicy = type ? policies[type] : null;

  if (!currentPolicy) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-gold uppercase tracking-widest text-xs border border-gold/30 px-8 py-4 rounded-full">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white font-poppins">
      <div className="pt-48 pb-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-16 md:p-24"
          >
            <h1 className="text-5xl md:text-7xl font-playfair font-bold italic mb-16 text-shadow-gold text-center">{currentPolicy.title}</h1>
            <div className="prose prose-invert max-w-none">
              {currentPolicy.content}
            </div>
            
            <div className="mt-20 pt-10 border-t border-white/5 flex justify-center">
              <button onClick={() => navigate('/shop')} className="bg-gold text-luxury-black px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:scale-105 transition-all">Continue Shopping</button>
            </div>
          </motion.div>
        </div>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Policy;
