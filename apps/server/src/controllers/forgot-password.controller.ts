import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import admin from '../lib/firebase/admin';
import { sendResetPasswordEmail } from '../lib/mailer';

// Generate 6 digit angka acak
const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendResetCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Alamat email wajib diisi.' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(200).json({ message: 'Jika email terdaftar, kode telah dikirim.' });
        }

        // Hapus token reset sebelumnya jika ada
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id }
        });

        // Generate 6 digit code dan simpan ke database (berlaku 15 menit)
        const code = generateSixDigitCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000); 

        await prisma.verificationToken.create({
            data: {
                token: code,
                expires,
                userId: user.id
            }
        });

        // Panggil utilitas Nodemailer
        await sendResetPasswordEmail(email, code);
        return res.status(200).json({ message: 'Kode konfirmasi telah dikirim.' });

    } catch (error) {
        console.error('Send Reset Code Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengirim kode.' });
    }
};

export const verifyAndResetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Data tidak lengkap. Harap isi semua kolom.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Permintaan tidak valid.' });

        // Validasi Token/Kode
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { 
                userId: user.id,
                token: code 
            }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Kode konfirmasi tidak valid atau telah kedaluwarsa.' });
        }

        // Pastikan pengguna tertaut dengan Firebase
        if (!user.firebaseUid) {
            return res.status(400).json({ error: 'Akun Anda belum sepenuhnya terhubung.' });
        }

        // Update Password di Firebase Auth (Source of Truth)
        try {
            await admin.auth().updateUser(user.firebaseUid, {
                password: newPassword
            });
        } catch (firebaseError: any) {
            if (firebaseError.code === 'auth/weak-password') {
                return res.status(400).json({ error: 'Kata sandi terlalu lemah menurut kebijakan server.' });
            }
            throw firebaseError;
        }

        // Hapus kode setelah berhasil digunakan
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });

        return res.status(200).json({ message: 'Kata sandi berhasil diperbarui.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mereset kata sandi.' });
    }
};