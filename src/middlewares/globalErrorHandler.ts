import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';

export type TErrorSource = {
  path: string | number;
  message: string;
};

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
};

// Handle Zod Validation Error
const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = err.issues.map((issue) => {
    return {
      path: String(issue.path[issue.path.length - 1] ?? ''),
      message: issue.message,
    };
  });

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error',
    errorSources,
  };
};

// Handle Prisma Client Validation Error
const handlePrismaValidationError = (
  err: PrismaClientValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = [
    {
      path: '',
      message: err.message,
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Prisma Validation Error',
    errorSources,
  };
};

// Handle Prisma Client Known Request Error (e.g. Unique constraint, Not Found)
const handlePrismaClientKnownRequestError = (
  err: PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode: number = httpStatus.BAD_REQUEST;
  let message = 'Prisma Client Request Error';
  let errorSources: TErrorSource[] = [
    {
      path: '',
      message: err.message,
    },
  ];

  // P2002: Unique constraint failed
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const field = Array.isArray(target)
      ? target.join(', ')
      : (target as string) || 'Field';

    statusCode = httpStatus.CONFLICT;
    message = 'Duplicate key error';
    errorSources = [
      {
        path: field,
        message: `${field} already exists!`,
      },
    ];
  }
  // P2025: An operation failed because required records were not found
  else if (err.code === 'P2025') {
    statusCode = httpStatus.NOT_FOUND;
    message = (err.meta?.cause as string) || 'Record not found!';
    errorSources = [
      {
        path: '',
        message,
      },
    ];
  }
  // P2003: Foreign key constraint failed
  else if (err.code === 'P2003') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Foreign key constraint violation';
    errorSources = [
      {
        path: (err.meta?.field_name as string) || '',
        message: 'Foreign key constraint violation',
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

// Global Error Handler Middleware
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorSources: TErrorSource[] = [
    {
      path: '',
      message: 'Something went wrong!',
    },
  ];

  // 1. Check if error is from Zod
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  // 2. Check if error is Prisma Validation Error
  else if (
    err instanceof PrismaClientValidationError ||
    err?.name === 'PrismaClientValidationError'
  ) {
    const simplifiedError = handlePrismaValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  // 3. Check if error is Prisma Known Request Error
  else if (
    err instanceof PrismaClientKnownRequestError ||
    err?.name === 'PrismaClientKnownRequestError'
  ) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  // 4. Check if error is Prisma Initialization / Connection Error
  else if (
    err instanceof PrismaClientInitializationError ||
    err?.name === 'PrismaClientInitializationError'
  ) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Prisma Client Initialization Error / Database Connection Error';
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }
  // 5. Check if custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }
  // 6. Generic JS Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    error: config.env === 'development' ? err : undefined,
    stack: config.env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
