import { Request, Response } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { generateSecret, verifySync, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { readDB, writeDB, logAudit } from '../database/db.js';
import { generateToken, AuthRequest } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { pin } = req.body;
  const ip = req.ip || '127.0.0.1';

  try {
    await loginRateLimiter.consume(ip);
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many attempts. Locked out for 15 minutes.' });
    return;
  }

  if (!pin || pin.length !== 6) {
    res.status(400).json({ error: 'Invalid PIN length' });
    return;
  }

  const db = await readDB();
  let user = db.users[0];

  if (!user) {
    // First time setup
    const salt = crypto.randomBytes(32).toString('hex');
    const pin_hash = await argon2.hash(pin);
    
    user = {
      id: crypto.randomUUID(),
      pin_hash,
      salt
    };
    db.users.push(user);
    await writeDB(db);
    await logAudit('USER_SETUP', `Initial user setup completed`);
    
    // Clear rate limit points on success
    await loginRateLimiter.delete(ip);
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id }, message: 'Setup complete' });
    return;
  }

  // Verify PIN
  const isValid = await argon2.verify(user.pin_hash, pin);
  if (!isValid) {
    await logAudit('LOGIN_FAILED', `Failed login attempt from ${ip}`);
    res.status(401).json({ error: 'Invalid PIN' });
    return;
  }

  // 2FA Check
  if (user.totp_enabled) {
    const { totpCode } = req.body;
    if (!totpCode) {
      res.status(403).json({ error: '2FA required', requires2FA: true });
      return;
    }
    
    const isValid2FA = verifySync({ token: totpCode, secret: user.totp_secret! });
    if (!isValid2FA.valid) {
      await logAudit('LOGIN_FAILED', `Failed 2FA attempt from ${ip}`);
      res.status(401).json({ error: 'Invalid 2FA code' });
      return;
    }
  }

  await logAudit('LOGIN_SUCCESS', `User logged in`);
  await loginRateLimiter.delete(ip);
  
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, totp_enabled: user.totp_enabled } });
}

export async function generateTOTP(req: AuthRequest, res: Response): Promise<void> {
  const db = await readDB();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const secret = generateSecret();
  user.totp_secret = secret;
  await writeDB(db);

  const otpauth = generateURI({
    issuer: 'Safe Vault',
    label: user.id.substring(0, 8),
    secret: secret,
    strategy: 'totp'
  });
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  res.json({ qrCodeUrl, secret });
}

export async function verifyAndEnableTOTP(req: AuthRequest, res: Response): Promise<void> {
  const { totpCode } = req.body;
  const db = await readDB();
  const user = db.users.find(u => u.id === req.user?.id);
  
  if (!user || !user.totp_secret) {
    res.status(400).json({ error: 'TOTP setup not initiated' });
    return;
  }

  const isValid = verifySync({ token: totpCode, secret: user.totp_secret });
  if (!isValid.valid) {
    res.status(401).json({ error: 'Invalid TOTP code' });
    return;
  }

  user.totp_enabled = true;
  await writeDB(db);
  await logAudit('2FA_ENABLED', `User enabled 2FA`);

  res.json({ message: '2FA enabled successfully', user: { id: user.id, totp_enabled: true } });
}

export async function disableTOTP(req: AuthRequest, res: Response): Promise<void> {
  const { pin } = req.body;
  const db = await readDB();
  const user = db.users.find(u => u.id === req.user?.id);

  if (!user || !user.totp_enabled) {
    res.status(400).json({ error: '2FA is not enabled' });
    return;
  }
  
  const isValid = await argon2.verify(user.pin_hash, pin);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid PIN' });
    return;
  }

  user.totp_enabled = false;
  user.totp_secret = undefined;
  await writeDB(db);
  await logAudit('2FA_DISABLED', `User disabled 2FA`);

  res.json({ message: '2FA disabled successfully', user: { id: user.id, totp_enabled: false } });
}

export async function changePin(req: Request, res: Response): Promise<void> {
  const { oldPin, newPin } = req.body;
  const db = await readDB();
  const user = db.users[0];

  if (!user) {
    res.status(400).json({ error: 'No user found' });
    return;
  }

  const isValid = await argon2.verify(user.pin_hash, oldPin);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid old PIN' });
    return;
  }

  user.pin_hash = await argon2.hash(newPin);
  await writeDB(db);
  await logAudit('PIN_CHANGED', `User changed PIN`);

  res.json({ message: 'PIN updated successfully' });
}
