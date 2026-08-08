import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token verifikasi tidak ditemukan.' });
        }

        // 1. Cari token di database[cite: 6]
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token: String(token) }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Token tidak valid atau sudah kedaluwarsa' });
        }

        // 2. Update user: emailVerified jadi true, status jadi APPROVED[cite: 6]
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { 
                emailVerified: true,
                status: 'APPROVED'
            }
        });

        // 3. Hapus token agar tidak bisa dipakai lagi[cite: 6]
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });

        // 4. Redirect ke halaman Frontend
        // (Misalnya: mengarahkan user langsung ke halaman login dengan parameter success)
        const redirectUrl = `${process.env.CLIENT_URL}/?verified=true`;
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Verification Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};