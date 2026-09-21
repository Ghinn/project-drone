"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const mqtt_service_1 = require("./services/mqtt.service");
async function bootstrap() {
    await prisma_1.prisma.$connect();
    (0, mqtt_service_1.initMqtt)();
    const server = app_1.app.listen(env_1.env.PORT, () => {
        console.info(`DreamPalm backend running on http://localhost:${env_1.env.PORT}`);
    });
    const shutdown = async (signal) => {
        console.info(`${signal} received. Closing DreamPalm backend...`);
        server.close(async () => {
            await prisma_1.prisma.$disconnect();
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
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
