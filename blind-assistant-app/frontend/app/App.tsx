import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Settings, QrCode, ArrowLeft, Loader2, History } from 'lucide-react';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { QRCodeSVG } from 'qrcode.react';
import { HistoryModal } from './components/HistoryModal';
import { saveHistory } from './utils/history';

const DEFAULT_API_URL = 'https://buckshot-marshy-delicacy.ngrok-free.dev/predict';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const hasSpokenCameraReadyRef = useRef(false);
  const isStartingCameraRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [latency, setLatency] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('backend_api_url') || DEFAULT_API_URL);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // const { initAudio, playBeep, vibrate, speak, stopSpeaking } = useAudioFeedback();
  const {
    initAudio,
    playBeep,
    playSuccessBeep,
    playErrorBeep,
    vibrate,
    speak,
    stopSpeaking,
  } = useAudioFeedback();
  const handleSaveApiUrl = () => {
    localStorage.setItem('backend_api_url', apiUrl);
    setShowSettings(false);
    speak('Đã lưu cấu hình mạng');
  };

  // const startCamera = async () => {
  //   try {
  //     const mediaStream = await navigator.mediaDevices.getUserMedia({ 
  //       video: { facingMode: 'environment' } // Prefer back camera
  //     });
  //     setStream(mediaStream);
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = mediaStream;
  //     }
  //     speak('Đã bật máy ảnh. Hãy chạm hai lần vào bất kỳ đâu trên màn hình để chụp.');
  //   } catch (err) {
  //     console.error('Error accessing camera:', err);
  //     speak('Không thể mở máy ảnh. Vui lòng cấp quyền.');
  //   }
  // };


  const startCamera = async () => {
    if (streamRef.current || isStartingCameraRef.current) return;

    isStartingCameraRef.current = true;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      if (!hasSpokenCameraReadyRef.current) {
        hasSpokenCameraReadyRef.current = true;
        speak(
          'Đã bật máy ảnh. Hãy chạm hai lần vào bất kỳ đâu trên màn hình để chụp.',
          500
        );
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      speak('Không thể mở máy ảnh. Vui lòng cấp quyền.');
    } finally {
      isStartingCameraRef.current = false;
    }
  };

  // const stopCamera = () => {
  //   if (stream) {
  //     stream.getTracks().forEach(track => track.stop());
  //     setStream(null);
  //   }
  // };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Turn on camera when app starts, if not showing settings
  // React.useEffect(() => {
  //   if (hasStarted && !showSettings) {
  //     startCamera();
  //   }
  //   return () => stopCamera();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [hasStarted, showSettings]);


  React.useEffect(() => {
    if (hasStarted && !showSettings) {
      startCamera();
    }

    if (showSettings || showHistory) {
      stopCamera();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, showSettings, showHistory]);


  const sendImageToBackend = async (imageBlob: Blob) => {
    setIsProcessing(true);
    setResultText('');
    setLatency(null);
    stopSpeaking();
    
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(URL.createObjectURL(imageBlob));
    
    // Feedback for processing
    vibrate([200, 100, 200]);
    speak('Đang xử lý hình ảnh, vui lòng đợi.');

    try {
      // Create a dummy delay to match ~2.5s requirement from user if API returns instantly
      const startTime = Date.now();
      
      const formData = new FormData();
      // Ensure we pass a proper filename. If it's already a File with a name, it will use it or fallback to image.jpg
      formData.append('file', imageBlob, imageBlob instanceof File ? imageBlob.name : 'image.jpg');

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối máy chủ');
      }

      const data = await response.json();
      
      const duration = Date.now() - startTime;
      if (duration < 2500) {
        // Wait bit longer to meet "2.5s wait" request gracefully if needed
        await new Promise(resolve => setTimeout(resolve, 2500 - duration));
      }

      const description = data.caption || data.description || data.text || data.result || 'Không tìm thấy mô tả trong phản hồi.';
      setResultText(description);
      if (data.latency_seconds !== undefined) {
        setLatency(data.latency_seconds);
      }

      // Báo hiệu AI đã nhận diện xong
      // playBeep();
      // vibrate([120, 80, 120]);

      // // Đọc kết quả cho người dùng
      // speak(description);
      
      playSuccessBeep();

      const canVibrate = vibrate([120, 80, 120]);

      // Đợi beep xong rồi mới đọc, tránh âm beep đè lên giọng đọc
      speak(description, canVibrate ? 500 : 600);

      // Lưu lại kết quả
      saveHistory({ imageBlob, description, timestamp: Date.now() });

    } catch (error) {
      console.error('API Error:', error);
      const errMsg = 'Lỗi kết nối hoặc máy chủ đang bận. Vui lòng thử lại.';
      setResultText(errMsg);
      playErrorBeep();
      vibrate([500, 200, 500]);
      speak(errMsg, 700);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureClick = () => {
    if (isProcessing) return;
    
    if (videoRef.current && canvasRef.current) {
      playBeep();
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure canvas matches video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get high quality blob directly without base64 serialization
        canvas.toBlob((blob) => {
          if (blob) {
            sendImageToBackend(blob);
          }
        }, 'image/jpeg', 1.0); // Tăng chất lượng ảnh lên 100% thay vì 80%
      }
    } else {
      speak('Máy ảnh chưa sẵn sàng');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isProcessing) return;
    playBeep();

    // Pass the original file directly to keep 100% original quality
    sendImageToBackend(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const lastTapTimeRef = useRef<number>(0);

  const handleScreenInteraction = () => {
    // Only handle if it's the container we're touching (avoid interfering with buttons if they didn't stop propagation, though they should)
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    // Khoảng thời gian giữa 2 lần chạm nhỏ hơn 400ms thì được coi là double click
    if (timeSinceLastTap > 0 && timeSinceLastTap < 400) {
      handleCaptureClick();
      lastTapTimeRef.current = 0; // Reset
    } else {
      lastTapTimeRef.current = now;
      // Unlock speech just in case it went to sleep on single tap
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
    }
  };

  const handleStartApp = () => {
    initAudio();

    speak(
      'Đang mở camera. Nếu có hộp thoại quyền, hãy dùng trình đọc màn hình để tìm nút Cho phép, rồi chạm hai lần để xác nhận.',
      200
    );

    setTimeout(() => {
      setHasStarted(true);
    }, 4500);
  };

  if (!hasStarted) {
    return (
      <div 
        className="h-screen w-full bg-black flex flex-col items-center justify-center text-white cursor-pointer select-none touch-none"
        onClick={handleStartApp}
      >
        <div className="bg-blue-600 rounded-full w-56 h-56 flex flex-col items-center justify-center animate-pulse shadow-2xl shadow-blue-500/50 hover:bg-blue-500 active:scale-95 transition-all">
          <span className="text-3xl font-bold uppercase tracking-wider mb-2">Bắt đầu</span>
        </div>
        <p className="mt-10 text-neutral-400 text-lg font-medium">Chạm vào màn hình để sử dụng</p>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="h-screen bg-neutral-900 text-white p-4 flex flex-col overflow-hidden">
        <div className="flex items-center mb-4 pt-4 shrink-0">
          <button 
            onClick={() => setShowSettings(false)}
            className="p-3 bg-black/90 border-2 border-white rounded-full mr-4 active:bg-yellow-300 active:text-black flex items-center justify-center transition-colors"
            aria-label="Quay về"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Cài đặt</h1>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4 pb-4">
          <div className="bg-neutral-800 p-5 rounded-2xl shadow-lg">
            <label className="block text-lg font-medium mb-2">Backend API URL</label>
            <input 
              type="text" 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-base mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
            <button 
              onClick={handleSaveApiUrl}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-lg active:bg-blue-700 transition-colors"
            >
              Lưu cấu hình
            </button>
            <p className="text-neutral-400 mt-3 text-xs leading-relaxed">
              * Nhập URL Ngrok của backend (Vd: https://...ngrok.io/predict).
            </p>
          </div>

          <div className="bg-neutral-800 p-5 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-medium mb-3 text-center">Quét mã QR để mở App</h2>
            <div className="bg-white p-3 rounded-xl mb-3 shadow-sm">
              <QRCodeSVG value={window.location.href} size={160} />
            </div>
            <p className="text-neutral-400 text-center text-xs px-2">
              Cho phép người dùng quét mã này để sử dụng ứng dụng web trên điện thoại.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-screen w-full bg-black flex flex-col overflow-hidden select-none touch-none"
      onClick={handleScreenInteraction}
    >
      {/* Top Bar Actions */}
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        
        <div className="flex space-x-4 pointer-events-auto">
          {/* File Upload Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="p-4 bg-black/90 border-2 border-white backdrop-blur-md rounded-full text-white shadow-lg active:bg-yellow-300 active:text-black active:scale-95 transition-transform"
            aria-label="Tải ảnh lên"
          >
            <ImageIcon size={28} />
          </button>

          {/* History Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(true);
            }}
            className="p-4 bg-black/90 border-2 border-white backdrop-blur-md rounded-full text-white shadow-lg active:bg-yellow-300 active:text-black active:scale-95 transition-transform"
            aria-label="Xem lịch sử"
          >
            <History size={28} />
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileUpload}
        />

        {/* Settings Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}
          className="p-4 bg-black/90 border-2 border-white backdrop-blur-md rounded-full text-white pointer-events-auto shadow-lg active:bg-yellow-300 active:text-black active:scale-95 transition-transform flex items-center space-x-2"
          aria-label="Cài đặt mã QR và API"
        >
          <QrCode size={24} />
          <Settings size={28} />
        </button>
      </div>

      {/* Video Feed or Processing Overlay */}
      <div className="flex-1 relative bg-neutral-900 w-full flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isProcessing ? 'opacity-30' : 'opacity-100'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 size={64} className="text-blue-500 animate-spin mb-6" />
            <p className="text-2xl font-bold text-white animate-pulse">Đang phân tích...</p>
          </div>
        )}
      </div>

      {/* Replay Result Text Zone (If any result) */}
      {resultText && !isProcessing && (
        <div 
          className="absolute top-24 left-4 right-4 z-20 bg-black/95 backdrop-blur-lg border-4 border-yellow-300 p-6 rounded-3xl shadow-2xl active:bg-neutral-800 transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            playBeep();
            speak(resultText);
          }}
          role="button"
          tabIndex={0}
          aria-live="polite"
          aria-label={`Kết quả nhận diện: ${resultText}. Chạm để nghe lại.`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base text-yellow-300 font-bold uppercase tracking-wider">
              Kết quả - Chạm để nghe lại
            </h3>
            {latency !== null && (
              <span className="text-xs text-neutral-500 font-mono">{latency}s</span>
            )}
          </div>
          <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white mt-3">
            {resultText}
          </p>
        </div>
      )}

      {/* Captured Image Preview Zone */}
      {previewImage && (
        <div className="absolute bottom-6 right-4 z-20 w-28 h-36 border-4 border-yellow-300 rounded-2xl overflow-hidden shadow-2xl pointer-events-none bg-black/50">
          <img src={previewImage} alt="Ảnh chân thực" className="w-full h-full object-cover" />
        </div>
      )}

      {showHistory && (
        <HistoryModal 
          onClose={() => setShowHistory(false)} 
          onPlay={(text) => {
            playBeep();
            speak(text);
          }}
        />
      )}

    </div>
  );
}

export default App;
