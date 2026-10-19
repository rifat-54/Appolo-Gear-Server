import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import router from './routes';
import { PaymentController } from './modules/Payment/payment.controller';

const app: Application = express();

// Stripe webhook MUST receive the raw body — register before express.json()
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

// parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});

// global error handler
app.use(globalErrorHandler);

// not found handler
app.use(notFound);

export default app;
