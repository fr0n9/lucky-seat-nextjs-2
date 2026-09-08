import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { hashPassword, createUserToken, userCookie } from '../../../../lib/auth';

export const runtime = 'nodejs';
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const u = String(username || '').trim();
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(u)) return NextResponse.json({error:'Логин: 3–30 символов, только буквы, цифры, . _ -'},{status:400});
    if (String(password||'').length < 4) return NextResponse.json({error:'Пароль должен быть минимум 4 символа'},{status:400});
    const sb = supabaseAdmin();
    const { data, error } = await sb.from('users').insert({ username:u, password_hash:hashPassword(password) }).select('id,username').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({error:'Такой логин уже существует'},{status:409});
      throw error;
    }
    const res = NextResponse.json({ok:true, username:data.username});
    res.headers.set('Set-Cookie', userCookie(createUserToken(data.id)));
    return res;
  } catch (e) { return NextResponse.json({error:'Ошибка регистрации'},{status:500}); }
}
