import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '@/types/student';
import { useEffect, useState } from 'react';

interface CeremonyDisplayProps {
  student: Student | null;
  onComplete?: () => void;
}

const FloatingParticles = () => {
  return (
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

export const CeremonyDisplay = ({ student, onComplete }: CeremonyDisplayProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (student) {
      // Play chime sound
      playChime();
      // Delay content for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [student]);

  const playChime = () => {
    // Create a simple chime using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  return (
    <div className="ceremony-display relative flex items-center justify-center overflow-hidden">
      <FloatingParticles />
      
      {/* Radial glow background */}
      <div className="absolute inset-0 radial-glow" />
      
      {/* Decorative elements */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />

      <AnimatePresence mode="wait">
        {student && showContent ? (
          <motion.div
            key={student.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-8 max-w-6xl"
          >
            {/* Photo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="mb-12"
            >
              <div className="photo-frame w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 animate-glow-pulse">
                <img
                  src={student.photo || '/placeholder.svg'}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <h1 className="ceremony-name text-balance">{student.name}</h1>
            </motion.div>

            {/* Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-8"
            >
              <p className="ceremony-subtitle">{student.section}</p>
            </motion.div>

            {/* Awards */}
            {student.awards && student.awards.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {student.awards.map((award, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.15, type: "spring" }}
                    className="px-6 py-3 rounded-full border-2 border-gold bg-gold/10 backdrop-blur-sm"
                  >
                    <span className="ceremony-awards">{award}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 mx-auto rounded-full border-2 border-gold/30 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full border border-gold/50" />
              </motion.div>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-gold/50 mb-4">
              QRGrad
            </h2>
            <p className="font-elegant text-xl text-muted-foreground tracking-widest uppercase">
              Awaiting Next Graduate
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
