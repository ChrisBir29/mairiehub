import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function makeToken(role) {
  const secret = process.env.SECRET_KEY || 'default-secret';
  const payload = JSON.stringify({ role, ts: Date.now() });
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

export function verifyToken(token) {
  try {
    const secret = process.env.SECRET_KEY || 'default-secret';
    const [payloadB64, hmac] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (hmac !== expected) return null;
    const data = JSON.parse(payload);
    // Token valid for 30 days
    if (Date.now() - data.ts > 30 * 24 * 60 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}

export async function POST(request) {
  const { pin } = await request.json();
  const mairePin = process.env.MAIRE_PIN || '2906';
  const adjointPin = process.env.ADJOINT_PIN || '9012';

  let role = null;
  if (pin === mairePin) role = 'maire';
  else if (pin === adjointPin) role = 'adjoint';

  if (!role) {
    return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 401 });
  }

  const token = makeToken(role);
  const response = NextResponse.json({ role, success: true });
  response.cookies.set('mh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('mh_token');
  return response;
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('mh_token')?.value;
  if (!token) return NextResponse.json({ role: null });
  const data = verifyToken(token);
  if (!data) return NextResponse.json({ role: null });
  return NextResponse.json({ role: data.role });
}
