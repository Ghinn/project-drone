import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import operatorRoutes from './routes/operator.route.js';
import dataRoutes from "./routes/data.route.js"; 
import { errorHandler, notFoundHandler } from "./lib/http.js";

export const app = express();

app.disable("x-powered-by");

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// const allowedOrigins = env.CLIENT_ORIGIN.split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

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

app.use(helmet());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route Operator
app.use("/api/operator", operatorRoutes);

// Route Admin
app.use("/api/admin", adminRoutes); 

// Route /api/admin
app.use("/api", authRoutes); 

// Route Operator
app.use("/api/drone/telemetryState", dataRoutes);

app.use(notFoundHandler);
app.use(errorHandler);