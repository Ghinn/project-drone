import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`DreamPalm Backend running on http://localhost:${port}`);
});

const shutdown = async (signal: string) => {
  console.info(`${signal} received. Closing DreamPalm Backend service...`);

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