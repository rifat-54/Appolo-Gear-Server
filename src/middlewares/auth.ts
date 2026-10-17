import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { prisma } from '../lib/prisma';
import catchAsync from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt.jwt_access_secret
      ) as JwtPayload;
    } catch {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token!');
    }

    const userId = decoded.id || decoded.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You have no permission to access this route!'
      );
    }

    req.user = decoded;
    next();
  });
};

export default auth;
