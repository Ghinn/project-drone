import { z } from "zod";
import { Role } from "../generated/prisma";
import { env } from "../config/env";
import { firebaseAuth } from "../lib/firebase";
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 
import crypto from 'crypto';
import admin from '../lib/firebase/admin';

export const sessionLogin = async (req: Request, res: Response) => {
    try {
        // idToken dikirim dari sisi Client (Next.js) setelah berhasil login Firebase
        const { idToken } = req.body; 

        if (!idToken) {
            return res.status(400).json({ error: 'Token Firebase tidak disertakan.' });
        }

        // 1. Verifikasi token menggunakan Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({ error: 'Email tidak ditemukan dari kredensial Firebase.' });
        }

        // 2. Cek apakah user sudah ada di database kita
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // SKENARIO 1: Pengguna Baru (Misal via Google Sign-In atau registrasi baru)
            // Sesuai aturan Anda, otomatis jadikan role FARMER
            user = await prisma.user.create({
                data: {
                    email,
                    firebaseUid: uid,
                    name: name || 'Pengguna Baru',
                    avatarUrl: picture || null,
                    role: 'FARMER', // Otomatis FARMER
                    status: 'APPROVED', // Jika via Google, email sudah pasti valid
                    emailVerified: true
                }
            });
        } else {
            // SKENARIO 2: Pengguna Sudah Ada (Admin/Operator buatan manual atau user lama)
            // Update firebaseUid jika belum tertaut, dan perbarui info dasar
            user = await prisma.user.update({
                where: { email },
                data: {
                    firebaseUid: uid,
                    lastLoginAt: new Date(),
                    // Jangan ubah role di sini, agar hak akses Admin/Operator tidak tertimpa
                }
            });
        }

        // 3. (Opsional) Jika menggunakan Session Cookie untuk SSR Next.js
        // Anda bisa meng-generate session cookie di sini dan mengesetnya ke header
        await admin.auth().setCustomUserClaims(uid, { role: user.role });
        
        return res.status(200).json({
            message: 'Login berhasil.',
            data: user
        });

    } catch (error) {
        console.error('Error saat session login:', error);
        return res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa.' });
    }
};

export const registerFarmer = async (req: Request, res: Response) => {
    try {
        const { email, passwordHash, name } = req.body;

        // 1. Cek apakah email sudah ada
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        // 2. Buat user dengan role FARMER dan status PENDING
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash, // Pastikan ini di-hash (misal pakai bcrypt) sebelum disimpan
                name,
                role: 'FARMER',
                status: 'PENDING',
                emailVerified: false
            }
        });

        // 3. Buat token verifikasi
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Kedaluwarsa 24 jam

        await prisma.verificationToken.create({
            data: {
                token,
                expires,
                userId: newUser.id
            }
        });

        // 4. TODO: Kirim Email (Gunakan Nodemailer/Resend/SendGrid)
        // const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
        // sendEmail(email, "Verifikasi Akun Drone Anda", verificationLink);

        res.status(201).json({ 
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.' 
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        // 1. Cari token di database
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token: String(token) }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Token tidak valid atau sudah kedaluwarsa' });
        }

        // 2. Update user: emailVerified jadi true, status jadi APPROVED
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { 
                emailVerified: true,
                status: 'APPROVED'
            }
        });

        // 3. Hapus token agar tidak bisa dipakai lagi
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id }
        });

        res.status(200).json({ message: 'Email berhasil diverifikasi. Anda sekarang dapat login.' });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};