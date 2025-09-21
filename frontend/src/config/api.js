// API configuration
// Remove trailing slash if present to avoid double slashes in URLs
const getApiUrl = () => {
  // In production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REACT_APP_API_URL) {
      console.error('REACT_APP_API_URL is not set in production!');
      // Fallback - but this should not happen in proper deployment
      return 'https://pharma-sales-backend.onrender.com';
    }
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  
  // In development, use localhost
  return 'http://localhost:5001';
};

const API_URL = getApiUrl();

// Log the API URL for debugging (remove in production)
console.log('API URL configured as:', API_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);

export default API_URL;