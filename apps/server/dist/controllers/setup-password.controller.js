"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAccountPassword = void 0;
const prisma_1 = require("../lib/prisma");
const firebase_1 = require("../lib/firebase");
const setupAccountPassword = async (req, res) => {
    try {
        const token = req.body.token || req.query.token;
        const newPassword = req.body.newPassword;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token dan kata sandi wajib diisi.' });
        }
        // Validasi token di Prisma
        const verificationToken = await prisma_1.prisma.verificationToken.findFirst({
            where: { token: String(token) },
            include: { user: true }
        });
        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Tautan sudah digunakan atau tidak valid atau telah kedaluwarsa.' });
        }
        const user = verificationToken.user;
        if (!user.firebaseUid) {
            return res.status(400).json({ error: 'Akun tidak valid. UID Firebase tidak ditemukan.' });
        }
        // Update Kata Sandi dan Aktifkan Akun di Firebase Auth
        try {
            await firebase_1.firebaseAuth.updateUser(user.firebaseUid, {
                password: newPassword,
                disabled: false,
            });
        }
        catch (firebaseError) {
            if (firebaseError.code === 'auth/weak-password') {
                return res.status(400).json({ error: 'Kata sandi terlalu lemah menurut kebijakan server.' });
            }
            throw firebaseError;
        }
        // Update Status Menjadi ACTIVE (APPROVED) di Prisma
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                status: 'APPROVED',
                emailVerified: true
            }
        });
        // Hapus token agar menjadi tautan One-Time Link
        await prisma_1.prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });
        return res.status(200).json({ message: 'Akun berhasil diaktifkan. Anda sekarang dapat masuk.' });
    }
    catch (error) {
        console.error('Setup Password Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengaktifkan akun.' });
    }
};
exports.setupAccountPassword = setupAccountPassword;
