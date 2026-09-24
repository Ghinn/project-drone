import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initMqtt } from './services/mqtt.service.js';
import { initWebRTCSignaling } from './services/webrtc-signaling.service.js';

const port = Number(process.env.PORT ?? 4000);

initMqtt();

const httpServer = http.createServer(app);
initWebRTCSignaling(httpServer);

const server = httpServer.listen(port, () => {
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

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));