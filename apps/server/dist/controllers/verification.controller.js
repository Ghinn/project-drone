"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = void 0;
const prisma_1 = require("../lib/prisma");
const firebase_1 = require("../lib/firebase");
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Token verifikasi tidak valid atau hilang.' });
        }
        // Cari token di database
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token }
        });
        // Validasi Ketersediaan dan Kedaluwarsa Token
        if (!verificationToken) {
            return res.status(400).json({
                error: 'Tautan sudah digunakan atau tidak valid. Email Anda mungkin sudah terverifikasi, silakan coba masuk ke akun Anda.'
            });
        }
        if (verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Tautan verifikasi telah kedaluwarsa. Silakan daftar kembali.' });
        }
        // Update status pengguna di Prisma
        const user = await prisma_1.prisma.user.update({
            where: { id: verificationToken.userId },
            data: {
                emailVerified: true,
                status: 'APPROVED'
            }
        });
        // Update status emailVerified di Firebase Auth
        await firebase_1.firebaseAuth.updateUser(user.firebaseUid, {
            emailVerified: true
        });
        // Hapus token agar menjadi tautan One-Time Link
        await prisma_1.prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });
        return res.status(200).json({
            message: 'Verifikasi email berhasil. Sesi Anda siap.',
            email: user.email
        });
    }
    catch (error) {
        console.error('Error saat verifikasi email:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memverifikasi email.' });
    }
};
exports.verifyEmail = verifyEmail;
