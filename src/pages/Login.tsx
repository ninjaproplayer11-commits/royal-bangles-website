import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import PremiumButton from '../components/PremiumButton';

const Login: React.FC = () => {
  const [isRegister] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('royal_bangles_last_user') || '');
  const [email] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const { refreshProducts } = useShop();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Automatic username to email mapping
      // If the user types a username without @, we assume it's a username
      let loginEmail = email || username;
      if (!loginEmail.includes('@')) {
        // Here we can fetch from Firestore, but for a quick fix for the owner:
        // We'll use the last known admin email or a default one if they haven't set it yet
        const savedEmail = localStorage.getItem('royal_bangles_admin_email');
        if (savedEmail) loginEmail = savedEmail;
      }

      if (isRegister) {
        await createUserWithEmailAndPassword(auth, loginEmail, password);
        localStorage.setItem('royal_bangles_admin_auth', 'true');
        localStorage.setItem('royal_bangles_admin_email', loginEmail);
        alert('Account Created Successfully! Welcome Admin. ✨');
      } else {
        localStorage.setItem('royal_bangles_admin_auth', 'true');
        await signInWithEmailAndPassword(auth, loginEmail, password);
      }
      
      localStorage.setItem('royal_bangles_last_user', username);
      refreshProducts();
      navigate('/admin');
    } catch (error: any) {
      alert(error.message || 'Authentication Failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6 pt-20 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/5 p-12 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-playfair font-bold text-white mb-4 tracking-tight">
            Admin Access
          </h1>
          <p className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">
            Secure Portal for Royal Bangles
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Username or Email</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-gold transition-all"
              placeholder="e.g. admin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-gold transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <PremiumButton 
              variant="primary" 
              type="submit" 
              className="w-full py-5 text-sm"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Enter Store Manager'}
            </PremiumButton>
          </div>
        </form>

        <p className="mt-12 text-center text-[10px] text-white/20 uppercase tracking-widest leading-loose">
          Authorized personnel only. <br /> All access is logged and monitored.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
