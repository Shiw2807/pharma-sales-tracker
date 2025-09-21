// API configuration
// Remove trailing slash if present to avoid double slashes in URLs
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default API_URL;