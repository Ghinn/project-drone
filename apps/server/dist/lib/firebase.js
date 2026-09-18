"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = exports.firebaseApp = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const env_1 = require("../config/env");
function getFirebaseApp() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApps)()[0];
    }
    const hasInlineCredentials = env_1.env.FIREBASE_PROJECT_ID &&
        env_1.env.FIREBASE_CLIENT_EMAIL &&
        env_1.env.FIREBASE_PRIVATE_KEY;
    if (hasInlineCredentials) {
        return (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: env_1.env.FIREBASE_PROJECT_ID,
                clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
                privateKey: env_1.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
            projectId: env_1.env.FIREBASE_PROJECT_ID,
        });
    }
    return (0, app_1.initializeApp)({
        credential: (0, app_1.applicationDefault)(),
        ...(env_1.env.FIREBASE_PROJECT_ID ? { projectId: env_1.env.FIREBASE_PROJECT_ID } : {}),
    });
}
exports.firebaseApp = getFirebaseApp();
exports.firebaseAuth = (0, auth_1.getAuth)(exports.firebaseApp);
