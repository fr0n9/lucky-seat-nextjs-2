import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { readUserToken } from '../../../lib/auth';
export const runtime='nodejs';
export async function POST(request){
  try{const userId=readUserToken(request); if(!userId)return NextResponse.json({error:'Сначала войдите в аккаунт'},{status:401});
    const {position}=await request.json(); const p=Number(position); if(!Number.isInteger(p)||p<1||p>30)return NextResponse.json({error:'Некорректная ячейка'},{status:400});
    const sb=supabaseAdmin(); const {data,error}=await sb.rpc('claim_cell',{p_user:userId,p_position:p}); if(error)throw error;
    const row=Array.isArray(data)?data[0]:data; if(!row?.success)return NextResponse.json({error:row?.message||'Ячейка уже занята'},{status:409});
    return NextResponse.json({ok:true,number:row.hidden_number});
  }catch(e){return NextResponse.json({error:'Не удалось сделать выбор'},{status:500})}
}
