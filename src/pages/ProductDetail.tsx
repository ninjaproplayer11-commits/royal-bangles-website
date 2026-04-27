import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import ProductCard from '../components/ProductCard';
import PremiumFooter from '../components/PremiumFooter';
import ProductReviews from '../components/ProductReviews';
import SizeGuide from '../components/SizeGuide';
import SizeRecommender from '../components/SizeRecommender';
import RecentlyViewed from '../components/RecentlyViewed';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, currentUser, notifyWhenInStock } = useShop();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('2.4');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [notifyMsg, setNotifyMsg] = useState('');
  const { trackView } = useShop();

  const relatedProducts = (products || []).filter(p => p.category === product?.category && p.id !== id).slice(0, 4);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    if (product?.sizes?.length) setSelectedSize(product.sizes[0]);
    if (id) trackView(id);
  }, [id, product?.sizes]);

  if (!product) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-playfair font-bold text-gold mb-4 italic">Masterpiece Not Found</h2>
        <p className="text-white/40 mb-8 max-w-md">The royal piece you are looking for might have been moved or sold to another collector.</p>
        <PremiumButton onClick={() => navigate('/shop')} variant="primary" className="px-12">Return to Gallery</PremiumButton>
      </div>
    );
  }

  // Build gallery from images array, fallback to single image repeated
  const gallery = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['2.4', '2.6', '2.8'];
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="bg-luxury-black text-white min-h-screen pt-32 font-poppins overflow-hidden">
      <div className="container mx-auto px-6 pb-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left: Gallery Section */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-[#111] border border-white/5 cursor-zoom-in group"
            >
              <img 
                src={gallery[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
              />
              <div className="absolute top-6 left-6 z-10">
                {product.isNew && <span className="bg-gold text-luxury-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">New Selection</span>}
              </div>
              {/* Prev / Next arrows when multiple images */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-luxury-black transition-all z-10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % gallery.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-gold hover:text-luxury-black transition-all z-10"
                  >
                    ›
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? 'bg-gold w-6' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
            
            {/* Thumbnails — only show if more than 1 image */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {gallery.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? 'border-gold scale-105 shadow-lg shadow-gold/20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details Section */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-4">{product.category}</p>
              <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 italic leading-tight text-shadow-gold">{product.name}</h1>
              
              <div className="flex items-center gap-6 mb-10">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < (product.rating || 5) ? 'fill-gold' : 'fill-white/10'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  ))}
                  <span className="text-[10px] text-white/40 ml-2 font-bold tracking-widest self-center">({product.reviews || 0} Reviews)</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                {/* Live stock counter */}
                {!isOutOfStock && product.stock !== undefined && product.stock <= 10 ? (
                  <span className="text-orange-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    🔥 Only {product.stock} left!
                  </span>
                ) : !isOutOfStock ? (
                  <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    In Stock & Ready to Ship
                  </span>
                ) : (
                  <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mb-12">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-playfair font-bold text-gold italic">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-white/20 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
                <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest font-bold">Inclusive of all taxes & free express delivery</p>
              </div>

              {/* Size Selection */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Select Bangle Size</h4>
                  <div className="flex items-center gap-4">
                    <SizeRecommender onSelect={size => setSelectedSize(size)} />
                    <SizeGuide />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => {
                    const sizeStock = (product as any).stockBySize?.[size];
                    const outOfStock = sizeStock !== undefined && sizeStock <= 0;
                    const lowStock = sizeStock !== undefined && sizeStock > 0 && sizeStock <= 3;
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={`w-14 h-14 rounded-full border text-[10px] font-bold transition-all duration-300 relative ${
                            outOfStock
                              ? 'border-white/5 text-white/15 cursor-not-allowed line-through'
                              : selectedSize === size
                              ? 'border-gold bg-gold text-luxury-black shadow-lg shadow-gold/20'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {size}
                          {outOfStock && <span className="absolute inset-0 flex items-center justify-center"><span className="w-8 h-[1px] bg-white/20 rotate-45 absolute" /></span>}
                        </button>
                        {lowStock && !outOfStock && (
                          <span className="text-[7px] font-bold text-red-400 uppercase tracking-wider">Only {sizeStock} left</span>
                        )}
                        {outOfStock && (
                          <span className="text-[7px] font-bold text-white/20 uppercase tracking-wider">Sold out</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                {isOutOfStock ? (
                  <div className="flex-1 space-y-3">
                    <div className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/10 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Out of Stock
                    </div>
                    {currentUser ? (
                      <button
                        onClick={async () => {
                          await notifyWhenInStock(product.id);
                          setNotifyMsg('✓ We\'ll notify you when it\'s back!');
                          setTimeout(() => setNotifyMsg(''), 3000);
                        }}
                        className="w-full py-4 rounded-[2rem] border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest hover:bg-gold/5 transition-all"
                      >
                        🔔 Notify Me When Available
                      </button>
                    ) : null}
                    {notifyMsg && <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest text-center">{notifyMsg}</p>}
                  </div>
                ) : (
                  <PremiumButton onClick={() => addToCart(product.id, selectedSize)} variant="primary" className="flex-1 py-6 text-sm">Add to Private Collection</PremiumButton>
                )}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-10 py-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-center gap-3 ${isInWishlist(product.id) ? 'border-gold bg-gold/5 text-gold shadow-lg shadow-gold/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <svg className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-gold' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Wishlist</span>
                </button>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</p>
                    <p className="text-[8px] text-white/40">100% Encrypted</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</p>
                    <p className="text-[8px] text-white/40">30-Day Policy</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-32">
          <div className="flex border-b border-white/5 gap-12 mb-12">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] relative transition-colors ${activeTab === tab ? 'text-gold' : 'text-white/30 hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-gold" />}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl"
            >
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <p className="text-white/60 leading-relaxed italic font-playfair text-lg">{product.description || "Every masterpiece at Royal Bangles is a testament to India's rich jewelry heritage. Meticulously handcrafted by master artisans, this piece features intricate details that blend traditional motifs with modern elegance."}</p>
                  <p className="text-white/40 leading-relaxed text-sm">Perfect for bridal wear, grand celebrations, or making an unforgettable entrance at high-society gatherings. Each piece comes with a certificate of authenticity and a premium velvet keepsake box.</p>
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-2 gap-8 bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Metal Type</p>
                    <p className="text-sm font-bold tracking-wider">22K Gold Plated Brass</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Stones</p>
                    <p className="text-sm font-bold tracking-wider">Fine Hand-Cut Kundan & Pearls</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Craftsmanship</p>
                    <p className="text-sm font-bold tracking-wider">Traditional Jadau Work</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Warranty</p>
                    <p className="text-sm font-bold tracking-wider">1 Year Royal Coverage</p>
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <ProductReviews productId={product.id} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* You May Also Like */}
        <div className="mt-40">
          <h2 className="text-4xl font-playfair font-bold mb-16 italic text-shadow-gold text-center">Connoisseur's Choices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        <RecentlyViewed excludeId={id} />

      </div>

      {/* Mobile Sticky Acquisition Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-luxury-black/60 backdrop-blur-3xl border-t border-white/5 p-6 z-[90] flex gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => { addToCart(product.id); navigate('/cart'); }}
          className="flex-1 bg-gold text-luxury-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-gold/20"
        >
          Buy Now
        </button>
        <button 
          onClick={() => addToCart(product.id)}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </button>
      </div>

      <PremiumFooter />
    </div>
  );
};

export default ProductDetail;