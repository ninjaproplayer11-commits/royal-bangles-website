import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import PremiumFooter from '../components/PremiumFooter';

const Gallery: React.FC = () => {
  const { products } = useShop();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Extract all unique images from products for the gallery
  const galleryImages = products
    .filter(p => p.image && p.showInGallery)
    .map(p => ({
      url: p.image,
      name: p.name,
      category: p.category
    }));

  return (
    <div className="bg-luxury-black text-white min-h-screen font-poppins">
      {/* Gallery Header */}
      <section className="pt-40 pb-20 px-6 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold text-[10px] font-bold uppercase tracking-[0.6em] mb-6"
        >
          Visual Poetry
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-playfair font-bold mb-8 italic"
        >
          The <span className="text-gold text-shadow-gold">Showcase</span>
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100px' }}
          className="h-[1px] bg-gold mx-auto mb-12"
        />
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] max-w-md mx-auto leading-loose">
          A curated collection of our finest masterpieces, captured in their most radiant light.
        </p>
      </section>

      {/* Masonry Grid */}
      <section className="px-6 pb-40">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            {galleryImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="relative group cursor-zoom-in overflow-hidden rounded-[2rem] border border-white/5 bg-[#111]"
                onClick={() => setSelectedImage(img.url)}
              >
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-luxury-black/40 backdrop-blur-md border border-white/10 text-gold text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                    {img.category}
                  </span>
                </div>
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <h3 className="text-xl font-playfair font-bold italic translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {galleryImages.length === 0 && (
            <div className="text-center py-40 glass-card">
              <p className="text-white/20 italic font-playfair text-xl">The gallery is currently being curated. <br/>Check back soon for new masterpieces.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-20"
          >
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors text-4xl"
            >
              ✕
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl shadow-gold/10"
              alt="Fullscreen Preview"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumFooter />
    </div>
  );
};

export default Gallery;
