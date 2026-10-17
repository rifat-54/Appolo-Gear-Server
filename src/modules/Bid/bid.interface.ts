import { BidStatus } from '../../../generated/prisma/client';

export type TCreateBid = {
  rentId: string;
  bidAmount: number;
  driverLocation: string;
};

export type TUpdateBid = {
  bidStatus?: BidStatus;
  bidAmount?: number;
  driverLocation?: string;
};

export type TBidFilterRequest = {
  searchTerm?: string;
  bidStatus?: BidStatus;
  rentId?: string;
  driverId?: string;
};
