import { NextResponse } from 'next/server'; import { clearUserCookie } from '../../../../lib/auth';
export async function POST(){const r=NextResponse.json({ok:true});r.headers.set('Set-Cookie',clearUserCookie());return r}
