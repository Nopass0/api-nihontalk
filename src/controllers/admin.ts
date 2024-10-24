import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';
import { uploadFile } from '../utils/upload';

export class AdminController {
  async createCourse(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, description, level, expReward, tags, modules } = req.body;

      const course = await db.courseItem.create({
        data: {
          name,
          description,
          level,
          expReward,
          tags: {
            create: tags.map((tag: string) => ({
              name: tag,
              color: '#' + Math.floor(Math.random()*16777215).toString(16),
            })),
          },
          modules: {
            create: modules.map((module: any) => ({
              name: module.name,
              description: module.description,
              tags: {
                create: module.tags.map((tag: string) => ({
                  name: tag,
                  color: '#' + Math.floor(Math.random()*16777215).toString(16),
                })),
              },
              units: {
                create: module.units.map((unit: any) => ({
                  name: unit.name,
                  type: unit.type,
                  data: unit.data,
                })),
              },
            })),
          },
        },
        include: {
          tags: true,
          modules: {
            include: {
              tags: true,
              units: true,
            },
          },
        },
      });

      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }

  async updateCourse(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { name, description, level, expReward } = req.body;

      const course = await db.courseItem.update({
        where: { id },
        data: {
          name,
          description,
          level,
          expReward,
        },
        include: {
          tags: true,
          modules: {
            include: {
              tags: true,
              units: true,
            },
          },
        },
      });

      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update course' });
    }
  }

  async deleteCourse(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;

      await db.courseItem.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }
}

export const adminController = new AdminController();