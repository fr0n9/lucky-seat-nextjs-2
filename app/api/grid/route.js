import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { readUserToken } from '../../../lib/auth';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(request){
  try{const sb=supabaseAdmin(); const userId=readUserToken(request);
    const {data:cells,error}=await sb.from('cells').select('position,claimed_by').order('position'); if(error)throw error;
    let me=null;
    if(userId){const {data:user}=await sb.from('users').select('id,username').eq('id',userId).maybeSingle(); if(user){const mine=cells.find(c=>c.claimed_by===userId); let number=null; if(mine){const {data:d}=await sb.from('cells').select('hidden_number').eq('position',mine.position).single(); number=d?.hidden_number??null;} me={username:user.username,claimedPosition:mine?.position||null,number};}}
    return NextResponse.json({cells:cells.map(c=>({position:c.position,claimed:!!c.claimed_by})),me},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Ошибка загрузки'},{status:500})}
}
