import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { readUserToken } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const userId = readUserToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Сначала войди в аккаунт' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const position = Number(body.position);

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      position > 30
    ) {
      return NextResponse.json(
        { error: 'Некорректная ячейка' },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const { data, error } = await sb.rpc('claim_cell', {
      p_user: userId,
      p_position: position
    });

    if (error) {
      console.error('CLAIM ERROR:', error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.success) {
      return NextResponse.json(
        {
          error:
            result?.message ||
            'Не удалось выбрать ячейку'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      number: result.hidden_number
    });

  } catch (error) {
    console.error('CLAIM SERVER ERROR:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Server error'
      },
      { status: 500 }
    );
  }
}