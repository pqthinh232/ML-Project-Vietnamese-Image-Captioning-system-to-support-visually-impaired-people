import localforage from 'localforage';

export interface HistoryItem {
  id: string;
  imageBlob?: Blob;      // For backwards compatibility
  imageDataUrl?: string; // New field for reliable storage
  description: string;
  timestamp: number;
}

const HISTORY_KEY = 'app_history_items';
const MAX_HISTORY = 30;

export const saveHistory = async (item: { imageBlob: Blob; description: string; timestamp: number }) => {
  try {
    // Generate base64 Data URL for robust storage on mobile browsers
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(item.imageBlob);
    });

    const currentHistory = await getHistory();
    const newItem: HistoryItem = {
      description: item.description,
      timestamp: item.timestamp,
      imageDataUrl: imageDataUrl,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    currentHistory.unshift(newItem);
    
    // Keep only the latest MAX_HISTORY items
    if (currentHistory.length > MAX_HISTORY) {
      currentHistory.splice(MAX_HISTORY);
    }
    
    await localforage.setItem(HISTORY_KEY, currentHistory);
    return newItem;
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await localforage.getItem<HistoryItem[]>(HISTORY_KEY);
    return history || [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await localforage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
