import React from 'react';
import { motion } from 'framer-motion';
import LuxuryNavbar from '../components/LuxuryNavbar';
import PremiumButton from '../components/PremiumButton';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-black text-white">
      <LuxuryNavbar />
      
      <div className="pt-32 px-4 pb-24">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-playfair font-bold mb-4">
              About <span className="text-gold">Royal Bangles</span>
            </h1>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16 bg-gradient-to-r from-charcoal to-dark-gray p-12 rounded-2xl"
          >
            <h2 className="text-4xl font-playfair font-bold text-gold mb-6">Our Story</h2>
            <p className="text-gray-300 font-poppins text-lg leading-relaxed mb-4">
              Founded in 2010, Royal Bangles has been crafting exquisite bangles for the modern Indian woman. 
              We believe that jewelry is not just an accessory—it's a statement of elegance and tradition.
            </p>
            <p className="text-gray-300 font-poppins text-lg leading-relaxed">
              Each piece in our collection is carefully handcrafted by master artisans who bring decades of 
              expertise and passion to every design. We combine traditional Indian craftsmanship with contemporary 
              aesthetics to create timeless pieces that celebrate your unique style.
            </p>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-playfair font-bold text-gold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['Craftsmanship', 'Luxury', 'Authenticity'].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-charcoal p-8 rounded-2xl border border-gold/30 hover:border-gold/60 transition-all"
                >
                  <h3 className="text-2xl font-playfair text-gold mb-4">{value}</h3>
                  <p className="text-gray-400 font-poppins">
                    We are committed to excellence in every aspect of our business, from design to delivery.
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-playfair mb-6">Ready to Discover?</h2>
            <PremiumButton variant="primary">Explore Collections</PremiumButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;