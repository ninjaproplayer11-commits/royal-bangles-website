import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, Product } from '../context/ShopContext';

const LuxuryNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, wishlist, currentUser, products, storeSettings } = useShop();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const cartCount = (cart || []).reduce((acc, item) => {
    const exists = products.some(p => String(p.id) === String(item.id));
    return exists ? acc + item.quantity : acc;
  }, 0);

  const wishlistCount = (wishlist || []).filter(id => 
    products.some(p => String(p.id) === String(id))
  ).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live Search Logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Heritage', path: '/about' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-[100] transition-all duration-700 ${
        isScrolled 
          ? 'bg-luxury-black/80 backdrop-blur-2xl border-b border-white/5 py-3' 
          : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-playfair font-bold tracking-[0.2em] text-white group-hover:text-gold transition-colors duration-500 uppercase">
              {storeSettings?.storeName?.split(' ')[0] || 'ROYAL'}
            </span>
            <span className="text-[8px] uppercase tracking-[0.8em] text-gold font-bold">
              {storeSettings?.storeName?.split(' ').slice(1).join(' ') || 'BANGLES'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative group overflow-hidden">
              <span className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${
                location.pathname === item.path ? 'text-gold' : 'text-white/60 group-hover:text-white'
              }`}>
                {item.name}
              </span>
              <motion.div
                layoutId={location.pathname === item.path ? "activeNav" : undefined}
                className={`absolute bottom-0 left-0 h-[1px] bg-gold w-full origin-left transition-transform duration-500 ${
                  location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* Live Search Trigger */}
          <div className="relative" ref={searchRef}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white/60 hover:text-gold transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute right-0 mt-8 w-80 md:w-96 bg-[#111] border border-white/5 rounded-[2rem] shadow-2xl p-6 backdrop-blur-2xl"
                >
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search masterworks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-gold/30 transition-all"
                  />
                  
                  {suggestions.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {suggestions.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => { navigate(`/product/${p.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
                        >
                          <img src={p.image} className="w-12 h-12 object-cover rounded-xl" alt="" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest group-hover:text-gold transition-colors">{p.name}</p>
                            <p className="text-[9px] text-white/30 italic">₹{p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/wishlist" className="relative group">
            <svg className="w-5 h-5 text-white/60 group-hover:text-gold transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-luxury-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg shadow-gold/30">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="relative group">
            <svg className="w-5 h-5 text-white/60 group-hover:text-gold transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-luxury-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg shadow-gold/30">{cartCount}</span>
            )}
          </Link>

          {localStorage.getItem('royal_bangles_admin_auth') === 'true' && (
            <Link to="/admin">
              <button className="hidden md:flex items-center gap-2 bg-gold/10 border border-gold/30 px-5 py-3 rounded-full hover:bg-gold hover:text-luxury-black transition-all group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold group-hover:text-luxury-black">
                  Store Manager
                </span>
              </button>
            </Link>
          )}

          <Link to={currentUser ? "/profile" : "/auth"}>
            <button className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 hover:border-gold/30 transition-all group">
              <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white">
                {currentUser ? (currentUser.displayName?.split(' ')[0] || 'Member') : 'Access'}
              </span>
            </button>
          </Link>

          <button 
            className="lg:hidden text-white/60 hover:text-gold transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-luxury-black/95 backdrop-blur-3xl z-[110] lg:hidden flex flex-col p-12"
          >
            <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-12 text-gold"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            <div className="flex flex-col gap-8">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-playfair italic hover:text-gold transition-colors">{item.name}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LuxuryNavbar;