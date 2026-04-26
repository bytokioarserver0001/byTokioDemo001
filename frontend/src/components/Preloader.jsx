import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-4"
    >
      <div className="flex flex-col items-center space-y-6">
        <svg className="w-14 h-14 text-slate-400" viewBox="0 0 24 24">
          <style>
            {`
              @keyframes ios-spinner {
                0% { opacity: 1; }
                100% { opacity: 0.15; }
              }
            `}
          </style>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="11"
              y="1"
              width="2"
              height="6"
              rx="1"
              fill="currentColor"
              style={{
                transformOrigin: '12px 12px',
                transform: `rotate(${i * 30}deg)`,
                animation: 'ios-spinner 1.2s linear infinite',
                animationDelay: `${(i - 12) * 0.1}s`
              }}
            />
          ))}
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-slate-400 font-sans tracking-[0.2em] text-xs font-bold uppercase ml-2"
        >
          Cargando
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
