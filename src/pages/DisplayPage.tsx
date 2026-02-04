import { useEffect, useState } from 'react';
import { CeremonyDisplay } from '@/components/ceremony/CeremonyDisplay';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Student } from '@/types/student';

const DisplayPage = () => {
  const { ceremonyState } = useCeremonyStore();
  const { preloadVoices } = useTextToSpeech();
  const [displayedStudent, setDisplayedStudent] = useState<Student | null>(null);

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

  // Subscribe to store changes for real-time updates
  useEffect(() => {
    const unsubscribe = useCeremonyStore.subscribe((state) => {
      setDisplayedStudent(state.ceremonyState.currentStudent);
    });

    // Set initial value
    setDisplayedStudent(ceremonyState.currentStudent);

    return () => {
      unsubscribe();
    };
  }, []);

  // Also listen for localStorage sync events for cross-tab communication
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'qrgrad-sync' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.type === 'CEREMONY_UPDATE' && data.ceremonyState) {
            setDisplayedStudent(data.ceremonyState.currentStudent);
          }
        } catch (e) {
          console.error('Error parsing sync data:', e);
        }
      }
      // Also check the main storage key
      if (event.key === 'qrgrad-ceremony-storage' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.state?.ceremonyState?.currentStudent) {
            setDisplayedStudent(data.state.ceremonyState.currentStudent);
          }
        } catch (e) {
          console.error('Error parsing ceremony storage:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden cursor-none">
      <CeremonyDisplay student={displayedStudent} />
    </div>
  );
};

export default DisplayPage;
