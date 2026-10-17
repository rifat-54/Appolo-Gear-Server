import { UserRole } from '../../../generated/prisma/client';

export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  img?: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};

export type TLoginUserResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    img: string | null;
    rating: number;
  };
};

export type TRefreshTokenResponse = {
  accessToken: string;
};