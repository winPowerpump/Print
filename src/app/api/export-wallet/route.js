import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path as needed

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication' },
        { status: 401 }
      );
    }

    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Get user's X username from session
    const userXUsername = session.user.xUsername;

    if (!userXUsername) {
      return NextResponse.json(
        { error: 'No X username found in session' },
        { status: 400 }
      );
    }

    console.log(`Wallet export request from @${userXUsername} for token ${tokenId}`);

    // Step 1: Verify the token belongs to this user (fee_account matches their X username)
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .ilike('fee_account', `@${userXUsername}`)
      .single();

    if (tokenError || !token) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Token not found or not owned by this user' },
        { status: 404 }
      );
    }

    // Step 2: Get the secure wallet details for this token
    const { data: secureWallet, error: walletError } = await supabase
      .from('secure_wallets')
      .select('*')
      .eq('id', token.wallet_id)
      .eq('is_active', true)
      .single();

    if (walletError || !secureWallet) {
      console.error('Secure wallet fetch failed:', walletError);
      return NextResponse.json(
        { error: 'Wallet details not found or inactive' },
        { status: 404 }
      );
    }

    // Step 3: Log the wallet access activity (optional - for audit trail)
    await supabase.from('wallet_activities').insert([{
      wallet_id: secureWallet.id,
      activity_type: 'accessed',
      activity_description: `Wallet credentials accessed by @${userXUsername} for token ${token.name} (${token.symbol})`,
      created_at: new Date().toISOString()
    }]);

    // Step 4: Return the wallet details (only to authorized user)
    return NextResponse.json({
      success: true,
      token: {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        mint_address: token.mint_address,
        created_at: token.created_at
      },
      wallet: {
        id: secureWallet.id,
        publicKey: secureWallet.public_key,
        privateKey: secureWallet.private_key, // SENSITIVE - only returned to verified user
        apiKey: secureWallet.api_key, // SENSITIVE - only returned to verified user
        initialBalance: secureWallet.initial_balance_sol,
        createdAt: secureWallet.created_at,
        fundingTransaction: secureWallet.funding_transaction
      },
      accessedAt: new Date().toISOString(),
      accessedBy: userXUsername
    });

  } catch (error) {
    console.error('Wallet export error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while exporting wallet details' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a token's wallet can be exported
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    const userXUsername = session.user.xUsername;

    // Check if token exists and belongs to user
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('id, name, symbol, status, wallet_id')
      .eq('id', tokenId)
      .ilike('fee_account', `@${userXUsername}`)
      .single();

    if (tokenError || !token) {
      return NextResponse.json(
        { error: 'Token not found or not owned by this user' },
        { status: 404 }
      );
    }

    // Check if wallet exists and is active
    const { data: wallet, error: walletError } = await supabase
      .from('secure_wallets')
      .select('id, public_key, is_active')
      .eq('id', token.wallet_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { 
          canExport: false,
          reason: 'Wallet not found or inactive'
        }
      );
    }

    return NextResponse.json({
      canExport: wallet.is_active,
      token: {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        status: token.status
      },
      wallet: {
        publicKey: wallet.public_key,
        isActive: wallet.is_active
      }
    });

  } catch (error) {
    console.error('Check export eligibility error:', error);
    return NextResponse.json(
      { 
        canExport: false,
        error: 'An error occurred while checking export eligibility' 
      },
      { status: 500 }
    );
  }
}