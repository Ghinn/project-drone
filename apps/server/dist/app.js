"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const admin_route_js_1 = __importDefault(require("./routes/admin.route.js"));
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const data_route_js_1 = __importDefault(require("./routes/data.route.js"));
const http_js_1 = require("./lib/http.js");
exports.app = (0, express_1.default)();
exports.app.disable("x-powered-by");
if (env_js_1.env.NODE_ENV === "production") {
    exports.app.set("trust proxy", 1);
}
// const allowedOrigins = env.CLIENT_ORIGIN.split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);
exports.app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://192.168.100.12:3000',
//   process.env.CLIENT_URL
// ].filter(Boolean) as string[];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   }),
// );
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)(env_js_1.env.NODE_ENV === "production" ? "combined" : "dev"));
exports.app.use(express_1.default.json({ limit: "2mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
// Route Admin
exports.app.use("/api/admin", admin_route_js_1.default);
// Route /api/admin
exports.app.use("/api", auth_route_js_1.default);
// Route Operator
exports.app.use("/api/drone/telemetryState", data_route_js_1.default);
exports.app.use(http_js_1.notFoundHandler);
exports.app.use(http_js_1.errorHandler);
