import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifyPassword, createUserToken, userCookie } from '../../../../lib/auth';

export const runtime='nodejs';
export async function POST(request){
  try{
    const {username,password}=await request.json(); const sb=supabaseAdmin();
    const {data}=await sb.from('users').select('id,username,password_hash').eq('username',String(username||'').trim()).maybeSingle();
    if(!data || !verifyPassword(String(password||''),data.password_hash)) return NextResponse.json({error:'Неверный логин или пароль'},{status:401});
    const res=NextResponse.json({ok:true}); res.headers.set('Set-Cookie',userCookie(createUserToken(data.id))); return res;
  }catch{return NextResponse.json({error:'Ошибка входа'},{status:500})}
}
