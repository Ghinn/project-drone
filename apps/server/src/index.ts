import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`Drone Tech API running on http://localhost:${port}`);
});

const shutdown = async (signal: string) => {
  console.info(`${signal} received. Closing Drone Tech API service...`);

  server.close(() => {
    console.log("Server successfully shut down.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force shutdown...");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));