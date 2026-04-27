import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';

const ReferralWidget: React.FC = () => {
  const { currentUser, referralCode, applyReferralCode } = useShop();
  const [inputCode, setInputCode] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setApplying(true);
    const result = await applyReferralCode(inputCode);
    setMsg({ text: result.message, ok: result.success });
    setApplying(false);
    if (result.success) setInputCode('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-[3rem] p-10 space-y-8">
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-2">Your Referral Code</p>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-playfair font-bold text-gold italic tracking-widest">{referralCode}</span>
          <button
            onClick={copyCode}
            className="text-[9px] font-bold uppercase tracking-widest border border-gold/30 px-4 py-2 rounded-xl text-gold hover:bg-gold hover:text-luxury-black transition-all"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-3 leading-relaxed">
          Share your code — your friend gets ₹200 off, you earn 500 loyalty points.
        </p>
      </div>

      <div className="pt-6 border-t border-white/5">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-4">Have a Friend's Code?</p>
        <form onSubmit={handleApply} className="flex gap-3">
          <input
            type="text"
            value={inputCode}
            onChange={e => { setInputCode(e.target.value.toUpperCase()); setMsg(null); }}
            placeholder="Enter referral code"
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all uppercase tracking-widest"
          />
          <button
            type="submit"
            disabled={applying}
            className="bg-gold text-luxury-black px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-light transition-all flex items-center justify-center"
          >
            {applying ? '...' : 'Apply'}
          </button>
        </form>
        <AnimatePresence>
          {msg && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${msg.ok ? 'text-green-500' : 'text-red-400'}`}
            >
              {msg.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReferralWidget;
