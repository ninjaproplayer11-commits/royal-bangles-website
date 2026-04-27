import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  selected: boolean;
  message: string;
  onToggle: () => void;
  onMessageChange: (msg: string) => void;
}

const GiftWrapOption: React.FC<Props> = ({ selected, message, onToggle, onMessageChange }) => {
  return (
    <div className="space-y-4">
      <label
        className={`p-8 rounded-[2rem] border cursor-pointer transition-all flex items-center gap-6 ${
          selected ? 'bg-gold/5 border-gold shadow-xl shadow-gold/10' : 'bg-[#111] border-white/5 hover:border-white/20'
        }`}
      >
        <input type="checkbox" checked={selected} onChange={onToggle} className="w-5 h-5 accent-gold" />
        <span className="text-3xl">🎁</span>
        <div className="flex-1">
          <p className="text-lg font-bold">Premium Gift Wrapping</p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Luxury velvet box + ribbon + handwritten card • ₹199</p>
        </div>
        <span className="text-gold font-bold">₹199</span>
      </label>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <textarea
            value={message}
            onChange={e => onMessageChange(e.target.value)}
            placeholder="Write a personal message for the gift card... (optional)"
            rows={3}
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-gold/40 transition-all resize-none"
          />
          <p className="text-[9px] text-white/20 text-right mt-1">{message.length}/200</p>
        </motion.div>
      )}
    </div>
  );
};

export default GiftWrapOption;
