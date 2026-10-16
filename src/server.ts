import { Server } from 'http';
import app from './app';
import config from './config';

let server: Server;

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.log('😈 uncaughtException is detected, shutting down...', err);
  process.exit(1);
});

async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

// Handle unhandled promise rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  console.log('😈 unhandledRejection is detected, shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signal (e.g. from container or hosting provider)
process.on('SIGTERM', () => {
  console.log('SIGTERM is received, shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated!');
    });
  }
});

// Handle interrupt signal (e.g. Ctrl + C)
process.on('SIGINT', () => {
  console.log('SIGINT is received, shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated!');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

