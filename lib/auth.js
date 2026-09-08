import crypto from 'crypto';

const COOKIE = 'lucky_seat_session';
const ADMIN_COOKIE = 'lucky_seat_admin';

function secret() {
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is missing');
  return process.env.SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createUserToken(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, t: Date.now() })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readUserToken(request) {
  const token = getCookie(request, COOKIE);
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.userId || null;
  } catch { return null; }
}

export function userCookie(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`;
}
export function clearUserCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function createAdminToken() {
  const value = `admin:${Date.now()}`;
  return `${Buffer.from(value).toString('base64url')}.${sign(value)}`;
}
export function isAdmin(request) {
  const token = getCookie(request, ADMIN_COOKIE);
  if (!token) return false;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return false;
  try {
    const value = Buffer.from(encoded, 'base64url').toString('utf8');
    const expected = sign(value);
    const a = Buffer.from(sig), b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b) && value.startsWith('admin:');
  } catch { return false; }
}
export function adminCookie(token) {
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=86400`;
}
export function clearAdminCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const piece of header.split(';')) {
    const [k, ...rest] = piece.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, 'hex');
  return test.length === real.length && crypto.timingSafeEqual(test, real);
}
