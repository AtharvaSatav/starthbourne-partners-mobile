import {useEffect, useState, useRef} from 'react';
// @ts-ignore - react-native-sound types
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create a beep sound (you can replace this with a custom sound file)
    soundRef.current = new Sound('beep.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        // Create a system beep as fallback
        soundRef.current = new Sound('default', '', (error) => {
          if (error) {
            console.log('Failed to load system sound', error);
          }
        });
      }
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playBeep = () => {
    if (soundRef.current) {
      soundRef.current.play((success) => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    }
  };

  const startContinuousBeep = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    playBeep();
    
    intervalRef.current = setInterval(() => {
      playBeep();
    }, 1000); // Beep every second
  };

  const stopBeep = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    isPlaying,
    startContinuousBeep,
    stopBeep,
    playBeep,
  };
};