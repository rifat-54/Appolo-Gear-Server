import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { TPaginationOptions } from '../Car/car.interface';
import { bidSearchableFields } from './bid.constant';
import {
  TBidFilterRequest,
  TCreateBid,
  TUpdateBid,
} from './bid.interface';

const createBid = async (driverId: string, payload: TCreateBid) => {
  const driver = await prisma.user.findUnique({
    where: {
      id: driverId,
    },
  });

  if (!driver || driver.role !== 'driver') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only users with role Driver can place bids!'
    );
  }

  const rent = await prisma.rent.findUnique({
    where: {
      id: payload.rentId,
    },
  });

  if (!rent) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rent request not found!');
  }

  if (rent.rentStatus !== 'pending') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Bids can only be placed on pending rent requests!'
    );
  }

  const existingBid = await prisma.bid.findFirst({
    where: {
      rentId: payload.rentId,
      driverId,
    },
  });

  if (existingBid) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already placed a bid on this rent request!'
    );
  }

  const result = await prisma.bid.create({
    data: {
      rentId: payload.rentId,
      driverId,
      bidAmount: payload.bidAmount,
      driverLocation: payload.driverLocation,
      bidStatus: 'pending',
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      rent: {
        include: {
          car: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getAllBids = async (
  authUser: { id: string; role: string },
  filters: TBidFilterRequest,
  paginationOptions: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  // If regular user, only see bids on their own rent requests
  if (authUser.role === 'user') {
    andConditions.push({
      rent: {
        userId: authUser.id,
      },
    });
  }

  // If driver and no specific rentId is queried, see their own bids
  if (authUser.role === 'driver' && !filterData.rentId) {
    andConditions.push({
      driverId: authUser.id,
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: bidSearchableFields.map((field) => ({
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
    prisma.bid.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            img: true,
            rating: true,
          },
        },
        rent: {
          include: {
            car: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.bid.count({
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

const getBidById = async (
  id: string,
  authUser: { id: string; role: string }
) => {
  const result = await prisma.bid.findUnique({
    where: {
      id,
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      rent: {
        include: {
          car: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bid not found!');
  }

  if (authUser.role === 'user' && result.rent.userId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You have no permission to view this bid!'
    );
  }

  if (authUser.role === 'driver' && result.driverId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You have no permission to view this bid!'
    );
  }

  return result;
};

const updateBid = async (
  id: string,
  authUser: { id: string; role: string },
  payload: TUpdateBid
) => {
  const bid = await prisma.bid.findUnique({
    where: {
      id,
    },
    include: {
      rent: true,
    },
  });

  if (!bid) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bid not found!');
  }

  // Permission logic for status updates (accept/reject)
  if (payload.bidStatus) {
    if (authUser.role === 'driver') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Drivers cannot accept or reject bids!'
      );
    }

    if (authUser.role === 'user' && bid.rent.userId !== authUser.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You are not allowed to accept or reject bids for this rent!'
      );
    }
  }

  // Permission logic for driver modifying bid details
  if (payload.bidAmount !== undefined || payload.driverLocation !== undefined) {
    if (authUser.role === 'driver' && bid.driverId !== authUser.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only modify your own bids!'
      );
    }

    if (bid.bidStatus !== 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot modify a bid that is already accepted or rejected!'
      );
    }
  }

  // Business logic when bid is ACCEPTED:
  // 1. Check if rent is still pending
  // 2. Accept this bid
  // 3. Reject all other bids for this rent
  // 4. Change rent status to 'ongoing'
  if (payload.bidStatus === 'accepted') {
    if (bid.rent.rentStatus !== 'pending') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot accept bid. This rent is already ongoing or completed!'
      );
    }

    const [updatedBid] = await prisma.$transaction([
      prisma.bid.update({
        where: { id },
        data: { bidStatus: 'accepted' },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              img: true,
              rating: true,
            },
          },
          rent: true,
        },
      }),
      prisma.bid.updateMany({
        where: {
          rentId: bid.rentId,
          id: { not: id },
        },
        data: {
          bidStatus: 'rejected',
        },
      }),
      prisma.rent.update({
        where: { id: bid.rentId },
        data: { rentStatus: 'ongoing' },
      }),
    ]);

    return updatedBid;
  }

  // Regular update (e.g. rejection or driver modifying location/amount)
  const result = await prisma.bid.update({
    where: {
      id,
    },
    data: payload,
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          img: true,
          rating: true,
        },
      },
      rent: true,
    },
  });

  return result;
};

const deleteBid = async (
  id: string,
  authUser: { id: string; role: string }
) => {
  const bid = await prisma.bid.findUnique({
    where: {
      id,
    },
  });

  if (!bid) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bid not found!');
  }

  if (authUser.role === 'driver' && bid.driverId !== authUser.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to delete this bid!'
    );
  }

  if (authUser.role === 'user') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only the bidding driver or admin can delete bids!'
    );
  }

  if (bid.bidStatus === 'accepted') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete an accepted bid!'
    );
  }

  const result = await prisma.bid.delete({
    where: {
      id,
    },
  });

  return result;
};

export const BidService = {
  createBid,
  getAllBids,
  getBidById,
  updateBid,
  deleteBid,
};
