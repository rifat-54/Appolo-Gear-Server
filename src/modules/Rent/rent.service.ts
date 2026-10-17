import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { TPaginationOptions } from '../Car/car.interface';
import { rentSearchableFields } from './rent.constant';
import {
  TCreateRent,
  TRentFilterRequest,
  TUpdateRent,
} from './rent.interface';

const createRent = async (userId: string, payload: TCreateRent) => {
  const isCarExists = await prisma.car.findUnique({
    where: {
      id: payload.carId,
    },
  });

  if (!isCarExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Car not found!');
  }

  const result = await prisma.rent.create({
    data: {
      userId,
      carId: payload.carId,
      startingPoint: payload.startingPoint,
      destination: payload.destination,
      rentStatus: payload.rentStatus || 'pending',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      car: true,
    },
  });

  return result;
};

const getAllRents = async (
  authUser: { id: string; role: string },
  filters: TRentFilterRequest,
  paginationOptions: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  // Non-admin regular users only see their own rent requests
  if (authUser.role === 'user') {
    andConditions.push({
      userId: authUser.id,
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: rentSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as Record<string, unknown>)[key],
        },
      })),
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const page = Number(paginationOptions.page) || 1;
  const limit = Number(paginationOptions.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = paginationOptions.sortBy || 'createdAt';
  const sortOrder = paginationOptions.sortOrder || 'desc';

  const [result, total] = await Promise.all([
    prisma.rent.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            img: true,
            rating: true,
          },
        },
        car: true,
        bids: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                img: true,
                rating: true,
              },
            },
          },
        },
      },
    }),
    prisma.rent.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getRentById = async (
  id: string,
  authUser: { id: string; role: string }
) => {
  const result = await prisma.rent.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      car: true,
      bids: {
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              img: true,
              rating: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  if (authUser.role === 'user' && result.userId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You have no permission to view this rent request!'
    );
  }

  return result;
};

const updateRent = async (
  id: string,
  authUser: { id: string; role: string },
  payload: TUpdateRent
) => {
  const isRentExists = await prisma.rent.findUnique({
    where: {
      id,
    },
  });

  if (!isRentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  if (authUser.role === 'user' && isRentExists.userId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to update this rent request!'
    );
  }

  const result = await prisma.rent.update({
    where: {
      id,
    },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      car: true,
    },
  });

  return result;
};

const deleteRent = async (
  id: string,
  authUser: { id: string; role: string }
) => {
  const isRentExists = await prisma.rent.findUnique({
    where: {
      id,
    },
  });

  if (!isRentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  if (authUser.role === 'user' && isRentExists.userId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to delete this rent request!'
    );
  }

  const result = await prisma.rent.delete({
    where: {
      id,
    },
  });

  return result;
};

export const RentService = {
  createRent,
  getAllRents,
  getRentById,
  updateRent,
  deleteRent,
};
