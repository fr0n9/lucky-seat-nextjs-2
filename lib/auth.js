import crypto from 'crypto';

const USER_COOKIE = 'lucky_seat_session';
const ADMIN_COOKIE = 'lucky_seat_admin';

function getSecret() {
  const value = process.env.SESSION_SECRET;

  if (!value) {
    throw new Error('SESSION_SECRET is missing');
  }

  return value;
}

function sign(value) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(value)
    .digest('base64url');
}

export function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';

  for (const piece of header.split(';')) {
    const [key, ...rest] = piece.trim().split('=');

    if (key === name) {
      return rest.join('=');
    }
  }

  return null;
}

// --------------------
// USER SESSION
// --------------------

export function createUserToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      createdAt: Date.now()
    })
  ).toString('base64url');

  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function readUserToken(request) {
  const token = getCookie(request, USER_COOKIE);

  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return data.userId || null;
  } catch {
    return null;
  }
}

export function userCookie(token) {
  return [
    `${USER_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=2592000'
  ].join('; ');
}

export function clearUserCookie() {
  return [
    `${USER_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=0'
  ].join('; ');
}

// --------------------
// ADMIN SESSION
// --------------------

export function createAdminToken() {
  const value = `admin:${Date.now()}`;

  const encoded = Buffer
    .from(value)
    .toString('base64url');

  const signature = sign(value);

  return `${encoded}.${signature}`;
}

export function isAdmin(request) {
  const token = getCookie(request, ADMIN_COOKIE);

  if (!token) {
    return false;
  }

  const [encoded, signature] = token.split('.');

  if (!encoded || !signature) {
    return false;
  }

  try {
    const value = Buffer
      .from(encoded, 'base64url')
      .toString('utf8');

    if (!value.startsWith('admin:')) {
      return false;
    }

    const expectedSignature = sign(value);

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );
  } catch {
    return false;
  }
}

export function adminCookie(token) {
  return [
    `${ADMIN_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=86400'
  ].join('; ');
}

export function clearAdminCookie() {
  return [
    `${ADMIN_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=0'
  ].join('; ');
}

// --------------------
// PASSWORDS
// --------------------

export function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString('hex')
) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');

  if (!salt || !hash) {
    return false;
  }

  try {
    const calculatedHash = crypto.scryptSync(
      password,
      salt,
      64
    );

    const storedHash = Buffer.from(hash, 'hex');

    if (calculatedHash.length !== storedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      calculatedHash,
      storedHash
    );
  } catch {
    return false;
  }
}