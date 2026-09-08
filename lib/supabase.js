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
      console.error('RESET ERROR:', error);

      return NextResponse.json(
        {
          error: `${error.code || 'NO_CODE'}: ${error.message || 'Unknown error'} | ${error.details || ''} | ${error.hint || ''}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error('RESET EXCEPTION:', error);

    return NextResponse.json(
      {
        error: `SERVER: ${error?.message || String(error)}`
      },
      { status: 500 }
    );
  }
}