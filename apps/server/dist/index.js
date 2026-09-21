"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = require("./app.js");
const mqtt_service_js_1 = require("./services/mqtt.service.js");
const port = Number(process.env.PORT ?? 4000);
(0, mqtt_service_js_1.initMqtt)();
const server = app_js_1.app.listen(port, () => {
    console.log(`DreamPalm Backend running on http://localhost:${port}`);
});
const shutdown = async (signal) => {
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
