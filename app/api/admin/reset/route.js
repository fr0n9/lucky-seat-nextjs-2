import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const sb = supabaseAdmin();

    const { data, error } = await sb.rpc('reset_round');

    if (error) {
      console.error('RESET ROUND SUPABASE ERROR:', error);

      return NextResponse.json(
        {
          error: 'Supabase reset error',
          details: error.message,
          code: error.code,
          hint: error.hint,
          details2: error.details
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error('RESET ROUND SERVER ERROR:', error);

    return NextResponse.json(
      {
        error: 'Server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}