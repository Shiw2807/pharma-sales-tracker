
const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.REACT_APP_API_URL) {
      console.error("REACT_APP_API_URL is not set in production!");
      return "https://pharma-sales-backend.onrender.com";
    }
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }

  return "http://localhost:5001";
};
const API_URL = getApiUrl();

export default API_URL;
