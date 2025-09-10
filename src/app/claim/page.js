'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react'; // Add this import
import XVerification from "../components/XVerification";
import { IoMdArrowRoundBack } from "react-icons/io";
import Link from 'next/link';

export default function Claim() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [signOutLoading, setSignOutLoading] = useState(false); // Add loading state for sign out
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0
  });

  // Function to fetch tokens for the logged-in user
  const fetchUserTokens = async (page = 1) => {
    if (!user?.username) {
      console.log('No user or username available:', user);
      return;
    }
    
    console.log('Fetching tokens for user:', user.username, 'page:', page);
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/tokens?page=${page}&fee_account=@${user.username}`;
      console.log('Making API call to:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API response status:', response.status);
      console.log('API response data:', data);
      
      if (response.ok) {
        setTokens(data.tokens || []);
        setPagination(data.pagination || {});
        console.log('Successfully set tokens:', data.tokens?.length || 0, 'tokens');
      } else {
        console.error('Error fetching tokens:', data.error);
        setError(data.error || 'Failed to fetch tokens');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError('Network error while fetching tokens');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful X verification
  const handleVerificationSuccess = (userData) => {
    console.log('Verification success, received user data:', userData);
    setUser(userData);
  };

  // Handle sign out
  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOut({ 
        callbackUrl: '/claim',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  // Fetch tokens when user changes
  useEffect(() => {
    console.log('User state changed:', user);
    if (user?.username) {
      console.log('User has username, fetching tokens...');
      fetchUserTokens();
    }
  }, [user]);

  // Token list component with sign out button
  const TokenList = () => (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header with user info and sign out button */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Tokens (@{user?.username})
          </h2>
          <p className="text-gray-400">
            {pagination.total} token{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {/* User info and Sign Out Button */}
        <div className="flex items-center space-x-1">
          {/* User info display */}
          <div className="hidden sm:flex items-center space-x-2 bg-black rounded-lg px-3 py-1.5">
            <div className="relative">
              <img
                src={`https://unavatar.io/twitter/${user?.username}`}
                alt={`${user?.name || user?.username} profile picture`}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center absolute top-0 left-0" 
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || user?.username?.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-400 text-xs">@{user?.username}</p>
            </div>
            {user?.verified && (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-2 cursor-pointer"
          >
            {signOutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
          <button 
            onClick={() => fetchUserTokens()}
            className="mt-2 px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#67D682]"></div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No tokens found for your account.</p>
          <p className="text-gray-500 mt-2">Create your first token to get started!</p>
          <button 
            onClick={() => fetchUserTokens()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="bg-[#1E1F26] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {token.name}
                    </h3>
                    <p className="text-gray-400 text-sm">${token.symbol}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    token.status === 'active' 
                      ? 'bg-green-900 text-green-300' 
                      : token.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {token.status}
                  </span>
                </div>
                
                {token.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {token.description}
                  </p>
                )}
                
                <div className="space-y-2 text-xs text-gray-400">
                  {token.mint_address && (
                    <div>
                      <span className="font-medium">Address: </span>
                      <span className="font-mono">
                        {token.mint_address.slice(0, 8)}...{token.mint_address.slice(-8)}
                      </span>
                    </div>
                  )}
                  {token.total_supply && (
                    <div>
                      <span className="font-medium">Supply: </span>
                      {token.total_supply.toLocaleString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created: </span>
                    {new Date(token.created_at).toLocaleDateString()}
                  </div>
                </div>

                {token.metadata_uri && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <a
                      href={token.metadata_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Metadata →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => fetchUserTokens(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="px-4 py-2 bg-[#1E1F26] text-white rounded border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => fetchUserTokens(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                className="px-4 py-2 bg-[#1E1F26] text-white rounded border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  console.log('Rendering Claim component. User:', user);

  return (
    <div className="min-h-screen bg-[#15161B]">
      <Link
        href="/"
        className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500 hover:text-gray-300 transition-colors z-10"
      >
        <IoMdArrowRoundBack size={30} />
      </Link>

      <div className="min-h-screen flex flex-col justify-center items-center py-20">
        {!user ? (
          <XVerification onSuccess={handleVerificationSuccess} />
        ) : (
          <TokenList />
        )}
      </div>
    </div>
  );
}