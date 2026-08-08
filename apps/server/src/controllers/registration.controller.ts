import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import admin from '../lib/firebase/admin';

export const registerFarmer = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan kata sandi diwajibkan.' });
        }

        // 1. Cek duplikasi di Prisma untuk menghindari proses ke Firebase jika sudah terdaftar
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
        }

        let firebaseUid = '';

        // 2. Buat Pengguna di Firebase Auth
        try {
            // Jika nama tidak disediakan dari UI, gunakan default atau prefix email
            const defaultName = email.split('@')[0];
            
            const firebaseUser = await admin.auth().createUser({
                email,
                password,
                displayName: defaultName,
                emailVerified: false, 
            });
            firebaseUid = firebaseUser.uid;
            
            // Set Custom Claims untuk Role Base Access Control (RBAC)
            await admin.auth().setCustomUserClaims(firebaseUid, { role: 'FARMER' });
        } catch (firebaseError: any) {
            if (firebaseError.code === 'auth/email-already-exists') {
                return res.status(400).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain.' });
            }
            if (firebaseError.code === 'auth/weak-password') {
                return res.status(400).json({ error: 'Kata sandi terlalu lemah (minimal 6 karakter).' });
            }
            throw firebaseError; // Teruskan error lain ke blok catch utama
        }

        // 3. Buat Entri Pengguna di Prisma
        const newUser = await prisma.user.create({
            data: {
                email,
                firebaseUid, 
                name: email.split('@')[0], // Fallback nama dari prefix email
                role: 'FARMER',
                status: 'PENDING',
                emailVerified: false
            }
        });

        // 4. Buat Token Verifikasi Kustom (Opsional jika Anda tidak memakai verifikasi bawaan Firebase)
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Kedaluwarsa 24 jam

        await prisma.verificationToken.create({
            data: {
                token,
                expires,
                userId: newUser.id
            }
        });

        // TODO: Panggil utilitas pengirim email Anda di sini (misal Nodemailer/Resend)
        // const verificationLink = `${process.env.CLIENT_URL}/verify?token=${token}`;
        // await sendEmail(email, "Verifikasi Akun Drone Tech Anda", verificationLink);

        return res.status(201).json({ 
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            data: { 
                id: newUser.id,
                email: newUser.email 
            }
        });

    } catch (error) {
        console.error('Error saat registrasi (registerFarmer):', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses registrasi.' });
    }
};