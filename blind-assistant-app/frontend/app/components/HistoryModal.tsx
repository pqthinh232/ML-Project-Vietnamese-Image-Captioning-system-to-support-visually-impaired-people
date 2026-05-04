import { useEffect, useState } from 'react';
import { HistoryItem, getHistory } from '../utils/history';
import { X, Clock, Image as ImageIcon } from 'lucide-react';

interface HistoryModalProps {
  onClose: () => void;
  onPlay: (text: string) => void;
}

const HistoryImage = ({ item }: { item: HistoryItem }) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (item.imageDataUrl) {
      setUrl(item.imageDataUrl);
    } else if (item.imageBlob) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUrl(reader.result as string);
        };
        reader.onerror = () => {
          setError(true);
          console.error('Failed to read backwards-compatible blob');
        };
        reader.readAsDataURL(item.imageBlob as Blob);
      } catch (err) {
        setError(true);
        console.error('Failed to process blob for history imaging', err);
      }
    } else {
      setError(true);
    }
  }, [item]);

  if (error) return <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">Lỗi ảnh</div>;
  if (!url) return <div className="w-full h-full bg-neutral-800 animate-pulse"></div>;

  return (
    <img 
      src={url} 
      alt="Lịch sử ảnh" 
      className="w-full h-full object-cover"
    />
  );
};

export function HistoryModal({ onClose, onPlay }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // Prevent clicking through to camera
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Clock className="mr-2" size={28} />
          Lịch sử gần nhất
        </h2>
        <button 
          onClick={onClose}
          className="p-3 bg-neutral-800 rounded-full active:bg-neutral-700 transition-colors"
          aria-label="Đóng lịch sử"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {loading ? (
          <p className="text-neutral-400 text-center py-10">Đang tải lịch sử...</p>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <ImageIcon size={64} className="mb-4 opacity-50" />
            <p className="text-xl">Chưa có lịch sử nhận diện</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl overflow-hidden flex flex-col active:border-yellow-300 transition-colors cursor-pointer"
              onClick={() => onPlay(item.description)}
              role="button"
              aria-label={`Nghe lại kết quả: ${item.description}`}
            >
              <div className="flex p-4">
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-neutral-800 mr-4 flex items-center justify-center">
                  <HistoryImage item={item} />
                </div>
                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                  <p className="text-white text-lg font-medium leading-snug">
                    {item.description}
                  </p>
                  <p className="text-neutral-500 text-sm mt-2 font-mono">
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
