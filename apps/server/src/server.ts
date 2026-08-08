import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function bootstrap() {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.info(`FreshScan backend running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.info(`${signal} received. Closing FreshScan backend...`);
    
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
  console.error("Failed to start FreshScan backend.", error);
  await prisma.$disconnect();
  process.exit(1);
});