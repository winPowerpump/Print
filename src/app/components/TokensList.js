"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt, FaTwitter, FaGlobe, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import Link from 'next/link';

const TokensList = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    search: ''
  });

  // Fetch tokens from API
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
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
  };

  // Fetch tokens when filters change
  useEffect(() => {
    fetchTokens();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'search' || key === 'status' ? 1 : prev.page // Reset to page 1 when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if token is test data
  const isTestToken = (token) => {
    return token.raw_response?.test === true || 
           token.mint_address?.startsWith('test-') ||
           token.transaction_signature?.startsWith('test-');
  };

  // Get Twitter profile image URL using unavatar.io
  const getTwitterProfileImage = (username) => {
    if (!username) return null;
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    return `https://unavatar.io/twitter/${cleanUsername}`;
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#67D682]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters - Single Line */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {/* Search - 80% */}
        <div className="relative w-[50%] md:w-[40%]">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg pl-10 pr-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter - 10% */}
        <div className="relative w-[15%] md:w-[10%]">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="all">All</option>
            <option value="created">Created</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Refresh Button - 10% */}
        <button
          onClick={fetchTokens}
          disabled={loading}
          className="w-[10%] md:w-[5%] bg-[#15161B] border border-[#2F3036] text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center cursor-pointer"
        >
          <FaSync className={`text-lg ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-4">
        <AnimatePresence>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center mx-[5%] xl:mx-[10%]'>
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              className={`relative bg-[#15161B] border border-[#2F3036] rounded-lg p-4 hover:border-gray-500 transition-colors w-full ${
                isTestToken(token) ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Token Image - Left Side */}
                <div className="flex-shrink-0">
                  {token.image_uri ? (
                    <img
                      src={token.image_uri}
                      alt={`${token.name} logo`}
                      className="size-32 rounded-lg object-cover bg-[#24252B] border border-[#2F3036]"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzI0MjUyQiIvPgo8cGF0aCBkPSJNMzIgMjBMMzggMzJIMjZMMzIgMjBaIiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0zMiA0NEwyNiAzMkgzOEwzMiA0NFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
                      }}
                    />
                  ) : (
                    // Placeholder when no image
                    <div className="size-32 rounded-lg bg-[#24252B] border border-[#2F3036] flex items-center justify-center">
                      <div className="text-gray-500 text-xs font-mono">
                        {token.symbol ? token.symbol.slice(0, 3).toUpperCase() : '?'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Token Info - Right Side */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Name, Symbol, Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate">
                          {token.name}
                        </h3>
                        <span className="text-sm text-gray-400">
                          ({token.symbol})
                        </span>
                        {isTestToken(token) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            TEST
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#24252B] text-[#FAFAFA] border border-[#2F3036] hidden">
                        {token.status}
                      </span>
                    </div>

                    {/* Pump.fun Link */}
                    {token.mint_address && !isTestToken(token) && (
                      <a
                        href={`https://pump.fun/${token.mint_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <img src="/pill.png" className='w-7 h-7'/>
                      </a>
                    )}
                  </div>

                  {/* Description */}
                  {token.description && (
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {token.description}
                    </p>
                  )}

                  {/* Bottom Row: Contract Address */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {token.mint_address && (
                        <div className="text-gray-300 font-mono text-[10px] truncate">
                          {token.mint_address.slice(0, 3)}...{token.mint_address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fee Account Link with Twitter Profile Photo */}
                  {token.fee_account && (
                    <div className='absolute bottom-2 right-2'>
                      <Link
                        href={`https://x.com/${token.fee_account}`}
                        className="flex items-center gap-1 text-white bg-black py-1 px-2 rounded-md text-xs hover:bg-gray-800 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getTwitterProfileImage(token.fee_account) && (
                          <img
                            src={getTwitterProfileImage(token.fee_account)}
                            alt={`${token.fee_account} profile`}
                            className="w-4 h-4 rounded-full border border-gray-600"
                            onError={(e) => {
                              // Hide image if it fails to load
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{token.fee_account}</span>
                      </Link>
                    </div>
                  )}

                  {/* Hidden Social Links */}
                  <div className="gap-1 hidden">
                    {token.twitter_url && (
                      <a
                        href={token.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs transition-colors"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {token.website_url && (
                      <a
                        href={token.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-xs transition-colors"
                      >
                        <FaGlobe />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </AnimatePresence>

        {/* Empty State */}
        {tokens.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No tokens found</div>
            <div className="text-gray-500 text-sm">
              {filters.search || filters.status !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first token to see it here'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2F3036]">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="bg-[#2F3036] hover:bg-[#404146] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="bg-[#2F3036] hover:bg-[#404146] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokensList;