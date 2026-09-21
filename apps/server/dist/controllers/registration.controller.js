"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFarmer = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const firebase_1 = require("../lib/firebase");
const firebase_auth_service_1 = require("../services/firebase-auth.service");
const mailer_1 = require("../lib/mailer");
const client_1 = require("@prisma/client");
const registerFarmer = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan kata sandi diwajibkan.' });
        }
        // Cek duplikasi di Prisma untuk menghindari proses ke Firebase jika sudah terdaftar
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
        }
        let firebaseUid = '';
        // Buat Pengguna di Firebase Auth
        try {
            // Jika nama tidak disediakan dari UI, gunakan default atau prefix email
            const defaultName = email.split('@')[0];
            const firebaseUser = await firebase_1.firebaseAuth.createUser({
                email,
                password,
                displayName: defaultName,
                emailVerified: false,
            });
            firebaseUid = firebaseUser.uid;
            // Set Custom Claims untuk Role Farmer via modalRegistration
            await (0, firebase_auth_service_1.setCustomUserRole)(firebaseUid, client_1.Role.FARMER);
        }
        catch (firebaseError) {
            if (firebaseError.code === 'auth/email-already-exists') {
                return res.status(400).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
            }
            if (firebaseError.code === 'auth/weak-password') {
                return res.status(400).json({ error: 'Kata sandi terlalu lemah menurut kebijakan server.' });
            }
            throw firebaseError; // Teruskan error lain ke blok catch utama
        }
        // Buat Entri Pengguna di Prisma
        const newUser = await prisma_1.prisma.user.create({
            data: {
                email,
                firebaseUid,
                name: email.split('@')[0], // Fallback nama dari prefix email
                role: 'FARMER',
                status: 'PENDING',
                emailVerified: false
            }
        });
        // Buat Token Verifikasi Kustom
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Kedaluwarsa 24 jam
        await prisma_1.prisma.verificationToken.create({
            data: {
                token,
                expires,
                userId: newUser.id
            }
        });
        // Panggil utilitas Nodemailer
        try {
            await (0, mailer_1.sendVerificationEmail)(email, token);
        }
        catch (emailError) {
            console.error('Gagal mengirim email verifikasi:', emailError);
            return res.status(201).json({
                message: 'Akun berhasil dibuat, tetapi kami mengalami kendala saat mengirim email verifikasi. Silakan hubungi dukungan.',
                data: { id: newUser.id, email: newUser.email }
            });
        }
        return res.status(201).json({
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            data: {
                id: newUser.id,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.error('Error saat registrasi (registerFarmer):', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses registrasi.' });
    }
};
exports.registerFarmer = registerFarmer;
