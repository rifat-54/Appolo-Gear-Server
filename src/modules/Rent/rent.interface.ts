import { RentStatus } from '../../../generated/prisma/client';

export type TCreateRent = {
  carId: string;
  startingPoint: string;
  destination: string;
  rentStatus?: RentStatus;
};

export type TUpdateRent = {
  startingPoint?: string;
  destination?: string;
  rentStatus?: RentStatus;
};

export type TRentFilterRequest = {
  searchTerm?: string;
  rentStatus?: RentStatus;
  carId?: string;
  userId?: string;
};
