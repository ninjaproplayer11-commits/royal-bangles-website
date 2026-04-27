import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Props {
  endTime?: Date;
  discount?: number;
  label?: string;
}

const FlashSaleBanner: React.FC<Props> = ({
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000),
  discount = 20,
  label = 'Flash Sale'
}) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tick = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) { setVisible(false); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (!visible) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="bg-gold text-luxury-black py-3 px-6 flex items-center justify-center gap-6 relative overflow-hidden"
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">⚡ {label} — {discount}% OFF</span>

        <div className="flex items-center gap-2">
          {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((val, i) => (
            <React.Fragment key={i}>
              <div className="bg-luxury-black text-gold text-sm font-bold font-mono w-10 h-10 flex items-center justify-center rounded-lg">
                {val}
              </div>
              {i < 2 && <span className="font-bold text-luxury-black">:</span>}
            </React.Fragment>
          ))}
        </div>

        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-2">
          Shop Now →
        </Link>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-black/60 hover:text-luxury-black text-lg"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashSaleBanner;
