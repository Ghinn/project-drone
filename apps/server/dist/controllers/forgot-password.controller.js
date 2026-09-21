"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndResetPassword = exports.sendResetCode = void 0;
const prisma_1 = require("../lib/prisma");
const firebase_1 = require("../lib/firebase");
const mailer_1 = require("../lib/mailer");
// Generate 6 digit angka acak
const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendResetCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: 'Alamat email wajib diisi.' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(200).json({ message: 'Jika email terdaftar, kode telah dikirim.' });
        }
        // Hapus token reset sebelumnya jika ada
        await prisma_1.prisma.verificationToken.deleteMany({
            where: { userId: user.id }
        });
        // Generate 6 digit code dan simpan ke database (berlaku 15 menit)
        const code = generateSixDigitCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        await prisma_1.prisma.verificationToken.create({
            data: {
                token: code,
                expires,
                userId: user.id
            }
        });
        // Panggil utilitas Nodemailer
        await (0, mailer_1.sendResetPasswordEmail)(email, code);
        return res.status(200).json({ message: 'Kode konfirmasi telah dikirim.' });
    }
    catch (error) {
        console.error('Send Reset Code Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengirim kode.' });
    }
};
exports.sendResetCode = sendResetCode;
const verifyAndResetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Data tidak lengkap. Harap isi semua kolom.' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: 'Permintaan tidak valid.' });
        // Validasi Token/Kode
        const verificationToken = await prisma_1.prisma.verificationToken.findFirst({
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
            await firebase_1.firebaseAuth.updateUser(user.firebaseUid, {
                password: newPassword
            });
        }
        catch (firebaseError) {
            if (firebaseError.code === 'auth/weak-password') {
                return res.status(400).json({ error: 'Kata sandi terlalu lemah menurut kebijakan server.' });
            }
            throw firebaseError;
        }
        // Hapus kode setelah berhasil digunakan
        await prisma_1.prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });
        return res.status(200).json({ message: 'Kata sandi berhasil diperbarui.' });
    }
    catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mereset kata sandi.' });
    }
};
exports.verifyAndResetPassword = verifyAndResetPassword;
