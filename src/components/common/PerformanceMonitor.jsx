import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor navigation performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Navigation Performance:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart
          });
        }
        
        if (entry.entryType === 'measure' && entry.name.includes('React')) {
          console.log('React Performance:', entry.name, entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor route changes
    let routeChangeStart = performance.now();
    
    const handleRouteChange = () => {
      const routeChangeEnd = performance.now();
      const duration = routeChangeEnd - routeChangeStart;
      
      if (duration > 100) {
        console.warn(`Slow route change detected: ${duration.toFixed(2)}ms`);
      }
      
      routeChangeStart = performance.now();
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Monitor for pushState/replaceState (React Router)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      handleRouteChange();
      return originalPushState.apply(this, args);
    };
    
    history.replaceState = function(...args) {
      handleRouteChange();
      return originalReplaceState.apply(this, args);
    };

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
};

export default PerformanceMonitor;