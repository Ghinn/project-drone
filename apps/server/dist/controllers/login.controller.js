"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionLogin = void 0;
const prisma_1 = require("../lib/prisma");
const firebase_1 = require("../lib/firebase");
const env_1 = require("../config/env");
const cookies_1 = require("../lib/cookies");
const sessionLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: 'Token Firebase tidak disertakan.' });
        }
        // Verifikasi Token menggunakan Firebase Admin SDK
        const decodedToken = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        if (!email) {
            return res.status(400).json({ error: 'Email tidak ditemukan dari kredensial Firebase.' });
        }
        // Sinkronisasi Data Pengguna di Database Prisma
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Pengguna Baru (Misal via Google Sign-In atau registrasi baru)
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    firebaseUid: uid,
                    name: name || 'Pengguna Baru',
                    avatarUrl: picture || null,
                    role: 'FARMER',
                    status: 'APPROVED',
                    emailVerified: true
                }
            });
        }
        else {
            // Pengguna Sudah Ada (Admin/Operator buatan manual atau user lama)
            user = await prisma_1.prisma.user.update({
                where: { email },
                data: {
                    firebaseUid: uid,
                    lastLoginAt: new Date(),
                }
            });
        }
        // Set Custom User Claims agar Role sinkron dengan token Firebase
        await firebase_1.firebaseAuth.setCustomUserClaims(uid, { role: user.role });
        const cookieName = env_1.env.SESSION_COOKIE_NAME || '__session';
        const cookieOptions = (0, cookies_1.getSessionCookieOptions)();
        console.log('=========================================');
        console.log('[Express Login] Session Cookie Berhasil Diterbitkan:');
        console.log(' -> Nama Cookie :', cookieName);
        console.log(' -> Opsi Cookie :', cookieOptions);
        console.log('=========================================');
        return res.status(200).json({
            message: 'Sinkronisasi database berhasil.',
            data: user
        });
    }
    catch (error) {
        console.error('Error saat session login:', error);
        return res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa.' });
    }
};
exports.sessionLogin = sessionLogin;
