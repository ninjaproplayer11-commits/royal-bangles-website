import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useShop, Product } from '../context/ShopContext';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, currentUser } = useShop();
  const navigate = useNavigate();
  
  if (!product) return null;

  const id = product.id || 'unknown';
  const name = product.name || 'Luxury Jewelry Piece';
  const price = product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const image = product.image || '';
  const rating = product.rating || 5;
  const reviews = product.reviews || 0;
  const isNew = product.isNew || false;
  const isBestSeller = product.isBestSeller || false;
  const category = product.category || 'Fine Jewelry';

  // Calculate discount percentage
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-[#111] border border-white/5 transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-2xl group-hover:shadow-gold/10">
        
        {/* Luxury Badges */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex flex-col gap-2">
          {isNew && (
            <span className="bg-gold text-luxury-black text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg shadow-gold/20">
              New Arrival
            </span>
          )}
          {isBestSeller && (
            <span className="bg-white text-luxury-black text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
              Collection Hero
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Shortcut */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(id);
          }}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:text-gold transition-all duration-300 active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isInWishlist(id) ? 'fill-gold stroke-gold' : 'fill-none'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* High-Quality Image with Zoom */}
        <Link to={`/product/${id}`} className="block h-full w-full">
          <img
            src={image || 'https://i.ibb.co/VWVx6Z8/logo-gold.png'}
            alt={name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.ibb.co/VWVx6Z8/logo-gold.png';
            }}
            className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
          />
          
          {/* Elegant Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-8 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                if (!currentUser) {
                  navigate('/auth');
                  return;
                }
                addToCart(id, product.sizes?.[0]);
              }}
              className="bg-gold text-luxury-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:bg-gold-light transition-colors"
            >
              Add to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                if (!currentUser) {
                  navigate('/auth');
                  return;
                }
                addToCart(id, product.sizes?.[0]);
                navigate('/checkout');
              }}
              className="bg-white text-luxury-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white/90 transition-colors"
            >
              Buy Now
            </motion.button>
          </div>
        </Link>
      </div>

      {/* Content Section */}
      <div className="mt-8 px-2 text-center flex flex-col flex-1">
        <p className="text-[9px] uppercase tracking-[0.4em] text-gold/60 mb-3 font-bold">{category}</p>
        <Link to={`/product/${id}`}>
            <h3 className="font-playfair text-2xl text-white group-hover:text-gold transition-colors duration-500 mb-3 italic">
              {name}
            </h3>
          </Link>

          {/* Hand Sizes Display */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {product.sizes.map(size => (
                <span key={size} className="text-[7px] font-bold border border-white/10 px-2 py-1 rounded-md text-white/40 uppercase tracking-widest group-hover:border-gold/30 group-hover:text-gold transition-all">
                  Size {size}
                </span>
              ))}
            </div>
          )}
        
        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-gold fill-gold' : 'text-white/10'}`}
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
          <span className="text-[9px] text-white/20 ml-2 font-bold tracking-widest">({reviews})</span>
        </div>

        {/* Pricing */}
        <div className="mt-auto flex items-center justify-center gap-4">
          <span className="text-2xl font-playfair font-bold text-gold italic">₹{price}</span>
          {originalPrice > price && (
            <span className="text-sm text-white/30 line-through font-poppins">₹{originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;