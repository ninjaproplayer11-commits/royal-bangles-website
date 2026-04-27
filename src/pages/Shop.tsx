import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import PremiumFooter from '../components/PremiumFooter';

const Shop: React.FC = () => {
  const { products, categories: dynamicCategories, refreshProducts } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'featured' | 'low-high' | 'high-low' | 'newest'>('featured');
  const [priceRange, setPriceRange] = useState<number>(50000); // Default max price
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Force sync with cloud on entry
  useEffect(() => {
    refreshProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = (products || [])
    .filter(product => {
      if (!product) return false;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange;
      const matchesStock = !inStockOnly || (product.stock && product.stock > 0);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesPrice && matchesStock && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'low-high') return a.price - b.price;
      if (sortOrder === 'high-low') return b.price - a.price;
      if (sortOrder === 'newest') return b.isNew ? 1 : -1;
      return 0; // Featured/Default
    });

  const categories = ['All', ...(dynamicCategories || [])];

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins">
      {/* Category Header */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover scale-105" 
          alt="Category Banner"
        />
        <div className="relative z-20 text-center px-6">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] mb-6"
          >
            Curated Collections
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-playfair font-bold mb-8 italic"
          >
            The <span className="text-gold text-shadow-gold">Boutique</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100px' }}
            className="h-[1px] bg-gold mx-auto"
          />
        </div>
      </section>

      <div className="py-24 px-6 lg:px-12">
        <div className="container mx-auto max-w-screen-2xl">
          
          {/* Advanced Filter Bar */}
          <div className="flex flex-col gap-12 mb-24 pb-12 border-b border-white/5">
            
            {/* Top Row: Categories & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
              <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar w-full lg:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all whitespace-nowrap pb-2 border-b-2 ${
                      selectedCategory === cat ? 'text-gold border-gold' : 'text-white/30 border-transparent hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-96">
                <input 
                  type="text" 
                  placeholder="Find a masterpiece..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 text-xs outline-none focus:border-gold/30 transition-all font-bold tracking-widest"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            {/* Bottom Row: Sort, Price, Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
              
              {/* Price Filter */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Price Under: ₹{priceRange.toLocaleString()}</label>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-gold bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Sort Masterpieces By</label>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] outline-none text-gold cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* Stock Toggle */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Show Available Only</span>
                <button 
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-12 h-6 rounded-full transition-all relative ${inStockOnly ? 'bg-gold shadow-lg shadow-gold/20' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${inStockOnly ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

            </div>
          </div>

          {/* Results Count */}
          <div className="mb-12">
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Revealing {filteredProducts.length} Results</p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40 glass-card">
              <p className="text-white/40 uppercase tracking-widest text-xs font-bold italic mb-6">No masterpieces match your selection.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setPriceRange(100000); setSearchQuery(''); setInStockOnly(false); }}
                className="text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/30 px-8 py-4 rounded-xl hover:bg-gold hover:text-luxury-black transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <PremiumFooter />
    </div>
  );
};

export default Shop;