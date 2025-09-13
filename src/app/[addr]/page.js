// token/[addr]/page.js
'use client';

import { useState, useEffect } from 'react';
import { IoMdArrowRoundBack, IoMdCopy } from "react-icons/io";
import { FiExternalLink, FiTwitter, FiGlobe } from "react-icons/fi";
import { FaTelegram } from "react-icons/fa";
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Token() {
  const params = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (params.addr) {
      fetchToken();
    }
  }, [params.addr]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tokens/${params.addr}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch token');
      }

      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const truncateAddress = (address, start = 8, end = 8) => {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'inactive':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15161B] flex items-center justify-center">
        <div className="animate-spin rounded-full size-8 border-2 border-gray-300 border-t-[#67D682]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#15161B]">
        <Link
          href="/"
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500"
        >
          <IoMdArrowRoundBack size={30} />
        </Link>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#15161B]">
        <Link
          href="/"
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500"
        >
          <IoMdArrowRoundBack size={30} />
        </Link>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">Token Not Found</h1>
            <p className="text-gray-500">The requested token could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15161B] text-white flex items-center">
      {/* Header */}
      <Link
        href="/"
        className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500 rounded-lg"
      >
        <IoMdArrowRoundBack size={30} />
      </Link>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Token Header - Centered */}
        <div className="flex flex-col items-center text-center mb-8">
          {token.image_uri && (
            <div className="mb-6">
              <img
                src={token.image_uri}
                alt={token.name}
                className="w-32 h-32 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-token.png';
                }}
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold mb-2">{token.name}</h1>
            <p className="text-2xl text-gray-400 mb-4">${token.symbol}</p>
            {token.description && (
              <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">{token.description}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">

          <div className="bg-[#1E1F26] rounded-lg p-3">
            <div className="flex items-center gap-2">
                <div className="flex-1 text-sm text-gray-400 px-3 py-2 rounded text-center break-all">
                    {token.mint_address.slice(0, 4)}...{token.mint_address.slice(-4)}
                </div>
                <button
                    onClick={() => copyToClipboard(token.mint_address, 'mint')}
                    className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy mint address"
                >
                {copiedField === 'mint' ? (
                    <svg className="size-[20px] text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="size-[20px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
                </button>
            </div>
          </div>

          <Link href={`https://x.com/${token.fee_account}`}>
            {token.fee_account && (
                <div className="bg-black rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-white px-3 py-2 rounded text-center">
                            {token.fee_account}
                        </code>
                    </div>
                </div>
            )}
          </Link>

          {/* Social Links */}
          {(token.website_url || token.twitter_url || token.telegram_url) && (
            <div className="bg-[#1E1F26] border border-gray-700 rounded-lg p-6">
              <label className="text-sm text-gray-400 block mb-4 text-center">Social Links</label>
              <div className="flex justify-center gap-4">
                {token.website_url && (
                  <a
                    href={token.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FiGlobe className="text-gray-300" />
                    <span className="text-white">Website</span>
                    <FiExternalLink size={14} className="text-gray-400" />
                  </a>
                )}
                
                {token.twitter_url && (
                  <a
                    href={token.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FiTwitter className="text-gray-300" />
                    <span className="text-white">Twitter</span>
                    <FiExternalLink size={14} className="text-gray-400" />
                  </a>
                )}
                
                {token.telegram_url && (
                  <a
                    href={token.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FaTelegram className="text-gray-300" />
                    <span className="text-white">Telegram</span>
                    <FiExternalLink size={14} className="text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className='w-full border-b-2 py-1 border-gray-700'></div>

          <Link href={`https://pump.fun/coin/${token.mint_address}`} className="block">
            {token.fee_account && (
                <div className="bg-black rounded-lg p-2">
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-gray-300 px-3 py-2 rounded text-center">
                            <div className="flex justify-center items-center gap-2">
                                <img src="pill.png" className='size-8' />
                                View on pump
                            </div>
                        </code>
                    </div>
                </div>
            )}
          </Link>

          <Link href="https://jup.ag/" className="block">
            {token.fee_account && (
                <div className="bg-black rounded-lg p-2">
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-gray-300 px-3 py-2 rounded text-center">
                            <div className="flex justify-center items-center gap-2">
                                <img src="logo.png" className='size-7' />
                                Buy on Jupiter
                            </div>
                        </code>
                    </div>
                </div>
            )}
          </Link>

        </div>
      </div>
    </div>
  );
}