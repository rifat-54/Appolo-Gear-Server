import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import {
  TLoginUser,
  TLoginUserResponse,
  TRefreshTokenResponse,
  TRegisterUser,
} from './auth.interface';
import { createToken, verifyToken } from './auth.utils';

const registerUser = async (payload: TRegisterUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exists with this email!'
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_round
  );

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || 'user',
      img: payload.img,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      img: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

const loginUser = async (payload: TLoginUser): Promise<TLoginUserResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password not set for this user. Please try social login.'
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password does not match!');
  }

  const jwtPayload = {
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret,
    config.jwt.jwt_access_expires_in
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret,
    config.jwt.jwt_refresh_expires_in
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      img: user.img,
      rating: user.rating,
    },
  };
};

const refreshToken = async (token?: string): Promise<TRefreshTokenResponse> => {
  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Refresh token is required!'
    );
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyToken(token, config.jwt.jwt_refresh_secret);
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid or expired refresh token!'
    );
  }

  const userId = decoded.id || decoded.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  const jwtPayload = {
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret,
    config.jwt.jwt_access_expires_in
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};