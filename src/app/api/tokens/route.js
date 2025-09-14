import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/tokens - Fetch all tokens with pagination and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const feeAccount = searchParams.get('fee_account'); // Filter by X username
    
    const offset = (page - 1) * limit;

    // Define blocked fee accounts (both with and without @ symbol)
    const blockedAccounts = [
      'Sol_memories', '@Sol_memories',
      'fakelove26790', '@fakelove26790'
    ];

    // Build query
    let query = supabase
      .from('tokens')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Exclude blocked fee accounts
    // Use NOT IN with case-insensitive matching
    blockedAccounts.forEach(blocked => {
      query = query.not('fee_account', 'ilike', blocked);
    });

    // Add fee_account filter for logged-in user (case-insensitive)
    if (feeAccount) {
      query = query.ilike('fee_account', feeAccount);
    }

    // Add other filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,symbol.ilike.%${search}%,mint_address.ilike.%${search}%`);
    }

    // Apply pagination after all filters
    query = query.range(offset, offset + limit - 1);

    const { data: tokens, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      tokens,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}