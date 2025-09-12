import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

export async function POST(request) {
  let walletId = null; // Track wallet ID for logging activities
  
  try {
    const formData = await request.formData();
    
    // Extract form data
    const tokenData = {
      name: formData.get('name'),
      symbol: formData.get('symbol'),
      description: formData.get('description') || '',
      twitter: formData.get('twitter') || '',
      telegram: formData.get('telegram') || '',
      website: formData.get('website') || '',
      directFeesTo: formData.get('directFeesTo') || '',
      image: formData.get('image')
    };

    // Validate required fields
    if (!tokenData.name || !tokenData.symbol) {
      return NextResponse.json(
        { error: 'Name and symbol are required' },
        { status: 400 }
      );
    }

    const fundingWalletPrivateKey = process.env.FUNDING_WALLET_PRIVATE_KEY;

    if (!fundingWalletPrivateKey) {
      return NextResponse.json(
        { error: 'Funding wallet private key not configured' },
        { status: 500 }
      );
    }

    console.log('Starting secure wallet creation and token launch process...');
    
    // Step 1: Create a new wallet using PumpPortal
    console.log('Creating new secure wallet with PumpPortal...');
    
    const createWalletResponse = await fetch('https://pumpportal.fun/api/create-wallet', {
      method: 'GET',
    });

    if (!createWalletResponse.ok) {
      const errorText = await createWalletResponse.text();
      console.error('Wallet creation failed:', errorText);
      throw new Error(`Failed to create wallet: ${createWalletResponse.status} - ${errorText}`);
    }

    const walletResult = await createWalletResponse.json();
    console.log('Wallet creation result (public key only):', { publicKey: walletResult.publicKey });

    if (!walletResult.walletPublicKey || !walletResult.privateKey || !walletResult.apiKey) {
      throw new Error('Invalid wallet creation response - missing required fields');
    }

    // Step 2: IMMEDIATELY save wallet securely to database
    const walletInfo = {
      public_key: walletResult.walletPublicKey,  // Use direct field from PumpPortal
      private_key: walletResult.privateKey,      // Use direct field from PumpPortal
      api_key: walletResult.apiKey,              // Use direct field from PumpPortal
      initial_balance_sol: 0,
      created_at: new Date().toISOString(),
      creator_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      is_active: true,
      notes: `Created for token: ${tokenData.name} (${tokenData.symbol})`
    };

    console.log('Saving secure wallet to database...');
    
    const { data: savedWallet, error: walletError } = await supabase
      .from('secure_wallets')
      .insert([walletInfo])
      .select()
      .single();

    if (walletError) {
      console.error('Secure wallet save error:', walletError);
      throw new Error('Failed to securely store wallet credentials');
    }

    walletId = savedWallet.id;
    console.log('Secure wallet saved with ID:', walletId);

    // Log wallet creation activity
    await supabase.from('wallet_activities').insert([{
      wallet_id: walletId,
      activity_type: 'created',
      activity_description: `Wallet created for token ${tokenData.name} (${tokenData.symbol})`,
      created_at: new Date().toISOString()
    }]);

    // Step 3: Fund the new wallet
    console.log('Funding new wallet with 0.025 SOL...');
    
    const fundingKeypair = Keypair.fromSecretKey(bs58.decode(fundingWalletPrivateKey));
    // 🔧 FIX: Use walletResult.walletPublicKey instead of newWallet.publicKey
    const newWalletPubkey = new PublicKey(walletResult.walletPublicKey);
    
    const fundingAmount = 0.025 * LAMPORTS_PER_SOL;
    
    const fundingTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fundingKeypair.publicKey,
        toPubkey: newWalletPubkey,
        lamports: fundingAmount,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    fundingTransaction.recentBlockhash = blockhash;
    fundingTransaction.feePayer = fundingKeypair.publicKey;

    fundingTransaction.sign(fundingKeypair);
    const fundingSignature = await connection.sendRawTransaction(fundingTransaction.serialize());
    
    console.log('Funding transaction signature:', fundingSignature);
    
    await connection.confirmTransaction(fundingSignature, 'confirmed');
    console.log('Wallet funded successfully');

    // Update wallet with funding info
    await supabase
      .from('secure_wallets')
      .update({ 
        funding_transaction: fundingSignature,
        initial_balance_sol: 0.025
      })
      .eq('id', walletId);

    // Log funding activity
    await supabase.from('wallet_activities').insert([{
      wallet_id: walletId,
      activity_type: 'funded',
      activity_description: 'Wallet funded with initial SOL',
      transaction_signature: fundingSignature,
      amount_sol: 0.025,
      created_at: new Date().toISOString()
    }]);

    // Step 4: Generate mint keypair and upload metadata
    const mintKeypair = Keypair.generate();
    console.log('Generated mint keypair:', mintKeypair.publicKey.toString());
    
    const metadataFormData = new FormData();
    metadataFormData.append('name', tokenData.name);
    metadataFormData.append('symbol', tokenData.symbol);
    metadataFormData.append('description', tokenData.description);
    metadataFormData.append('twitter', tokenData.twitter);
    metadataFormData.append('telegram', tokenData.telegram);
    metadataFormData.append('website', tokenData.website);
    metadataFormData.append('showName', 'true');
    
    if (tokenData.image && tokenData.image.size > 0) {
      metadataFormData.append('file', tokenData.image);
    }

    console.log('Uploading metadata to IPFS...');
    const metadataResponse = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: metadataFormData
    });
    
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Metadata upload failed:', errorText);
      throw new Error(`Failed to upload metadata to IPFS: ${metadataResponse.status} - ${errorText}`);
    }

    const metadataResult = await metadataResponse.json();

    if (!metadataResult.metadataUri) {
      throw new Error('No metadata URI returned from IPFS upload');
    }

    // Step 5: Create the token using the secure wallet's API key
    const createTokenPayload = {
      action: 'create',
      tokenMetadata: {
        name: tokenData.name,
        symbol: tokenData.symbol,
        uri: metadataResult.metadataUri
      },
      mint: bs58.encode(mintKeypair.secretKey),
      denominatedInSol: 'true',
      amount: 0,
      slippage: 10,
      priorityFee: 0.0001,
      pool: 'pump'
    };

    console.log('Creating token with secure wallet...');

    // 🔧 FIX: Use walletResult.apiKey instead of newWallet.apiKey
    const createResponse = await fetch(`https://pumpportal.fun/api/trade?api-key=${walletResult.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createTokenPayload)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Token creation failed:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.join(', ');
        throw new Error(`API Validation Error: ${errorMessages}`);
      }
      
      throw new Error(errorData.message || `Failed to create token: ${createResponse.status} - ${errorText}`);
    }

    const result = await createResponse.json();

    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMessages = result.errors.join(', ');
      throw new Error(`API Validation Error: ${errorMessages}`);
    }

    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
      throw new Error('Invalid response from token creation API');
    }

    // Get image URI
    let imageUri = metadataResult.image || null;
    if (!imageUri && metadataResult.metadataUri) {
      try {
        const metadataFetch = await fetch(metadataResult.metadataUri);
        if (metadataFetch.ok) {
          const metadataFromUri = await metadataFetch.json();
          imageUri = metadataFromUri.image || null;
        }
      } catch (error) {
        console.warn('Failed to fetch metadata from URI:', error.message);
      }
    }

    // Step 6: Save token info (NON-sensitive data only)
    const tokenInfo = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description || null,
      mint_address: result.mint || result.mintAddress || result.token || result.tokenAddress || mintKeypair.publicKey.toString(),
      transaction_signature: result.signature || result.txSignature || result.transaction || result.hash || 'Unknown',
      metadata_uri: metadataResult.metadataUri,
      image_uri: imageUri,
      fee_account: tokenData.directFeesTo || null,
      twitter_url: tokenData.twitter || null,
      telegram_url: tokenData.telegram || null,
      website_url: tokenData.website || null,
      status: 'created',
      raw_response: result,
      // Safe wallet reference (no sensitive data)
      wallet_id: walletId,
      // 🔧 FIX: Use walletResult.walletPublicKey instead of newWallet.publicKey
      wallet_public_key: walletResult.walletPublicKey, // Safe to store public key
      creator_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    const { data: savedToken, error: tokenError } = await supabase
      .from('tokens')
      .insert([tokenInfo])
      .select()
      .single();

    if (tokenError) {
      console.error('Token save error:', tokenError);
      console.warn('Token created successfully but failed to save to database');
    }

    // Log token launch activity
    if (savedToken) {
      await supabase.from('wallet_activities').insert([{
        wallet_id: walletId,
        activity_type: 'token_launched',
        activity_description: `Token launched: ${tokenData.name} (${tokenData.symbol})`,
        transaction_signature: tokenInfo.transaction_signature,
        created_at: new Date().toISOString()
      }]);

      // Update secure wallet with associated token
      await supabase
        .from('secure_wallets')
        .update({ 
          notes: `Token launched: ${tokenData.name} (${tokenData.symbol}) - Mint: ${tokenInfo.mint_address}`
        })
        .eq('id', walletId);
    }

    // Return success response (NO sensitive wallet data)
    return NextResponse.json({
      success: true,
      wallet: {
        id: walletId,
        // 🔧 FIX: Use walletResult.walletPublicKey instead of newWallet.publicKey
        publicKey: walletResult.walletPublicKey, // Safe to return
        fundingSignature: fundingSignature
        // NOTE: privateKey and apiKey are NOT returned for security
      },
      token: {
        id: savedToken?.id || null,
        signature: tokenInfo.transaction_signature,
        mint: tokenInfo.mint_address,
        metadataUri: tokenInfo.metadata_uri,
        imageUri: tokenInfo.image_uri,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        walletUsed: walletResult.walletPublicKey,
        rawResponse: result
      }
    });

  } catch (error) {
    console.error('Token creation error:', error);
    
    // Log error activity if we have a wallet ID
    if (walletId) {
      try {
        await supabase.from('wallet_activities').insert([{
          wallet_id: walletId,
          activity_type: 'error',
          activity_description: `Error during token creation: ${error.message}`,
          created_at: new Date().toISOString()
        }]);
      } catch (logError) {
        console.error('Failed to log error activity:', logError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'An error occurred while creating the wallet and token' 
      },
      { status: 500 }
    );
  }
}