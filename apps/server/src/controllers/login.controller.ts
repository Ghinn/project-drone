import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { firebaseAuth } from '../lib/firebase';
import { env } from '../config/env';
import { getSessionCookieOptions } from '../lib/cookies';

export const sessionLogin = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body; 

        if (!idToken) {
            return res.status(400).json({ error: 'Token Firebase tidak disertakan.' });
        }

        // Verifikasi Token menggunakan Firebase Admin SDK
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({ error: 'Email tidak ditemukan dari kredensial Firebase.' });
        }

        // Sinkronisasi Data Pengguna di Database Prisma
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Pengguna Baru (Misal via Google Sign-In atau registrasi baru)
            user = await prisma.user.create({
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
        } else {
            // Pengguna Sudah Ada (Admin/Operator buatan manual atau user lama)
            user = await prisma.user.update({
                where: { email },
                data: {
                    firebaseUid: uid,
                    lastLoginAt: new Date(),
                }
            });
        }

        // Set Custom User Claims agar Role sinkron dengan token Firebase
        await firebaseAuth.setCustomUserClaims(uid, { role: user.role });

        const cookieName = env.SESSION_COOKIE_NAME || '__session';
        const cookieOptions = getSessionCookieOptions();

        console.log('=========================================');
        console.log('[Express Login] Session Cookie Berhasil Diterbitkan:');
        console.log(' -> Nama Cookie :', cookieName);
        console.log(' -> Opsi Cookie :', cookieOptions);
        console.log('=========================================');
        
        return res.status(200).json({
            message: 'Sinkronisasi database berhasil.',
            data: user
        });

    } catch (error) {
        console.error('Error saat session login:', error);
        return res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa.' });
    }
};