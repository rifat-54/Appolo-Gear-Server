import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { carSearchableFields } from './car.constant';
import {
  TCar,
  TCarFilterRequest,
  TPaginationOptions,
} from './car.interface';

const createCar = async (payload: TCar) => {
  const result = await prisma.car.create({
    data: payload,
  });
  return result;
};

const getAllCars = async (
  filters: TCarFilterRequest,
  paginationOptions: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: carSearchableFields.map((field) => ({
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
    prisma.car.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.car.count({
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

const getCarById = async (id: string) => {
  const result = await prisma.car.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Car not found!');
  }

  return result;
};

const updateCar = async (id: string, payload: Partial<TCar>) => {
  const isCarExists = await prisma.car.findUnique({
    where: {
      id,
    },
  });

  if (!isCarExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Car not found!');
  }

  const result = await prisma.car.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteCar = async (id: string) => {
  const isCarExists = await prisma.car.findUnique({
    where: {
      id,
    },
  });

  if (!isCarExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Car not found!');
  }

  const result = await prisma.car.delete({
    where: {
      id,
    },
  });

  return result;
};

export const CarService = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
};
