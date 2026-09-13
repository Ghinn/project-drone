import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { initMqtt } from "./services/mqtt.service";

async function bootstrap() {
  await prisma.$connect();

  initMqtt();

  const server = app.listen(env.PORT, () => {
    console.info(`DreamPalm backend running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.info(`${signal} received. Closing DreamPalm backend...`);
    
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);  
    });

    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

bootstrap().catch(async (error) => {
  console.error("Failed to start DreamPalm backend.", error);
  await prisma.$disconnect();
  process.exit(1);
});