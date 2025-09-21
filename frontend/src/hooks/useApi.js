import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Custom hook for API calls with loading, error, and data states
 */
export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        ...options,
        params: { ...options.params, ...params }
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      if (options.showError !== false) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (options.immediate !== false && options.method === 'GET') {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 */
export const useApiMutation = (url, method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (data, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url: config.url || url,
        method: config.method || method,
        data,
        ...config
      });
      
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      if (config.showError !== false) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  return { mutate, loading, error };
};