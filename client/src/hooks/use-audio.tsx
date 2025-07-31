import { useCallback, useRef, useState } from "react";

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const playBeep = useCallback(async () => {
    try {
      initAudioContext();
      
      if (!audioContextRef.current || !gainNodeRef.current) return;

      // Resume audio context if suspended (required by browser policies)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      stopBeep(); // Stop any currently playing beep

      // Create oscillator for beep sound
      const oscillator = audioContextRef.current.createOscillator();
      oscillatorRef.current = oscillator;
      
      oscillator.connect(gainNodeRef.current);
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime); // 800Hz beep
      oscillator.type = 'square';
      
      // Set volume
      gainNodeRef.current.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      
      setIsPlaying(true);
      
      // Play beep for 200ms
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
      
      oscillator.onended = () => {
        setIsPlaying(false);
        oscillatorRef.current = null;
      };
      
    } catch (error) {
      console.error('Failed to play beep:', error);
      setIsPlaying(false);
    }
  }, [initAudioContext]);

  const stopBeep = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (error) {
        // Oscillator might already be stopped
      }
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playBeepLoop = useCallback(() => {
    if (!isPlaying) {
      const loop = () => {
        playBeep();
        if (isPlaying) {
          setTimeout(loop, 1000); // Beep every second
        }
      };
      loop();
    }
  }, [playBeep, isPlaying]);

  return {
    isPlaying,
    playBeep,
    stopBeep,
    playBeepLoop,
  };
}
