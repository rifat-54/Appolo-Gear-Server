import { CarCondition, FuelType } from '../../../generated/prisma/client';

export type TCar = {
  name: string;
  brand: string;
  model: string;
  image: string;
  rating?: number;
  fuelType: FuelType;
  passengerCapacity: number;
  color: string;
  condition: CarCondition;
};

export type TCarFilterRequest = {
  searchTerm?: string;
  brand?: string;
  model?: string;
  fuelType?: FuelType;
  color?: string;
  condition?: CarCondition;
};

export type TPaginationOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
