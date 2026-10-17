import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { BidRoutes } from '../modules/Bid/bid.route';
import { CarRoutes } from '../modules/Car/car.route';
import { RentRoutes } from '../modules/Rent/rent.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/cars',
    route: CarRoutes,
  },
  {
    path: '/rents',
    route: RentRoutes,
  },
  {
    path: '/bids',
    route: BidRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
