import { Request, Response } from 'express';
import { db } from '../db';
import { Bun } from 'bun';
import { generateToken } from '../utils/auth';
import { uploadFile } from '../utils/upload';
import { AuthenticatedRequest } from '../types';

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const { login, password, name, birthdate, email, phone } = req.body;
      const avatar = req.file;

      const hashedPassword = await Bun.password.hash(password);
      let avatarUrl = null;

      if (avatar) {
        avatarUrl = await uploadFile(avatar, 'avatars');
      }

      const user = await db.user.create({
        data: {
          login,
          password: hashedPassword,
          name,
          birthdate: new Date(birthdate),
          email,
          phone,
          avatar: avatarUrl,
        },
      });

      const token = await generateToken(user.id);

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;
      const { geo } = req.body; // Optional geolocation data

      const user = await db.user.findFirst({ where: { login } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await Bun.password.verify(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = await generateToken(user.id, geo);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          courses: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { name, email, phone } = req.body;
      const avatar = req.file;

      let updateData: any = { name, email, phone };

      if (avatar) {
        const avatarUrl = await uploadFile(avatar, 'avatars');
        updateData.avatar = avatarUrl;
      }

      const user = await db.user.update({
        where: { id: userId },
        data: updateData,
      });

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;

      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValid = await Bun.password.verify(oldPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid current password' });
      }

      const hashedPassword = await Bun.password.hash(newPassword);
      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { q, page = 1 } = req.query;
      const query = String(q || '');
      const pageSize = 100;
      const skip = (Number(page) - 1) * pageSize;

      const where = query.startsWith('@')
        ? { login: { contains: query.substring(1) } }
        : {
            OR: [
              { name: { contains: query } },
              { login: { contains: query } },
            ],
          };

      const users = await db.user.findMany({
        where,
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
          level: true,
          expPoints: true,
        },
        skip,
        take: pageSize,
      });

      const total = await db.user.count({ where });

      res.json({
        users,
        pagination: {
          page: Number(page),
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  }
}

export const userController = new UserController();