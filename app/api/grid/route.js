import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { readUserToken } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const sb = supabaseAdmin();
    const user = readUserToken(request);

    const { data: cells, error } = await sb
      .from('cells')
      .select('position, claimed_by, hidden_number')
      .order('position', { ascending: true });

    if (error) {
      console.error('GRID ERROR:', error);

      return NextResponse.json(
        { error: error.message || 'Ошибка загрузки ячеек' },
        { status: 500 }
      );
    }

    let myPosition = null;
    let myNumber = null;

    if (user?.id) {
      const myCell = cells?.find(cell => cell.claimed_by === user.id);

      if (myCell) {
        myPosition = myCell.position;
        myNumber = myCell.hidden_number;
      }
    }

    const publicCells = (cells || []).map(cell => ({
      position: cell.position,
      claimed: Boolean(cell.claimed_by),
      mine: user?.id ? cell.claimed_by === user.id : false,
      hidden_number:
        user?.id && cell.claimed_by === user.id
          ? cell.hidden_number
          : null
    }));

    return NextResponse.json({
      cells: publicCells,
      loggedIn: Boolean(user?.id),
      myPosition,
      myNumber
    });

  } catch (error) {
    console.error('GRID SERVER ERROR:', error);

    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}