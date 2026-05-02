// export const useAudioFeedback = () => {
//   const initAudio = () => {
//     // Unlock Audio Context
//     try {
//       const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
//       if (AudioContextClass) {
//         const audioCtx = new AudioContextClass();
//         const oscillator = audioCtx.createOscillator();
//         const gainNode = audioCtx.createGain();
//         oscillator.connect(gainNode);
//         gainNode.connect(audioCtx.destination);
//         gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
//         oscillator.start();
//         oscillator.stop(audioCtx.currentTime + 0.001);
//       }
//     } catch (e) {
//       console.warn('Audio unlock failed', e);
//     }

//     // Unlock SpeechSynthesis
//     if ('speechSynthesis' in window) {
//       const utterance = new SpeechSynthesisUtterance('');
//       utterance.volume = 0; // Silent
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const playBeep = () => {
//     try {
//       const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
//       if (!AudioContextClass) return;
      
//       const audioCtx = new AudioContextClass();
//       const oscillator = audioCtx.createOscillator();
//       const gainNode = audioCtx.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(audioCtx.destination);
      
//       oscillator.type = 'sine';
//       oscillator.frequency.value = 800; // 800Hz beep
//       gainNode.gain.setValueAtTime(0.35, audioCtx.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      
//       oscillator.start(audioCtx.currentTime);
//       oscillator.stop(audioCtx.currentTime + 0.25);
//     } catch (err) {
//       console.error('Audio beep failed', err);
//     }
//   };

//   const vibrate = (pattern: number | number[]) => {
//     if ('vibrate' in navigator) {
//       const ok = navigator.vibrate(pattern);
//       console.log('Vibration supported, result:', ok, pattern);
//       return ok;
//     }

//     console.log('Vibration is not supported on this device/browser');
//     return false;
//   };

//   const speak = (text: string) => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel(); // Stop any current speech
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = 'vi-VN'; // Vietnamese
//       utterance.rate = 1.1;
//       utterance.pitch = 1.0;
//       window.speechSynthesis.speak(utterance);
//     } else {
//       console.warn('Speech synthesis not supported');
//     }
//   };

//   const stopSpeaking = () => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };

//   return { initAudio, playBeep, vibrate, speak, stopSpeaking };
// };


export const useAudioFeedback = () => {
  const getAudioContext = () => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return null;

    return new AudioContextClass();
  };

  const initAudio = () => {
    // Unlock Audio Context
    try {
      const audioCtx = getAudioContext();

      if (audioCtx) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.001);
      }
    } catch (e) {
      console.warn('Audio unlock failed', e);
    }

    // Unlock SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);

      // Force load voices
      window.speechSynthesis.getVoices();
    }
  };

  const playTone = (
    frequency: number,
    duration = 0.25,
    volume = 0.4,
    delay = 0
  ) => {
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      const startTime = audioCtx.currentTime + delay;
      const endTime = startTime + duration;

      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    } catch (err) {
      console.error('Audio tone failed', err);
    }
  };

  // Beep mặc định: dùng khi chụp ảnh hoặc bấm nghe lại
  const playBeep = () => {
    playTone(880, 0.25, 0.45);
  };

  // Beep báo xử lý xong: 2 tiếng ngắn, dễ nhận biết hơn
  const playSuccessBeep = () => {
    playTone(880, 0.18, 0.45, 0);
    playTone(1100, 0.18, 0.45, 0.22);
  };

  // Beep báo lỗi: âm thấp hơn, khác với success
  const playErrorBeep = () => {
    playTone(330, 0.25, 0.45, 0);
    playTone(260, 0.35, 0.45, 0.3);
  };

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      const ok = navigator.vibrate(pattern);
      console.log('Vibration supported, result:', ok, pattern);
      return ok;
    }

    console.log('Vibration is not supported on this device/browser');
    return false;
  };

  const getVietnameseVoice = () => {
    if (!('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();

    return (
      voices.find((voice) => voice.lang === 'vi-VN') ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith('vi')) ||
      voices.find((voice) => voice.name.toLowerCase().includes('vietnam')) ||
      null
    );
  };

  const speak = (text: string, delayMs = 0) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();

    window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = 'vi-VN';
      utterance.rate = 1.15; // nhanh hơn nhẹ
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const vietnameseVoice = getVietnameseVoice();
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }

      window.speechSynthesis.speak(utterance);
    }, delayMs);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    initAudio,
    playBeep,
    playSuccessBeep,
    playErrorBeep,
    vibrate,
    speak,
    stopSpeaking,
  };
};