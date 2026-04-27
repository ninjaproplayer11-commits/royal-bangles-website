import { motion, HTMLMotionProps } from 'framer-motion';

interface PremiumButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  children, 
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = 'px-8 py-3 rounded-full font-poppins font-semibold text-lg transition-all duration-300';
  
  const variants = {
    primary: 'bg-gold text-luxury-black hover:shadow-gold-glow-lg',
    secondary: 'bg-luxury-black text-gold border-2 border-gold hover:bg-gold hover:text-luxury-black',
    outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-luxury-black',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PremiumButton;