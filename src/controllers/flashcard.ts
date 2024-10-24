import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';
import { uploadFile } from '../utils/upload';

export class FlashcardController {
  async createFlashcard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { frontSide, backSide } = req.body;
      const frontImage = req.files?.['frontImage']?.[0];
      const backImage = req.files?.['backImage']?.[0];

      let frontImageUrl, backImageUrl;

      if (frontImage) {
        frontImageUrl = await uploadFile(frontImage, 'flashcards');
      }
      if (backImage) {
        backImageUrl = await uploadFile(backImage, 'flashcards');
      }

      const flashcard = await db.flashcard.create({
        data: {
          userId,
          frontSide: {
            ...frontSide,
            image: frontImageUrl,
          },
          backSide: {
            ...backSide,
            image: backImageUrl,
          },
        },
      });

      res.status(201).json(flashcard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create flashcard' });
    }
  }

  async getUserFlashcards(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1 } = req.query;
      const pageSize = 100;
      const skip = (Number(page) - 1) * pageSize;

      const flashcards = await db.flashcard.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      const total = await db.flashcard.count({ where: { userId } });

      res.json({
        flashcards,
        pagination: {
          page: Number(page),
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
  }

  async updateFlashcard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { frontSide, backSide } = req.body;
      const frontImage = req.files?.['frontImage']?.[0];
      const backImage = req.files?.['backImage']?.[0];

      const flashcard = await db.flashcard.findFirst({
        where: { id, userId },
      });

      if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      let frontImageUrl = frontSide.image;
      let backImageUrl = backSide.image;

      if (frontImage) {
        frontImageUrl = await uploadFile(frontImage, 'flashcards');
      }
      if (backImage) {
        backImageUrl = await uploadFile(backImage, 'flashcards');
      }

      const updatedFlashcard = await db.flashcard.update({
        where: { id },
        data: {
          frontSide: {
            ...frontSide,
            image: frontImageUrl,
          },
          backSide: {
            ...backSide,
            image: backImageUrl,
          },
        },
      });

      res.json(updatedFlashcard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update flashcard' });
    }
  }

  async deleteFlashcard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const flashcard = await db.flashcard.findFirst({
        where: { id, userId },
      });

      if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      await db.flashcard.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete flashcard' });
    }
  }
}

export const flashcardController = new FlashcardController();