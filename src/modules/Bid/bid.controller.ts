import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { paginationFields } from '../Car/car.constant';
import { bidFilterableFields } from './bid.constant';
import { BidService } from './bid.service';

const createBid = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.id || req.user.userId;
  const result = await BidService.createBid(driverId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bid placed successfully!',
    data: result,
  });
});

const getAllBids = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const filters = pick(req.query, bidFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await BidService.getAllBids(
    authUser,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bids retrieved successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const getBidById = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await BidService.getBidById(
    req.params.id as string,
    authUser
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid retrieved successfully!',
    data: result,
  });
});

const updateBid = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await BidService.updateBid(
    req.params.id as string,
    authUser,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid updated successfully!',
    data: result,
  });
});

const deleteBid = catchAsync(async (req: Request, res: Response) => {
  const authUser = {
    id: req.user.id || req.user.userId,
    role: req.user.role,
  };
  const result = await BidService.deleteBid(
    req.params.id as string,
    authUser
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid deleted successfully!',
    data: result,
  });
});

export const BidController = {
  createBid,
  getAllBids,
  getBidById,
  updateBid,
  deleteBid,
};
