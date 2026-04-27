import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '../context/ShopContext';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (p: Product) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCompare = (p: Product) => {
    if (compareList.length >= 3 || compareList.some(c => c.id === p.id)) return;
    setCompareList(prev => [...prev, p]);
    setIsOpen(true);
  };

  const removeFromCompare = (id: string) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const isInCompare = (id: string) => compareList.some(p => p.id === id);
  const clearCompare = () => { setCompareList([]); setIsOpen(false); };

  const specs = ['price', 'category', 'rating', 'stock'];
  const specLabels: Record<string, string> = { price: 'Price', category: 'Category', rating: 'Rating', stock: 'Stock' };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-[#111] border border-gold/30 rounded-[2rem] px-8 py-4 shadow-2xl shadow-gold/10 flex items-center gap-6"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{compareList.length}/3 Selected</span>
            <div className="flex gap-3">
              {compareList.map(p => (
                <div key={p.id} className="relative">
                  <img src={p.image} className="w-10 h-10 rounded-xl object-cover border border-gold/30" alt="" />
                  <button onClick={() => removeFromCompare(p.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white">✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gold text-luxury-black px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
            >
              Compare
            </button>
            <button onClick={clearCompare} className="text-white/30 hover:text-white text-[10px] font-bold uppercase">Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {isOpen && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] overflow-auto p-6"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-10 pt-10">
                <h2 className="text-3xl font-playfair font-bold italic text-gold">Compare Masterpieces</h2>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-2xl">✕</button>
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
                {/* Header row */}
                <div />
                {compareList.map(p => (
                  <div key={p.id} className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden">
                    <div className="aspect-square relative">
                      <img src={p.image} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeFromCompare(p.id)} className="absolute top-3 right-3 w-7 h-7 bg-black/60 rounded-full text-white/60 hover:text-white text-sm flex items-center justify-center">✕</button>
                    </div>
                    <div className="p-6">
                      <p className="text-[9px] text-gold font-bold uppercase tracking-widest mb-1">{p.category}</p>
                      <h3 className="font-playfair font-bold italic text-lg leading-tight">{p.name}</h3>
                    </div>
                  </div>
                ))}

                {/* Spec rows */}
                {specs.map(spec => (
                  <React.Fragment key={spec}>
                    <div className="flex items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{specLabels[spec]}</span>
                    </div>
                    {compareList.map(p => (
                      <div key={p.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center justify-center">
                        {spec === 'price' && <span className="text-xl font-playfair font-bold text-gold italic">₹{(p as any)[spec]}</span>}
                        {spec === 'rating' && (
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < ((p as any)[spec] || 5) ? 'fill-gold' : 'fill-white/10'}`} viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            ))}
                          </div>
                        )}
                        {spec === 'stock' && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${(p as any)[spec] > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(p as any)[spec] > 0 ? `${(p as any)[spec]} left` : 'Out of Stock'}
                          </span>
                        )}
                        {spec === 'category' && <span className="text-sm font-bold">{(p as any)[spec]}</span>}
                      </div>
                    ))}
                  </React.Fragment>
                ))}

                {/* CTA row */}
                <div />
                {compareList.map(p => (
                  <div key={p.id} className="flex justify-center">
                    <Link
                      to={`/product/${p.id}`}
                      onClick={() => setIsOpen(false)}
                      className="bg-gold text-luxury-black px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
