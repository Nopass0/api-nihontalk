import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('login').isLength({ min: 3 }).trim(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('birthdate').isISO8601(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone('any'),
  validateResults,
];

export const validateLogin = [
  body('login').notEmpty(),
  body('password').notEmpty(),
  validateResults,
];

export const validatePasswordChange = [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validateResults,
];

export const validateCourseEnrollment = [
  body('courseId').notEmpty(),
  validateResults,
];

export const validateProgressUpdate = [
  body('courseId').notEmpty(),
  body('completedModules').isInt({ min: 0 }),
  body('completedUnits').isInt({ min: 0 }),
  validateResults,
];

export const validateCourse = [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('level').isInt({ min: 0, max: 5 }),
  body('expReward').isInt({ min: 0 }),
  body('tags').isArray(),
  body('modules').isArray(),
  validateResults,
];

export const validateFlashcard = [
  body('frontSide').isObject(),
  body('backSide').isObject(),
  validateResults,
];

export const validateTestSubmission = [
  body('unitId').notEmpty(),
  body('answers').exists(),
  validateResults,
];

export const validatePremiumPurchase = [
  body('months').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  validateResults,
];

function validateResults(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}