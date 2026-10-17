import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { paginationFields } from '../Car/car.constant';
import { rentFilterableFields } from './rent.constant';
import { RentService } from './rent.service';

const createRent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id || req.user.userId;
  const result = await RentService.createRent(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rent request created successfully!',
    data: result,
  });
});

const getAllRents = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const filters = pick(req.query, rentFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await RentService.getAllRents(
    authUser,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rents retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getRentById = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await RentService.getRentById(
    req.params.id as string,
    authUser
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent request retrieved successfully!',
    data: result,
  });
});

const updateRent = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await RentService.updateRent(
    req.params.id as string,
    authUser,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent request updated successfully!',
    data: result,
  });
});

const deleteRent = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await RentService.deleteRent(
    req.params.id as string,
    authUser
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent request deleted successfully!',
    data: result,
  });
});

export const RentController = {
  createRent,
  getAllRents,
  getRentById,
  updateRent,
  deleteRent,
};
