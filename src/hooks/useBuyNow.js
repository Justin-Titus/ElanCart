import { useState, useEffect, useCallback } from 'react';

const BUYNOW_STORAGE_KEY = 'buyNowData';

export const useBuyNow = () => {
  const [buyNowData, setBuyNowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store buyNow data
  const storeBuyNowData = (data) => {
    try {
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(BUYNOW_STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      setBuyNowData(dataWithTimestamp);
      return true;
    } catch (error) {
      console.error('Failed to store buyNow data:', error);
      return false;
    }
  };

  // Load buyNow data
  const loadBuyNowData = useCallback(() => {
    try {
      const storedData = sessionStorage.getItem(BUYNOW_STORAGE_KEY);
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Check if data is valid and not too old (1 hour max)
        const hasBuyNowFlag = parsed.buyNow === true;
        const hasValidItems = Array.isArray(parsed.items) && parsed.items.length > 0;
        const hasTimestamp = !!parsed.timestamp;
        const isNotExpired = hasTimestamp ? (Date.now() - parsed.timestamp) < 3600000 : true; // Allow data without timestamp for backward compatibility
        
        const isValid = hasBuyNowFlag && hasValidItems && isNotExpired;
        
        if (isValid) {
          setBuyNowData(parsed);
          return parsed;
        } else {
          // Clear invalid/expired data
          clearBuyNowData();
        }
      }
    } catch (error) {
      console.error('🗄️ useBuyNow: Failed to load buyNow data:', error);
      clearBuyNowData();
    }
    return null;
  }, []);

  // Clear buyNow data
  const clearBuyNowData = () => {
    try {
      sessionStorage.removeItem(BUYNOW_STORAGE_KEY);
      setBuyNowData(null);
    } catch (error) {
      console.error('Failed to clear buyNow data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadBuyNowData();
    setIsLoading(false);
  }, [loadBuyNowData]);

  return {
    buyNowData,
    isLoading,
    storeBuyNowData,
    loadBuyNowData,
    clearBuyNowData,
    hasBuyNowData: !!buyNowData
  };
};