import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';
import { validateTestResult } from '../utils/testValidation';

export class TestController {
  async submitTest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { unitId, answers } = req.body;

      const unit = await db.unitItem.findUnique({
        where: { id: unitId },
      });

      if (!unit || unit.type !== 'Test') {
        return res.status(404).json({ error: 'Test unit not found' });
      }

      const { score, correctAnswers } = await validateTestResult(unit.data, answers);

      const testResult = await db.testResult.create({
        data: {
          userId,
          unitId,
          answers,
          score,
        },
      });

      // Update user experience points
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) {
        const newExpPoints = user.expPoints + score;
        const shouldLevelUp = newExpPoints >= user.goalExp;

        await db.user.update({
          where: { id: userId },
          data: {
            expPoints: newExpPoints,
            level: shouldLevelUp ? user.level + 1 : user.level,
            goalExp: shouldLevelUp ? user.goalExp * 1.5 : user.goalExp,
          },
        });
      }

      res.status(201).json({
        testResult,
        correctAnswers,
        expGained: score,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit test' });
    }
  }

  async getTestHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1 } = req.query;
      const pageSize = 100;
      const skip = (Number(page) - 1) * pageSize;

      const testResults = await db.testResult.findMany({
        where: { userId },
        include: {
          unit: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      const total = await db.testResult.count({ where: { userId } });

      res.json({
        testResults,
        pagination: {
          page: Number(page),
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch test history' });
    }
  }

  async getTestDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const testResult = await db.testResult.findFirst({
        where: { id, userId },
        include: {
          unit: true,
        },
      });

      if (!testResult) {
        return res.status(404).json({ error: 'Test result not found' });
      }

      const { correctAnswers } = await validateTestResult(
        testResult.unit.data,
        testResult.answers
      );

      res.json({
        testResult,
        correctAnswers,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch test details' });
    }
  }
}

export const testController = new TestController();