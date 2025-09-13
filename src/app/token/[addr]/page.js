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
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500 hover:text-white transition-colors"
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
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500 hover:text-white transition-colors"
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
    <div className="min-h-screen bg-[#15161B] text-white">
      {/* Header */}
      <div className="relative px-6 py-8">
        <Link
          href="/"
          className="absolute top-8 left-6 p-2 text-gray-500 rounded-lg"
        >
          <IoMdArrowRoundBack size={24} />
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Token Header */}
        <div className="flex items-start just gap-6 mb-8">
          {token.image_uri && (
            <div className="flex-shrink-0">
              <img
                src={token.image_uri}
                alt={token.name}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-token.png';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{token.name}</h1>
            </div>
            <p className="text-xl text-gray-400 mb-4">${token.symbol}</p>
            {token.description && (
              <p className="text-gray-300 leading-relaxed">{token.description}</p>
            )}
          </div>
        </div>

        {/* Token Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Addresses */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Addresses</h2>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <label className="text-sm text-gray-400 block mb-2">Mint Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-gray-200 bg-gray-900 px-3 py-2 rounded">
                  {truncateAddress(token.mint_address, 12, 12)}
                </code>
                <button
                  onClick={() => copyToClipboard(token.mint_address, 'mint')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy mint address"
                >
                  <IoMdCopy size={18} />
                </button>
                {copiedField === 'mint' && (
                  <span className="text-green-400 text-sm">Copied!</span>
                )}
              </div>
            </div>

            {token.fee_account && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="text-sm text-gray-400 block mb-2">Fee Account</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-200 bg-gray-900 px-3 py-2 rounded">
                    {token.fee_account}
                  </code>
                  <button
                    onClick={() => copyToClipboard(token.fee_account, 'fee')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy fee account"
                  >
                    <IoMdCopy size={18} />
                  </button>
                  {copiedField === 'fee' && (
                    <span className="text-green-400 text-sm">Copied!</span>
                  )}
                </div>
              </div>
            )}

            {token.wallet_id && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <label className="text-sm text-gray-400 block mb-2">Wallet ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-200 bg-gray-900 px-3 py-2 rounded">
                    {truncateAddress(token.wallet_id)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(token.wallet_id, 'wallet')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy wallet ID"
                  >
                    <IoMdCopy size={18} />
                  </button>
                  {copiedField === 'wallet' && (
                    <span className="text-green-400 text-sm">Copied!</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Social Links & Metadata */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Links & Info</h2>
            
            {/* Social Links */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <label className="text-sm text-gray-400 block mb-3">Social Links</label>
              <div className="space-y-2">
                {token.website_url && (
                  <a
                    href={token.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    <FiGlobe className="text-gray-400" />
                    <span className="text-blue-400 hover:text-blue-300">Website</span>
                    <FiExternalLink size={14} className="text-gray-500" />
                  </a>
                )}
                
                {token.twitter_url && (
                  <a
                    href={token.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    <FiTwitter className="text-gray-400" />
                    <span className="text-blue-400 hover:text-blue-300">Twitter</span>
                    <FiExternalLink size={14} className="text-gray-500" />
                  </a>
                )}
                
                {token.telegram_url && (
                  <a
                    href={token.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    <FaTelegram className="text-gray-400" />
                    <span className="text-blue-400 hover:text-blue-300">Telegram</span>
                    <FiExternalLink size={14} className="text-gray-500" />
                  </a>
                )}

                {!token.website_url && !token.twitter_url && !token.telegram_url && (
                  <p className="text-gray-500 text-sm">No social links available</p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <label className="text-sm text-gray-400 block mb-3">Metadata</label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-gray-200">{formatDate(token.created_at)}</span>
                </div>
                {token.wallet_public_key && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Public Key</span>
                    <span className="text-gray-200 font-mono text-sm">
                      {truncateAddress(token.wallet_public_key)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Signature */}
        {token.transaction_signature && (
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 min-w-0">Transaction Signature:</label>
              <code className="flex-1 text-sm font-mono text-gray-200 bg-gray-900 px-3 py-2 rounded min-w-0">
                {truncateAddress(token.transaction_signature, 16, 16)}
              </code>
              <button
                onClick={() => copyToClipboard(token.transaction_signature, 'tx')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Copy transaction signature"
              >
                <IoMdCopy size={18} />
              </button>
              {copiedField === 'tx' && (
                <span className="text-green-400 text-sm">Copied!</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}