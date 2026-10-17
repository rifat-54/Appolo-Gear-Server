import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { carFilterableFields, paginationFields } from './car.constant';
import { CarService } from './car.service';

const createCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.createCar(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Car created successfully!',
    data: result,
  });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, carFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await CarService.getAllCars(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cars retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getCarById = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getCarById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car retrieved successfully!',
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.updateCar(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car updated successfully!',
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.deleteCar(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car deleted successfully!',
    data: result,
  });
});

export const CarController = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
};
