// Web Audio API & SpeechSynthesis voice caller helper for clinic queue calls

export const playQueueChimeAndVoice = (queueNumber: number | string, patientName: string, roomName: string) => {
  try {
    // 1. Play Clinic Chime Sound (Ding-Dong 2-Tone Melody) using Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();

      // Tone 1: High pitch chime (523.25 Hz - C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);

      // Tone 2: Warm follow-up chime (659.25 Hz - E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 1.2);
    }

    // 2. Play Indonesian Voice Call Announcement via SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const text = `Nomor antrean, Kosong Kosong ${queueNumber}, atas nama, ${patientName}, silakan menuju, ${roomName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9; // Slightly slower for clear hospital announcement
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Slight delay so voice plays right after the ding-dong chime
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 700);
    }
  } catch (err) {
    console.error('Audio playback error:', err);
  }
};
