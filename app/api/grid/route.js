import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { readUserToken } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const sb = supabaseAdmin();
    const userId = readUserToken(request);

    const { data: cells, error: cellsError } = await sb
      .from('cells')
      .select('position, claimed_by, hidden_number')
      .order('position', { ascending: true });

    if (cellsError) {
      console.error('GRID CELLS ERROR:', cellsError);

      return NextResponse.json(
        { error: cellsError.message },
        { status: 500 }
      );
    }

    const publicCells = (cells || []).map(cell => ({
      position: cell.position,
      claimed: Boolean(cell.claimed_by)
    }));

    let me = null;

    if (userId) {
      const { data: user, error: userError } = await sb
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('GRID USER ERROR:', userError);
      }

      if (user) {
        const myCell = (cells || []).find(
          cell => cell.claimed_by === userId
        );

        me = {
          id: user.id,
          username: user.username,
          claimedPosition: myCell?.position || null,
          number: myCell?.hidden_number || null
        };
      }
    }

    return NextResponse.json({
      cells: publicCells,
      me
    });

  } catch (error) {
    console.error('GRID SERVER ERROR:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Server error'
      },
      { status: 500 }
    );
  }
}