import React from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';

const RecentlyViewed: React.FC<{ excludeId?: string }> = ({ excludeId }) => {
  const { recentlyViewed, products } = useShop();

  const recentProducts = recentlyViewed
    .filter(id => id !== excludeId)
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 4) as any[];

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-24">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-[1px] flex-1 bg-white/5" />
        <h2 className="text-2xl font-playfair font-bold italic text-white/60 whitespace-nowrap">Recently Viewed</h2>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {recentProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
