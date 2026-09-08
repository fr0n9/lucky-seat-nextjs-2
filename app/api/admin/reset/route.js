import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { isAdmin } from '../../../../lib/auth';

export const runtime = 'nodejs';

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const sb = supabaseAdmin();

    // Удаляем старый раунд
    const { error: deleteError } = await sb
      .from('cells')
      .delete()
      .gte('position', 1);

    if (deleteError) {
      console.error('RESET DELETE ERROR:', deleteError);

      return NextResponse.json(
        { error: `Ошибка очистки: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Перемешиваем числа 1–30
    const numbers = shuffle(
      Array.from({ length: 30 }, (_, i) => i + 1)
    );

    const cells = numbers.map((number, index) => ({
      position: index + 1,
      hidden_number: number,
      claimed_by: null,
      claimed_at: null
    }));

    // Создаём новый раунд
    const { error: insertError } = await sb
      .from('cells')
      .insert(cells);

    if (insertError) {
      console.error('RESET INSERT ERROR:', insertError);

      return NextResponse.json(
        { error: `Ошибка создания раунда: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('RESET SERVER ERROR:', error);

    return NextResponse.json(
      {
        error: `Server error: ${error?.message || String(error)}`
      },
      { status: 500 }
    );
  }
}