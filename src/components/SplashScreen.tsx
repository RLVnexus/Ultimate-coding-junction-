import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Code2, Terminal, Cpu } from 'lucide-react';

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
             <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Logo Container */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative flex items-center justify-center w-32 h-32 mb-8"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-xl border border-indigo-500/40"
              />
              <Layout className="w-12 h-12 text-blue-400" />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Ultimate
                </span> Coding Junction
              </h1>
              <h2 className="text-xl text-blue-200/80 font-medium tracking-wide">
                Gaya to Patna Express
              </h2>
            </motion.div>

            {/* Loading indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16 flex gap-3"
            >
              {[Code2, Terminal, Cpu].map((Icon, index) => (
                <motion.div
                  key={index}
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4 text-blue-300" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Credits */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 text-sm text-gray-500 tracking-widest uppercase font-semibold"
          >
            Made by RLV NEXUS under Love Vaidya
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
