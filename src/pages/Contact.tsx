import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LuxuryNavbar from '../components/LuxuryNavbar';
import PremiumButton from '../components/PremiumButton';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      <LuxuryNavbar />
      
      <div className="pt-32 px-4 pb-24">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-playfair font-bold mb-4">
              Get in <span className="text-gold">Touch</span>
            </h1>
            <p className="text-gray-400 font-poppins text-lg">We'd love to hear from you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-playfair text-gold mb-2">📍 Address</h3>
                  <p className="text-gray-400 font-poppins">123 Luxury Lane, Mumbai, India</p>
                </div>
                <div>
                  <h3 className="text-xl font-playfair text-gold mb-2">📞 Phone</h3>
                  <p className="text-gray-400 font-poppins">+91 9876543210</p>
                </div>
                <div>
                  <h3 className="text-xl font-playfair text-gold mb-2">✉️ Email</h3>
                  <p className="text-gray-400 font-poppins">hello@royalbangles.com</p>
                </div>
                <div>
                  <h3 className="text-xl font-playfair text-gold mb-4">Follow Us</h3>
                  <div className="flex gap-4 text-2xl">
                    <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-gray-400 hover:text-gold transition">📷</motion.a>
                    <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-gray-400 hover:text-gold transition">👍</motion.a>
                    <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-gray-400 hover:text-gold transition">🎵</motion.a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-charcoal to-dark-gray p-8 rounded-2xl"
            >
              <div className="mb-6">
                <label className="block text-gold font-poppins mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-luxury-black border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gold font-poppins mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-luxury-black border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gold font-poppins mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full bg-luxury-black border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition resize-none"
                  placeholder="Your message..."
                  required
                />
              </div>
              <PremiumButton variant="primary" className="w-full">Send Message</PremiumButton>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;