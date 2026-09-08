import { NextResponse } from 'next/server'; import { supabaseAdmin } from '../../../../lib/supabase'; import { isAdmin } from '../../../../lib/auth';
export const runtime='nodejs';
export async function POST(request){if(!isAdmin(request))return NextResponse.json({error:'Unauthorized'},{status:401});try{const sb=supabaseAdmin();const {error}=await sb.rpc('reset_round');if(error)throw error;return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Не удалось сбросить раунд'},{status:500})}}
