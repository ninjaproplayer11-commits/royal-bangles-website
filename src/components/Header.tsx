import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-playfair font-bold text-gold">Royal Bangles</Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link to="/" className="text-gray-700 hover:text-gold">Home</Link></li>
            <li><Link to="/shop" className="text-gray-700 hover:text-gold">Shop</Link></li>
            <li><Link to="/about" className="text-gray-700 hover:text-gold">About</Link></li>
            <li><Link to="/contact" className="text-gray-700 hover:text-gold">Contact</Link></li>
            <li><Link to="/cart" className="text-gray-700 hover:text-gold">Cart</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;