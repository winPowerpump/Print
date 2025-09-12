// /api/test-wallet/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing PumpPortal wallet creation endpoint...');
    
    const createWalletResponse = await fetch('https://pumpportal.fun/api/create-wallet', {
      method: 'GET',
    });

    console.log('Response status:', createWalletResponse.status);
    console.log('Response headers:', Object.fromEntries(createWalletResponse.headers.entries()));

    if (!createWalletResponse.ok) {
      const errorText = await createWalletResponse.text();
      console.error('Wallet creation failed:', errorText);
      return NextResponse.json({
        success: false,
        error: `API returned ${createWalletResponse.status}`,
        details: errorText
      });
    }

    const walletResult = await createWalletResponse.json();
    
    // Log everything for debugging
    console.log('Raw wallet response:', walletResult);
    console.log('Response type:', typeof walletResult);
    console.log('Response keys:', Object.keys(walletResult));
    console.log('Response values (censored):', Object.keys(walletResult).reduce((acc, key) => {
      const value = walletResult[key];
      if (typeof value === 'string' && value.length > 10) {
        acc[key] = `${value.substring(0, 8)}...[${value.length} chars total]`;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {}));

    // Check for nested wallet object
    if (walletResult.wallet) {
      console.log('Nested wallet object found:', Object.keys(walletResult.wallet));
    }

    return NextResponse.json({
      success: true,
      debug: {
        responseType: typeof walletResult,
        keys: Object.keys(walletResult),
        hasNestedWallet: !!walletResult.wallet,
        nestedWalletKeys: walletResult.wallet ? Object.keys(walletResult.wallet) : null,
        // Censored values for security
        censoredResponse: Object.keys(walletResult).reduce((acc, key) => {
          const value = walletResult[key];
          if (typeof value === 'string' && value.length > 10) {
            acc[key] = `${value.substring(0, 8)}...[REDACTED]`;
          } else if (typeof value === 'object' && value !== null) {
            acc[key] = `[Object with keys: ${Object.keys(value).join(', ')}]`;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Test wallet creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}