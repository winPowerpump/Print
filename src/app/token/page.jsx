"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import Link from 'next/link';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

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
      console.log('Starting token creation process...');
      
      // Generate a proper Solana keypair for the token mint
      const mintKeypair = Keypair.generate();
      console.log('Generated mint keypair:', mintKeypair.publicKey.toString());
      
      // Step 1: Upload metadata to IPFS
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

      console.log('Uploading metadata to IPFS...');
      const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: metadataFormData
      });

      console.log('Metadata response status:', metadataResponse.status);
      
      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error('Metadata upload failed:', errorText);
        throw new Error(`Failed to upload metadata to IPFS: ${metadataResponse.status} - ${errorText}`);
      }

      const metadataResult = await metadataResponse.json();
      console.log('Metadata result:', metadataResult);

      if (!metadataResult.metadataUri) {
        throw new Error('No metadata URI returned from IPFS upload');
      }

      // Step 2: Create the token using the correct payload format
      const createTokenPayload = {
        action: 'create',
        tokenMetadata: {
          name: formData.name,
          symbol: formData.symbol,
          uri: metadataResult.metadataUri
        },
        mint: bs58.encode(mintKeypair.secretKey), // Use secret key, not public key
        denominatedInSol: 'true',
        amount: 0, // 0.02 SOL initial buy
        slippage: 10,
        priorityFee: 0.0001,
        pool: 'pump'
      };

      console.log('Creating token with payload:', createTokenPayload);

      const createResponse = await fetch(`https://pumpportal.fun/api/trade?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createTokenPayload)
      });

      console.log('Create token response status:', createResponse.status);

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Token creation failed:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        // Handle specific API errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.join(', ');
          throw new Error(`API Validation Error: ${errorMessages}`);
        }
        
        throw new Error(errorData.message || `Failed to create token: ${createResponse.status} - ${errorText}`);
      }

      const result = await createResponse.json();
      console.log('Token creation result:', result);
      console.log('Result keys:', Object.keys(result));
      console.log('Full result object:', JSON.stringify(result, null, 2));

      // Handle error responses that come back as 200 OK
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        const errorMessages = result.errors.join(', ');
        console.error('API returned errors:', result.errors);
        throw new Error(`API Validation Error: ${errorMessages}`);
      }

      // Check what fields are actually present
      const hasSignature = result.signature || result.txSignature || result.transaction || result.hash;
      const hasMint = result.mint || result.mintAddress || result.token || result.tokenAddress || mintKeypair.publicKey.toString();
      
      console.log('Has signature-like field:', hasSignature);
      console.log('Has mint-like field:', hasMint);

      // More flexible validation
      if (!result || typeof result !== 'object') {
        console.error('Invalid response type from token creation:', result);
        throw new Error('Invalid response from token creation API - not an object');
      }

      if (Object.keys(result).length === 0) {
        console.error('Empty response from token creation:', result);
        throw new Error('Empty response from token creation API');
      }

      setTokenData({
        signature: result.signature || result.txSignature || result.transaction || result.hash || 'Unknown',
        mint: result.mint || result.mintAddress || result.token || result.tokenAddress || mintKeypair.publicKey.toString(),
        metadataUri: metadataResult.metadataUri,
        rawResponse: result, // Include the full response for debugging
        ...result // Include any additional data from the response
      });
      
      setSuccess(true);
      
      // Clear form
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
      console.error('Token creation error:', err);
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
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your pump token has been deployed on Solana.</p>
          
          {tokenData && (
            <div className="space-y-4 mb-6">
              {/* Raw API Response */}
              <div className="bg-yellow-50 rounded-lg p-4 text-left">
                <p className="text-xs text-yellow-700 mb-2 font-semibold">Raw API Response:</p>
                <pre className="text-xs text-yellow-800 overflow-auto max-h-32 bg-yellow-100 p-2 rounded">
                  {JSON.stringify(tokenData.rawResponse || tokenData, null, 2)}
                </pre>
              </div>
              
              {/* Processed data */}
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <p className="text-xs text-blue-600 mb-2">Processed Data:</p>
                <pre className="text-xs text-blue-700 overflow-auto">
                  {JSON.stringify({
                    signature: tokenData.signature,
                    mint: tokenData.mint,
                    metadataUri: tokenData.metadataUri
                  }, null, 2)}
                </pre>
              </div>
              
              {tokenData.mint && tokenData.mint !== 'Unknown' && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Token Address:</p>
                  <p className="text-gray-900 font-mono text-sm break-all">{tokenData.mint}</p>
                </div>
              )}
              
              {tokenData.signature && tokenData.signature !== 'Unknown' && (
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
              
              {tokenData.mint && tokenData.mint !== 'Unknown' && (
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

              {tokenData.metadataUri && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Metadata URI:</p>
                  <a 
                    href={tokenData.metadataUri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                  >
                    {tokenData.metadataUri}
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
    <div className="min-h-screen bg-[#15161B] p-4 flex items-center">
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

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 font-semibold mb-2">Image</label>
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
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2F3036] rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-[#24252B]"
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="w-8 h-8 border border-[#2F3036] rounded mb-2 flex items-center justify-center text-white text-sm">+</div>
                      <span className="text-gray-500">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-2">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Printed"
                required
                className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-2">Ticker*</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="PRINT"
                required
                maxLength="10"
                className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell the world about your token..."
                rows={2}
                maxLength="500"
                className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">Twitter</label>
                          <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            placeholder="https://twitter.com/..."
                            className="w-full bg-[#24252B] border border-[#2F3036] rounded-lg px-3 py-2 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">Telegram</label>
                          <input
                            type="url"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleInputChange}
                            placeholder="https://t.me/..."
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpTokenCreator;