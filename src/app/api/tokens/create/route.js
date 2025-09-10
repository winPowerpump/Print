import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
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

    const apiKey = process.env.PUMPPORTAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PumpPortal API key not configured' },
        { status: 500 }
      );
    }

    console.log('Starting token creation process...');
    
    // Generate a proper Solana keypair for the token mint
    const mintKeypair = Keypair.generate();
    console.log('Generated mint keypair:', mintKeypair.publicKey.toString());
    
    // Step 1: Upload metadata to IPFS
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

    console.log('Metadata response status:', metadataResponse.status);
    
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Metadata upload failed:', errorText);
      throw new Error(`Failed to upload metadata to IPFS: ${metadataResponse.status} - ${errorText}`);
    }

    const metadataResult = await metadataResponse.json();
    console.log('Metadata result:', metadataResult);
    console.log('Metadata result keys:', Object.keys(metadataResult));
    console.log('Image field from metadata:', metadataResult.image);

    if (!metadataResult.metadataUri) {
      throw new Error('No metadata URI returned from IPFS upload');
    }

    // Step 2: Create the token using the correct payload format
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

    // Handle error responses that come back as 200 OK
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMessages = result.errors.join(', ');
      console.error('API returned errors:', result.errors);
      throw new Error(`API Validation Error: ${errorMessages}`);
    }

    // Validate result
    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
      throw new Error('Invalid response from token creation API');
    }

    // Prepare token info for database
    let imageUri = metadataResult.image || null;
    
    // If image not directly in response, try to fetch from metadataUri
    if (!imageUri && metadataResult.metadataUri) {
      try {
        console.log('Fetching metadata from URI to get image:', metadataResult.metadataUri);
        const metadataFetch = await fetch(metadataResult.metadataUri);
        if (metadataFetch.ok) {
          const metadataFromUri = await metadataFetch.json();
          console.log('Metadata from URI:', metadataFromUri);
          imageUri = metadataFromUri.image || null;
        }
      } catch (error) {
        console.warn('Failed to fetch metadata from URI:', error.message);
      }
    }
    
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
      creator_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    console.log('Token info being saved:', tokenInfo);
    console.log('Image URI being saved:', tokenInfo.image_uri);

    // Save to Supabase
    console.log('Saving token to Supabase:', tokenInfo);
    
    const { data: savedToken, error: supabaseError } = await supabase
      .from('tokens')
      .insert([tokenInfo])
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // Don't fail the whole process if DB save fails, but log it
      console.warn('Token created successfully but failed to save to database');
    } else {
      console.log('Token saved to Supabase:', savedToken);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      token: {
        signature: tokenInfo.transaction_signature,
        mint: tokenInfo.mint_address,
        metadataUri: tokenInfo.metadata_uri,
        imageUri: tokenInfo.image_uri, // Include image URI in response
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        rawResponse: result,
        databaseId: savedToken?.id || null
      }
    });

  } catch (error) {
    console.error('Token creation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'An error occurred while creating the token' 
      },
      { status: 500 }
    );
  }
}