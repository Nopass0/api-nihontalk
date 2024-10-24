import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';
import { uploadFile } from '../utils/upload';

export class CourseController {
  async enrollCourse(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { courseId } = req.body;

      const course = await db.courseItem.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const enrollment = await db.userCourse.create({
        data: {
          userId,
          courseId,
          status: 'in_progress',
        },
      });

      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to enroll in course' });
    }
  }

  async updateProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { courseId, completedModules, completedUnits } = req.body;

      const enrollment = await db.userCourse.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      const course = await db.courseItem.findUnique({
        where: { id: courseId },
      });

      const updatedEnrollment = await db.userCourse.update({
        where: { id: enrollment.id },
        data: {
          completedModules,
          completedUnits,
          status: completedModules === course?.modules.length ? 'completed' : 'in_progress',
        },
      });

      if (updatedEnrollment.status === 'completed') {
        await db.user.update({
          where: { id: userId },
          data: {
            expPoints: { increment: course?.expReward || 0 },
          },
        });
      }

      res.json(updatedEnrollment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update progress' });
    }
  }

  async searchCourses(req: Request, res: Response) {
    try {
      const { q, page = 1 } = req.query;
      const query = String(q || '');
      const pageSize = 100;
      const skip = (Number(page) - 1) * pageSize;

      const where = query.startsWith('$')
        ? { name: { contains: query.substring(1) } }
        : query.startsWith('#')
        ? { tags: { some: { name: { contains: query.substring(1) } } } }
        : {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { tags: { some: { name: { contains: query } } } },
            ],
          };

      const courses = await db.courseItem.findMany({
        where,
        include: {
          tags: true,
          modules: {
            include: {
              tags: true,
            },
          },
        },
        skip,
        take: pageSize,
      });

      const total = await db.courseItem.count({ where });

      res.json({
        courses,
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

  async getUserCourses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { status } = req.query;

      const where = {
        userId,
        ...(status ? { status: String(status) } : {}),
      };

      const courses = await db.userCourse.findMany({
        where,
        include: {
          course: {
            include: {
              tags: true,
              modules: {
                include: {
                  tags: true,
                  units: true,
                },
              },
            },
          },
        },
      });

      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user courses' });
    }
  }
}

export const courseController = new CourseController();