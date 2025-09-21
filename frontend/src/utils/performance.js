// Measure component render time
export const measurePerformance = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    console.time(`${componentName} Render`);
    return () => console.timeEnd(`${componentName} Render`);
  }
  return () => {};
};

// Debounce function for optimizing frequent calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for limiting execution rate
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Lazy load images
export const lazyLoadImage = (imageSrc, callback) => {
  const img = new Image();
  img.onload = () => callback(imageSrc);
  img.src = imageSrc;
};

export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const calculateVisibleItems = (
  containerHeight,
  itemHeight,
  scrollTop,
  totalItems,
  buffer = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1
  };
};