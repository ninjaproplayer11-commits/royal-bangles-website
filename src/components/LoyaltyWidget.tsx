import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';

const LoyaltyWidget: React.FC = () => {
  const { loyaltyPoints, redeemPoints, currentUser } = useShop();
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState('');

  if (!currentUser) return null;

  const maxRedeemable = Math.floor(loyaltyPoints / 100) * 100;
  const rupeeValue = Math.floor(loyaltyPoints / 100);

  const handleRedeem = async () => {
    if (maxRedeemable < 100) return;
    setRedeeming(true);
    const result = await redeemPoints(maxRedeemable);
    setMsg(result.success ? `✓ ₹${result.discount} discount applied!` : 'Not enough points.');
    setRedeeming(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const tierThresholds = [
    { name: 'Silver', min: 0, max: 500, color: 'text-white/60' },
    { name: 'Gold', min: 500, max: 2000, color: 'text-gold' },
    { name: 'Platinum', min: 2000, max: 5000, color: 'text-blue-300' },
    { name: 'Royal', min: 5000, max: Infinity, color: 'text-purple-400' },
  ];

  const currentTier = tierThresholds.find(t => loyaltyPoints >= t.min && loyaltyPoints < t.max) || tierThresholds[0];
  const nextTier = tierThresholds[tierThresholds.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((loyaltyPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <div className="bg-[#111] border border-white/5 rounded-[3rem] p-10 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-2">Loyalty Points</p>
          <h3 className="text-5xl font-playfair font-bold text-gold italic">{Math.max(0, loyaltyPoints).toLocaleString()}</h3>
          <p className="text-[10px] text-white/30 mt-1">≈ ₹{Math.max(0, rupeeValue)} redeemable value</p>
        </div>
        <div className={`text-right ${currentTier.color}`}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1">Tier</p>
          <p className="text-2xl font-playfair font-bold italic">{currentTier.name}</p>
        </div>
      </div>

      {nextTier && (
        <div>
          <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest mb-2">
            <span>{currentTier.name}</span>
            <span>{nextTier.name} at {nextTier.min} pts</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gold rounded-full"
            />
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-white/5">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Earn 1 point per ₹10 spent</p>
        {maxRedeemable >= 100 ? (
          <div className="space-y-3">
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full bg-gold text-luxury-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-light transition-all"
            >
              {redeeming ? 'Redeeming...' : `Redeem ${maxRedeemable} pts for ₹${rupeeValue} off`}
            </button>
            {msg && <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest text-center">{msg}</p>}
          </div>
        ) : (
          <p className="text-white/20 text-[10px] uppercase tracking-widest">Need {100 - loyaltyPoints} more points to redeem</p>
        )}
      </div>
    </div>
  );
};

export default LoyaltyWidget;
