import { Request, Response } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { readDB, writeDB, logAudit } from '../database/db.js';
import { generateToken } from '../middleware/authMiddleware.js';
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

  await logAudit('LOGIN_SUCCESS', `User logged in`);
  await loginRateLimiter.delete(ip);
  
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id } });
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
