"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt, FaTwitter, FaGlobe, FaSearch, FaFilter } from 'react-icons/fa';
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

  if (loading && tokens.length === 0) {
    return (
      <div className="bg-[#1A1B21] border border-[#2F3036] rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#2F3036] rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#2F3036] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters - Single Line */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Search - 80% */}
        <div className="relative w-[40%]">
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
        <div className="relative w-[10%]">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
          className="w-[10%] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center mx-[12.5%]'>
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative bg-[#15161B] border border-[#2F3036] rounded-lg p-4 hover:border-gray-500 transition-colors w-full ${
                isTestToken(token) ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Token Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {token.name} ({token.symbol})
                    </h3>
                    <span className="px-1.5 py-[3px] rounded-full text-[10px] font-medium bg-[#24252B] text-[#FAFAFA] border border-[#2F3036]">
                      {token.status}
                    </span>
                    {isTestToken(token) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        TEST
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {token.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {token.description}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-gray-300 font-mono text-xs break-all">
                            {token.mint_address
                            ? `${token.mint_address.slice(0, 3)}...${token.mint_address.slice(-4)}`
                            : ""}
                        </div>
                    </div>

                    {token.fee_account && (
                      <div className='absolute bottom-4 right-2'>
                        <Link
                            href={`https://x.com/${token.fee_account}`}
                            className="text-white bg-black py-2 px-3 rounded-md"
                            target="_blank" // optional: open in new tab
                            rel="noopener noreferrer" // optional: security best practice
                        >
                            {token.fee_account}
                        </Link>
                      </div>
                    )}

                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {/* Pump.fun Link */}
                  {token.mint_address && !isTestToken(token) && (
                    <a
                      href={`https://pump.fun/${token.mint_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1 -mr-2"
                    >
                      <img src="/pill.png" className='size-7'/>
                    </a>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-1">
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