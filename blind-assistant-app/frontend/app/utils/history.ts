import localforage from 'localforage';

export interface HistoryItem {
  id: string;
  imageBlob: Blob;
  description: string;
  timestamp: number;
}

const HISTORY_KEY = 'app_history_items';
const MAX_HISTORY = 30;

export const saveHistory = async (item: Omit<HistoryItem, 'id'>) => {
  try {
    const currentHistory = await getHistory();
    const newItem: HistoryItem = {
      ...item,
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
