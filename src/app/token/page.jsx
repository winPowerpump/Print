"use client"

import React, { useState } from 'react';
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
    website: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [showLinks, setShowLinks] = useState(false);

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
    const apiKey = process.env.NEXT_PUBLIC_PUMPPORTAL_API_KEY;
    
    if (!apiKey) {
      setError('PumpPortal API key not configured');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const metadataFormData = new FormData();
      metadataFormData.append('name', formData.name);
      metadataFormData.append('symbol', formData.symbol);
      metadataFormData.append('description', formData.description);
      metadataFormData.append('twitter', formData.twitter || '');
      metadataFormData.append('telegram', formData.telegram || '');
      metadataFormData.append('website', formData.website || '');
      metadataFormData.append('showName', 'true');
      
      if (formData.image) {
        metadataFormData.append('file', formData.image);
      }

      const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: metadataFormData
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataResult = await metadataResponse.json();

      const createTokenPayload = {
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataResult.metadataUri,
        action: 'create',
        denominatedInSol: 'true',
        amount: 0,
        slippage: 10,
        priorityFee: 0.0001,
        pool: 'pump'
      };

      const createResponse = await fetch(`https://pumpportal.fun/api/trade?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createTokenPayload)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Failed to create token');
      }

      const result = await createResponse.json();
      setTokenData({
        signature: result.signature,
        mint: result.mint,
        metadataUri: metadataResult.metadataUri
      });
      setSuccess(true);
      
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: null,
        twitter: '',
        telegram: '',
        website: ''
      });
      setPreviewImage('');

    } catch (err) {
      setError(err.message || 'An error occurred while creating the token');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError('');
    setTokenData(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your pump token has been deployed on Solana.</p>
          
          {tokenData && (
            <div className="space-y-4 mb-6">
              {tokenData.mint && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Token Address:</p>
                  <p className="text-gray-900 font-mono text-sm break-all">{tokenData.mint}</p>
                </div>
              )}
              
              {tokenData.signature && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Transaction Signature:</p>
                  <a 
                    href={`https://solscan.io/tx/${tokenData.signature}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-mono text-sm break-all"
                  >
                    {tokenData.signature}
                  </a>
                </div>
              )}
              
              {tokenData.mint && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">View on Pump.fun:</p>
                  <a 
                    href={`https://pump.fun/${tokenData.mint}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline break-all"
                  >
                    https://pump.fun/{tokenData.mint}
                  </a>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={resetForm}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Another Token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 flex items-center">
      <div className="w-xl mx-auto">

        <Link
          href="/"
          className="absolute top-[3%] left-[3%] px-4 py-2 text-gray-700"
        >
          <IoMdArrowRoundBack size={30} />
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <span className="text-red-600 font-semibold mr-2">!</span>
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Image</label>
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
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-black rounded mb-2 flex items-center justify-center text-white text-sm">+</div>
                      <span className="text-gray-500">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Printed"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Symbol*</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="PRINT"
                required
                maxLength="10"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell the world about your token..."
                rows={2}
                maxLength="500"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowLinks(!showLinks)}
                className="flex items-center justify-between w-full py-1 text-gray-700 font-semibold"
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Twitter</label>
                          <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder="https://twitter.com/..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Telegram</label>
                          <input
                            type="url"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleInputChange}
                            placeholder="https://t.me/..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Website</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              className="w-full bg-black text-white py-4 px-6 rounded-lg font-bold text-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Token...
                </>
              ) : (
                'Create Token'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpTokenCreator;