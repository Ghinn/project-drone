"use client";

import {
  useState,
  type FormEvent
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

type RegistrationView =
  | 'form'
  | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('RegistrationModal');
  
  const [view, setView] = useState<RegistrationView>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email Validation onBlur
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // ReCAPTCHA & Terms
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (emailError) return;

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Harap setujui syarat dan ketentuan.');
      return;
    }

    if (!recaptchaToken) {
      setErrorMessage('Harap selesaikan verifikasi reCAPTCHA.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // reCAPTCHA verification on server
      const captchaVerifyRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const captchaVerifyData = await captchaVerifyRes.json();

      if (!captchaVerifyData.success) {
        setErrorMessage(captchaVerifyData.message || 'Verifikasi reCAPTCHA gagal.');
        setIsLoading(false);
        return; 
      }

      // API registration endpoint call
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const registerRes = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Terjadi kesalahan saat pendaftaran.');
      }
      
      setView('success');
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#111111] transition-colors duration-300 font-sans">
      
      {/* ================= SISI KIRI: FORM REGISTRASI ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-[#111111] overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-6">
          
          {/* Mobile view Logo Header */}
          <div className="flex lg:hidden items-center gap-2 mb-4 justify-center">
            <div className="w-8 h-8 bg-[#84994F] text-white rounded flex items-center justify-center font-bold shadow-md">
              DP
            </div>
            <span className="font-extrabold text-lg tracking-wider text-gray-800 dark:text-white">DREAMPALM</span>
          </div>

          {/* FORM VIEW */}
          {view === 'form' && (
            <div className="space-y-6">
              
              {/* Heading */}
              <div className="text-center lg:text-left space-y-2">
                {/* Green badge "KHUSUS PETANI" */}
                <span className="inline-block px-2.5 py-1 rounded bg-[#84994F]/10 dark:bg-[#84994F]/20 text-[#84994F] text-[10.5px] font-bold uppercase tracking-wider">
                  Khusus Petani
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-snug">Daftar Akun Petani</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Pantau lahan sawit Anda dan lihat hasil analisis secara langsung.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-center text-xs font-semibold text-red-600 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    disabled={isLoading}
                    required
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !e.target.validity.valid) {
                        setEmailError(e.target.validationMessage);
                      }
                    }}
                    placeholder="nama@email.com"
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-900/50 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 transition-all
                      ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#84994F] focus:ring-[#84994F]'}`}
                  />
                  {emailError && <p className="text-red-500 text-[11px] mt-1 font-semibold">{emailError}</p>}
                </div>

                {/* Create Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Create Password</label>
                  <input 
                    type="password" 
                    value={password}
                    disabled={isLoading}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-sm text-gray-900 dark:text-white outline-none focus:border-[#84994F] focus:ring-1 focus:ring-[#84994F] transition-all"
                  />
                </div>

                {/* Confirm Create Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Confirm Create Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    disabled={isLoading}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password Anda"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-sm text-gray-900 dark:text-white outline-none focus:border-[#84994F] focus:ring-1 focus:ring-[#84994F] transition-all"
                  />
                </div>

                {/* Terms agreement checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={acceptTerms}
                    disabled={isLoading}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4.5 w-4.5 rounded border-gray-200 dark:border-zinc-800 text-[#84994F] focus:ring-[#84994F] accent-[#84994F]"
                  />
                  <span className="text-xs text-gray-500 dark:text-zinc-400 leading-snug">
                    Saya menyetujui Syarat Layanan dan Kebijakan Privasi DREAMPALM.
                  </span>
                </label>

                {/* ReCAPTCHA */}
                <div className="flex justify-center py-2 shrink-0">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback test key
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#84994F' }}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </button>
              </form>

              {/* Redirect back to Sign In */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Sudah punya akun?{' '}
                  <button 
                    onClick={() => router.push('/login')}
                    className="font-bold text-[#84994F] hover:underline bg-transparent border-none outline-none cursor-pointer"
                  >
                    Sign In di sini
                  </button>
                </p>
              </div>

            </div>
          )}

          {/* REGISTRATION SUCCESS VIEW */}
          {view === 'success' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
                <BadgeCheck className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Registrasi Berhasil!
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Akun Anda telah terdaftar. Kami telah mengirimkan email verifikasi. Silakan periksa kotak masuk email Anda dan klik tautan verifikasi sebelum melakukan login.
                </p>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 rounded-lg text-white font-bold text-sm shadow-md transition-opacity hover:opacity-90"
                style={{ background: '#84994F' }}
              >
                Kembali ke Halaman Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ================= SISI KANAN: GAMBAR DRONE TEKNISI (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1527977966376-1c8408f9f108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200')",
          }}
        />
        {/* Mask overlay */}
        <div className="absolute inset-0 bg-[#0b2416]/80 dark:bg-[#07180e]/85 mix-blend-multiply z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#84994F] text-white rounded flex items-center justify-center font-bold text-lg shadow-md border border-white/10">
              DP
            </div>
            <span className="font-extrabold text-xl tracking-wider uppercase text-zinc-100">DREAMPALM</span>
          </div>

          {/* Promo */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold font-sans leading-tight text-white tracking-wide">
              Teknologi UAV & AI untuk Kelapa Sawit
            </h1>
            <p className="text-zinc-300 leading-relaxed text-base font-light">
              Tingkatkan efisiensi dan akurasi penanggulangan Ganoderma dengan pemetaan real-time.
            </p>
          </div>

          {/* Footer team */}
          <div className="text-xs text-zinc-400 font-light tracking-wide">
            © 2026 DREAMPALM Research & Development Team. All rights reserved.
          </div>
        </div>
      </div>

    </div>
  );
}
