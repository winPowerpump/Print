// app/api/tokens/rate-limit/route.js
// Optional endpoint to check rate limit status without creating a token

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting constants
const RATE_LIMIT_MINUTES = 7;
const RATE_LIMIT_MS = RATE_LIMIT_MINUTES * 60 * 1000;

// Helper function to get client IP address
function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  
  return 'unknown';
}

// Rate limiting check function
async function checkRateLimit(clientIP) {
  const now = new Date();
  const rateLimitCutoff = new Date(now.getTime() - RATE_LIMIT_MS);

  try {
    // Check for recent token creations from this IP
    const { data: recentTokens, error } = await supabase
      .from('tokens')
      .select('created_at')
      .eq('creator_ip', clientIP)
      .gte('created_at', rateLimitCutoff.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Rate limit check error:', error);
      return { 
        allowed: true, 
        error: 'Rate limit check failed',
        canCreate: true,
        remainingTime: 0
      };
    }

    // Get total tokens created by this IP in the last 24 hours for context
    const { data: allTokens, error: countError } = await supabase
      .from('tokens')
      .select('created_at')
      .eq('creator_ip', clientIP)
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

    const totalTokensLast24h = allTokens ? allTokens.length : 0;

    if (recentTokens && recentTokens.length > 0) {
      const lastCreation = new Date(recentTokens[0].created_at);
      const timeSinceLastCreation = now - lastCreation;
      const remainingTime = RATE_LIMIT_MS - timeSinceLastCreation;

      return {
        allowed: false,
        canCreate: false,
        remainingTime: Math.ceil(remainingTime / 1000 / 60), // Convert to minutes
        remainingSeconds: Math.ceil(remainingTime / 1000),
        lastCreation: lastCreation.toISOString(),
        totalTokensLast24h,
        rateLimitMinutes: RATE_LIMIT_MINUTES
      };
    }

    return { 
      allowed: true, 
      canCreate: true, 
      remainingTime: 0,
      totalTokensLast24h,
      rateLimitMinutes: RATE_LIMIT_MINUTES
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { 
      allowed: true, 
      error: 'Rate limit check failed',
      canCreate: true,
      remainingTime: 0
    };
  }
}

export async function GET(request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(clientIP);

    return NextResponse.json({
      success: true,
      clientIP,
      rateLimit: rateLimitResult
    });

  } catch (error) {
    console.error('Rate limit check API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check rate limit status'
      },
      { status: 500 }
    );
  }
}

// Optional POST endpoint for more detailed rate limit info
export async function POST(request) {
  try {
    const { ip } = await request.json();
    const clientIP = ip || getClientIP(request);
    
    // Use the database function if you created it
    const { data, error } = await supabase
      .rpc('get_rate_limit_status', { ip_address: clientIP });

    if (error) {
      console.error('Database function error:', error);
      // Fallback to the manual check
      const rateLimitResult = await checkRateLimit(clientIP);
      return NextResponse.json({
        success: true,
        clientIP,
        rateLimit: rateLimitResult,
        source: 'fallback'
      });
    }

    const result = data[0] || {};

    return NextResponse.json({
      success: true,
      clientIP,
      rateLimit: {
        allowed: !result.is_rate_limited,
        canCreate: !result.is_rate_limited,
        remainingTime: result.remaining_minutes || 0,
        lastCreation: result.last_creation,
        totalTokensLast24h: result.total_tokens_created || 0,
        rateLimitMinutes: RATE_LIMIT_MINUTES
      },
      source: 'database_function'
    });

  } catch (error) {
    console.error('Rate limit check POST API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check rate limit status'
      },
      { status: 500 }
    );
  }
}