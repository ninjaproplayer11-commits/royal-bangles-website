import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SizeRecommender: React.FC<{ onSelect?: (size: string) => void }> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wrist, setWrist] = useState('');
  const [result, setResult] = useState<{ size: string; label: string } | null>(null);

  const recommend = () => {
    const cm = parseFloat(wrist);
    if (isNaN(cm) || cm <= 0) return;
    let size = '2.6';
    let label = 'Medium';
    if (cm <= 14) { size = '2.2'; label = 'Extra Small'; }
    else if (cm <= 15) { size = '2.4'; label = 'Small'; }
    else if (cm <= 16) { size = '2.6'; label = 'Medium'; }
    else if (cm <= 17) { size = '2.8'; label = 'Large'; }
    else if (cm <= 18) { size = '2.10'; label = 'Extra Large'; }
    else { size = '2.12'; label = 'XXL'; }
    setResult({ size, label });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-gold transition-colors flex items-center gap-2"
      >
        📏 Find My Size
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-[3rem] p-12 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-playfair font-bold italic text-gold">Size Recommender</h2>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                Measure the circumference of your wrist (not the widest part of your hand) using a measuring tape.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">
                    Wrist Circumference (cm)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={wrist}
                      onChange={e => { setWrist(e.target.value); setResult(null); }}
                      placeholder="e.g. 15.5"
                      step="0.5"
                      min="10"
                      max="25"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-gold/40 transition-all"
                    />
                    <button
                      onClick={recommend}
                      className="bg-gold text-luxury-black px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
                    >
                      Find
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center"
                    >
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Recommended Size</p>
                      <p className="text-4xl font-playfair font-bold text-gold italic mb-1">{result.size}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{result.label}</p>
                      {onSelect && (
                        <button
                          onClick={() => { onSelect(result.size); setIsOpen(false); }}
                          className="mt-4 bg-gold text-luxury-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
                        >
                          Select This Size
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-[9px] text-white/20 text-center leading-relaxed">
                  Tip: If between sizes, choose the larger one for comfort
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SizeRecommender;
