import { useState, useEffect, useCallback } from 'react';

export const useTokens = (initialFilters = {}) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
    ...initialFilters
  });

  // Fetch tokens from API
  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value && value !== 'all') {
            acc[key] = value;
          }
          return acc;
        }, {})
      );
      
      const response = await fetch(`/api/tokens?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      const data = await response.json();
      setTokens(data.tokens);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch tokens when filters change
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filtering
      page: newFilters.search !== undefined || newFilters.status !== undefined ? 1 : prev.page
    }));
  }, []);

  // Navigate pages
  const goToPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refresh
  };
};