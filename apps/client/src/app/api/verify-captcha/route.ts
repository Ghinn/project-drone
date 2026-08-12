import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token reCAPTCHA tidak ditemukan.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: 'Konfigurasi Secret Key server hilang.' },
        { status: 500 }
      );
    }

    // Panggil API Google untuk validasi token menggunakan Secret Key
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const recaptchaRes = await fetch(verifyUrl, {
      method: 'POST',
    });
    
    const recaptchaData = await recaptchaRes.json();

    if (recaptchaData.success) {
      // Token valid
      return NextResponse.json({ success: true });
    } else {
      // Token tidak valid atau kadaluarsa
      return NextResponse.json(
        { success: false, message: 'The Recaptcha field is required.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifikasi reCAPTCHA:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}