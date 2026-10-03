import env from './config/env.js';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

async function start() {
  try {
    await connectDB(env.mongoUri);
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`));

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
}

start();
