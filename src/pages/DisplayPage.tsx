import { useEffect } from 'react';
import { CeremonyDisplay } from '@/components/ceremony/CeremonyDisplay';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const DisplayPage = () => {
  const { ceremonyState } = useCeremonyStore();
  const { preloadVoices } = useTextToSpeech();

  useEffect(() => {
    // Preload voices when display is opened
    preloadVoices();
    
    // Request fullscreen on click
    const handleClick = () => {
      document.documentElement.requestFullscreen?.();
    };
    
    document.addEventListener('click', handleClick, { once: true });
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [preloadVoices]);

  return (
    <div className="w-screen h-screen overflow-hidden cursor-none">
      <CeremonyDisplay student={ceremonyState.currentStudent} />
    </div>
  );
};

export default DisplayPage;
