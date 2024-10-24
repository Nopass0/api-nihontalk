import jwt from 'jsonwebtoken';
import { db } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = async (userId: string, geo?: any) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  
  await db.token.create({
    data: {
      token,
      userId,
      geo: geo || null,
    },
  });

  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};