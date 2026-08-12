import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Konfigurasi Transport Nodemailer (Contoh menggunakan Gmail/SMTP standar)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true untuk port 465, false untuk port lainnya
    auth: {
        user: process.env.SMTP_USER, // Masukkan ke .env backend Anda
        pass: process.env.SMTP_PASS  // App Password jika menggunakan Gmail
    }
});

export const sendVerificationEmail = async (to: string, token: string) => {
    // Sesuaikan CLIENT_URL dengan domain frontend Anda
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationLink = `${clientUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"DreamPalm Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Verifikasi Akun DreamPalm Anda',
        html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
                <h2>Selamat Datang di DreamPalm Web App!</h2>
                <p>Terima kasih telah mendaftar. Untuk mulai menggunakan dasbor pemantauan kami, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #84994F; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
                    Verifikasi Email Saya
                </a>
                <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
                    Atau salin dan tempel tautan ini di browser Anda:<br>
                    <a href="${verificationLink}">${verificationLink}</a>
                </p>
                <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
                    Tautan ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak merasa mendaftar di sistem kami, abaikan email ini.
                </p>
            </div>
        `
    };
    
    return await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (to: string, code: string) => {
    const mailOptions = {
        from: `"DreamPalm Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Kode Reset Kata Sandi Akun DreamPalm Anda',
        html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px;">
                <h2 style="color: #191919;">Atur Ulang Kata Sandi</h2>
                <p style="color: #5B6068; line-height: 1.6;">Kami menerima permintaan untuk mengatur ulang kata sandi akun DreamPalm Anda. Masukkan kode konfirmasi 6 digit berikut pada form yang tersedia:</p>
                
                <div style="margin: 32px 0; text-align: center;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007BFF; background-color: #F7F9FB; padding: 16px 24px; border-radius: 8px; border: 1px solid #D1D5DB;">
                        ${code}
                    </span>
                </div>
                
                <p style="color: #6A717F; font-size: 13px;">Kode ini akan kedaluwarsa dalam 15 menit. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

export const sendAdminInvitationEmail = async (to: string, token: string, name: string) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const setupLink = `${clientUrl}/setup-password?token=${token}`;

    const mailOptions = {
        from: `"DreamPalm Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Undangan Akses Sistem dan Pembuatan Kata Sandi DreamPalm',
        html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #191919; margin-bottom: 8px;">Selamat Datang, ${name || 'Pengguna'}!</h2>
                <p style="color: #5B6068; line-height: 1.6;">
                    Administrator sistem <strong>DreamPalm</strong> telah mendaftarkan akun Anda ke dalam platform pemantauan terpadu. Untuk mengaktifkan akun dan membuat kata sandi Anda, silakan klik tombol di bawah ini:
                </p>
                
                <div style="margin: 28px 0; text-align: center;">
                    <a href="${setupLink}" style="display: inline-block; padding: 14px 28px; background-color: #84994F; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                        Aktifikan Akun
                    </a>
                </div>
                
                <p style="margin-top: 24px; font-size: 14px; color: #5B6068;">
                    Atau salin dan tempel tautan ini di browser Anda:<br>
                    <a href="${setupLink}" style="color: #84994F; word-break: break-all;">${setupLink}</a>
                </p>
                <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; pt: 16px;">
                    Tautan ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak merasa memiliki kaitan dengan sistem ini, silakan abaikan email ini.
                </p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};