import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SizeGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = [
    { size: '2.2', diameter: '2.2 cm', wrist: 'Up to 14 cm', fit: 'Extra Small' },
    { size: '2.4', diameter: '2.4 cm', wrist: '14 – 15 cm', fit: 'Small' },
    { size: '2.6', diameter: '2.6 cm', wrist: '15 – 16 cm', fit: 'Medium' },
    { size: '2.8', diameter: '2.8 cm', wrist: '16 – 17 cm', fit: 'Large' },
    { size: '2.10', diameter: '3.0 cm', wrist: '17 – 18 cm', fit: 'Extra Large' },
    { size: '2.12', diameter: '3.2 cm', wrist: '18+ cm', fit: 'XXL' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold uppercase tracking-widest text-gold/60 hover:text-gold transition-colors underline decoration-gold/30 underline-offset-4"
      >
        Size Guide
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
              className="bg-[#111] border border-white/10 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-[10px] text-gold font-bold uppercase tracking-[0.4em] mb-2">Royal Bangles</p>
                  <h2 className="text-3xl font-playfair font-bold italic">Bangle Size Guide</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors text-2xl">✕</button>
              </div>

              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                Measure the widest part of your hand (knuckles) when making a fist. Use a measuring tape or a strip of paper.
              </p>

              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gold/10 border-b border-white/5">
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gold">Size</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gold">Diameter</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gold">Wrist</th>
                      <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gold">Fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-gold">{row.size}</td>
                        <td className="p-4 text-white/60">{row.diameter}</td>
                        <td className="p-4 text-white/60">{row.wrist}</td>
                        <td className="p-4 text-white/40 text-[10px] uppercase tracking-widest">{row.fit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-white/20 text-[10px] mt-6 text-center uppercase tracking-widest">
                When between sizes, we recommend choosing the larger size
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SizeGuide;
