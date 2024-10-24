import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';

export class PremiumController {
  async purchasePremium(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { months, price } = req.body;

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + months);

      const subscription = await db.premiumSubscription.create({
        data: {
          userId,
          price,
          expirationDate,
        },
      });

      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'Failed to purchase premium' });
    }
  }

  async getPremiumStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      const subscription = await db.premiumSubscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return res.json({ hasPremium: false });
      }

      const isActive = new Date() < new Date(subscription.expirationDate);

      res.json({
        hasPremium: isActive,
        subscription: isActive ? subscription : null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch premium status' });
    }
  }

  async getPremiumHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1 } = req.query;
      const pageSize = 100;
      const skip = (Number(page) - 1) * pageSize;

      const subscriptions = await db.premiumSubscription.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { purchaseDate: 'desc' },
      });

      const total = await db.premiumSubscription.count({ where: { userId } });

      res.json({
        subscriptions,
        pagination: {
          page: Number(page),
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch premium history' });
    }
  }
}

export const premiumController = new PremiumController();