"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import Link from 'next/link';

const PumpTokenCreator = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    image: null,
    twitter: '',
    telegram: '',
    website: '',
    directFeesTo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [showLinks, setShowLinks] = useState(false);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost');

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setTokenData(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const createPumpToken = async () => {
    if (!formData.name || !formData.symbol) {
      setError('Name and symbol are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Starting token creation via API...');
      
      // Prepare form data for API
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('symbol', formData.symbol);
      apiFormData.append('description', formData.description);
      apiFormData.append('twitter', formData.twitter);
      apiFormData.append('telegram', formData.telegram);
      apiFormData.append('website', formData.website);
      apiFormData.append('directFeesTo', formData.directFeesTo);
      
      if (formData.image) {
        apiFormData.append('image', formData.image);
      }

      // Call API route
      const response = await fetch('/api/tokens/create', {
        method: 'POST',
        body: apiFormData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `API Error: ${response.status}`);
      }

      console.log('Token creation successful:', result);

      setTokenData(result.token);
      setSuccess(true);
      
      // Clear form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: null,
        twitter: '',
        telegram: '',
        website: '',
        directFeesTo: ''
      });
      setPreviewImage('');

    } catch (err) {
      console.error('Token creation error:', err);
      setError(err.message || 'An error occurred while creating the token');
    } finally {
      setLoading(false);
    }
  };

  // Test function for localhost development
  const testToast = async () => {
    const testTokenData = {
      signature: 'test123signature',
      mint: 'test-mint-address',
      metadataUri: 'https://example.com/metadata.json',
      tokenName: 'Test Token',
      tokenSymbol: 'TEST',
      rawResponse: { test: 'data' }
    };
    
    setTokenData(testTokenData);
    setSuccess(true);
  };

  const resetForm = () => {
    setSuccess(false);
    setError('');
    setTokenData(null);
  };

  return (
    <div className="min-h-screen bg-[#15161B] p-4 flex items-center">
      {/* Success Toast */}
      <AnimatePresence>
        {success && tokenData && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-3">
              <span className="font-semibold">
                {tokenData.tokenName} ({tokenData.tokenSymbol}) created!
              </span>
              {tokenData.mint && tokenData.mint !== 'Unknown' && (
                <a
                  href={isDevelopment ? 'https://pump.fun/board' : `https://pump.fun/${tokenData.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-green-500 px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  View
                </a>
              )}
              <button
                onClick={() => setSuccess(false)}
                className="text-white hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-xl mx-auto">
        <Link
          href="/"
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-500"
        >
          <IoMdArrowRoundBack size={30} />
        </Link>

        <div className="bg-[#15161B] border border-[#2F3036] rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <span className="text-red-600 font-semibold mr-2">!</span>
              <div className="flex-1">
                <span className="text-red-700 block">{error}</span>
                <div className="mt-2">
                  <button 
                    onClick={() => console.log('Current form data:', formData)}
                    className="text-red-600 underline text-sm"
                  >
                    Log form data to console
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* Image and Name/Ticker split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image section - left half */}
              <div>
                <label className="block text-gray-400 font-semibold mb-2">Image*</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-37 border-2 border-dashed border-[#2F3036] rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-[#24252B]"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="w-8 h-8 border border-[#2F3036] rounded mb-2 md:mb-0 flex items-center justify-center text-white text-sm">+</div>
                        <span className="text-gray-500">Click to upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Name and Ticker stacked - right half */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-2">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Printed"
                    required
                    className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-2">Ticker*</label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="PRINTED"
                    required
                    maxLength="10"
                    className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell the world about your token..."
                rows={1}
                maxLength="500"
                className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 hidden">{formData.description.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-2">Fee Account*</label>
              <input
                type="text"
                name="directFeesTo"
                value={formData.directFeesTo}
                onChange={handleInputChange}
                placeholder="@printedwtf"
                className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowLinks(!showLinks)}
                className="flex items-center justify-between w-full py-1 text-gray-400 font-semibold"
              >
                <span>Social Links (Optional)</span>
                <motion.div
                  animate={{ rotate: showLinks ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showLinks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">X/Twitter</label>
                          <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder="https://x.com/..."
                            className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-3 py-2 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">Website</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-3 py-2 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={createPumpToken}
              disabled={loading || !formData.name || !formData.symbol}
              className="w-full bg-[#67D682] text-white py-4 px-6 rounded-lg font-bold text-lg transform hover:scale-[101%] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>

            {/* Test button for development */}
            {isDevelopment && (
              <button
                type="button"
                onClick={testToast}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2"
              >
                Test Toast (Dev Only)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpTokenCreator;