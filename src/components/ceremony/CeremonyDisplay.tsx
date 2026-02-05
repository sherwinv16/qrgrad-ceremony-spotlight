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
            className="relative z-10 flex flex-row items-center justify-center gap-16 px-12 max-w-7xl w-full"
          >
            {/* Photo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="flex-shrink-0"
            >
              <div className="photo-frame w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] animate-glow-pulse">
                <img
                  src={student.photo || '/placeholder.svg'}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right side: Name, Section, Awards */}
            <div className="flex flex-col items-start text-left">
              {/* Name */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="mb-4"
              >
                <h1 className="ceremony-name text-balance">{student.name}</h1>
              </motion.div>

              {/* Section */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mb-10"
              >
                <p className="ceremony-subtitle">{student.section}</p>
              </motion.div>

              {/* Awards */}
              {student.awards && student.awards.length > 0 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-gold/70 font-elegant text-lg uppercase tracking-[0.3em] mb-2">Honors & Awards</p>
                  {student.awards.map((award, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.15, type: "spring" }}
                      className="px-8 py-4 rounded-lg border-2 border-gold bg-gradient-to-r from-gold/20 to-gold/5 backdrop-blur-sm"
                    >
                      <span className="text-gold font-display text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide">{award}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
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
