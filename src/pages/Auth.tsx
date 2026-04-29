import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import PremiumButton from '../components/PremiumButton';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { googleLogin } = useShop();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/shop');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await googleLogin();
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6 pt-20 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111] border border-white/5 p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative"
      >
        <div className="text-center mb-12 mt-4">
          <h1 className="text-3xl font-playfair font-bold text-white mb-2 italic">
            Customer Login
          </h1>
          <p className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">
            Welcome to the Royalty
          </p>
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-4 bg-white text-luxury-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors mb-8"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[10px] text-white/20 uppercase tracking-widest">or email</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-gold transition-all"
              placeholder="Your Email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-gold transition-all"
              placeholder="••••••••"
            />
          </div>

          <PremiumButton variant="primary" type="submit" className="w-full py-5" disabled={loading}>
            {loading ? 'Processing...' : 'Enter Portal'}
          </PremiumButton>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
