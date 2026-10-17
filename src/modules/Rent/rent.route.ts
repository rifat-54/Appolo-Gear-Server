import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../Auth/auth.constant';
import { RentController } from './rent.controller';
import { RentValidation } from './rent.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(RentValidation.createRentValidationSchema),
  RentController.createRent
);

router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.driver),
  RentController.getAllRents
);

router.get(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.driver),
  RentController.getRentById
);

router.patch(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(RentValidation.updateRentValidationSchema),
  RentController.updateRent
);

router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  RentController.deleteRent
);

export const RentRoutes = router;
