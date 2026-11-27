import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initMqtt } from './services/mqtt.service.js';
import { initWebRTCSignaling } from './services/webrtc-signaling.service.js';

const port = Number(process.env.PORT ?? 4000);

const rehearsal = process.env.DREAMPALM_REHEARSAL === "1";

if (rehearsal) {
  const db = new URL(process.env.DATABASE_URL ?? "");

  if (
    db.pathname !== "/dreampalm_prod_rehearsal" ||
    db.hostname !== "127.0.0.1" ||
    port !== 4001
  ) {
    throw new Error("Unsafe rehearsal configuration");
  }

  console.log("[REHEARSAL] MQTT and WebRTC disabled");
} else {
  initMqtt();
}

const httpServer = http.createServer(app);
if (!rehearsal) initWebRTCSignaling(httpServer);

const onListening = () => {
  console.log(`DreamPalm Backend running on port ${port}`);
};

const server = rehearsal
  ? httpServer.listen(port, "127.0.0.1", onListening)
  : httpServer.listen(port, onListening);

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