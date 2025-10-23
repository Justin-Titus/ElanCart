import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const GlowingCard = ({ children, glowColor = '#3b82f6', style = {}, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRadius: '1rem',
        boxShadow: `0 0 24px 0 ${glowColor}80, 0 2px 8px 0 ${glowColor}40`,
        transition: 'box-shadow 0.3s',
        background: 'rgba(255,255,255,0.95)',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 48px 0 ${glowColor}, 0 4px 16px 0 ${glowColor}80`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 24px 0 ${glowColor}80, 0 2px 8px 0 ${glowColor}40`;
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlowingCard;
