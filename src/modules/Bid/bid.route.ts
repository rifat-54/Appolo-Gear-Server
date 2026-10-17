import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../Auth/auth.constant';
import { BidController } from './bid.controller';
import { BidValidation } from './bid.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.driver),
  validateRequest(BidValidation.createBidValidationSchema),
  BidController.createBid
);

router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.driver, USER_ROLE.admin),
  BidController.getAllBids
);

router.get(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.driver, USER_ROLE.admin),
  BidController.getBidById
);

router.patch(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.driver),
  validateRequest(BidValidation.updateBidValidationSchema),
  BidController.updateBid
);

router.delete(
  '/:id',
  auth(USER_ROLE.driver, USER_ROLE.admin),
  BidController.deleteBid
);

export const BidRoutes = router;
