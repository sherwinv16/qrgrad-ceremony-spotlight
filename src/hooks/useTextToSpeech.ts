import { useCallback } from 'react';

// Natural-sounding TTS using Web Speech API with enhanced settings
export const useTextToSpeech = () => {
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure for ceremonial, clear pronunciation
      utterance.rate = options?.rate || 0.85; // Slower for clear pronunciation
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = 1.0;

      // Try to get a high-quality voice
      const voices = window.speechSynthesis.getVoices();
      
      // Prefer Google or Microsoft voices for better quality
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Google') ||
          v.name.includes('Microsoft') ||
          v.name.includes('Natural') ||
          v.name.includes('Enhanced')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        resolve(); // Resolve anyway to not block the ceremony
      };

      // Small delay for more natural timing
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300);
    });
  }, []);

  const speakGraduate = useCallback(async (name: string, awards?: string[]) => {
    // Format name for ceremonial announcement
    const nameParts = name.split(' ');
    const formattedName = nameParts.join(' ... '); // Add pauses between names
    
    let announcement = formattedName;
    
    if (awards && awards.length > 0) {
      announcement += ` ... ${awards.join(' ... ')}`;
    }

    await speak(announcement, { rate: 0.8, pitch: 1.05 });
  }, [speak]);

  // Preload voices
  const preloadVoices = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return { speak, speakGraduate, preloadVoices };
};
