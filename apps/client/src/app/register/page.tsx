"use client";

import {
  useState,
  useEffect,
  type FormEvent
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { BadgeCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

type RegistrationView = 'form' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('RegistrationModal');
  
  const [view, setView] = useState<RegistrationView>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setConfirmPasswordError(t('errors.passwordMismatch') || 'Konfirmasi kata sandi tidak cocok.');
      } else {
        setConfirmPasswordError(null);
      }
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword, t]);

  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return '#C8553D';
    if (score <= 3) return '#FCB53B';
    return '#6B8E23';
  };
  const getStrengthText = (score: number) => {
    if (score === 0) return '';
    if (score <= 2) return t('errors.weakPassword') || 'Sandi lemah';
    if (score <= 3) return t('errors.mediumPassword') || 'Sandi sedang';
    return t('errors.strongPassword') || 'Sandi kuat';
  };

  const passwordScore = evaluatePasswordStrength(password);

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailError) return;
    if (passwordScore < 3) {
      setErrorMessage(t('errors.weakPassword') || 'Kata sandi terlalu lemah.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('errors.passwordMismatch') || 'Konfirmasi kata sandi tidak cocok.');
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
      const registerRes = await fetch('/api/auth/register', {
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

  // Shared input style
  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all";
  const inputStyle = { background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0F172A' };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>

      {/* ===== LEFT PANEL: Registration Form ===== */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 overflow-y-auto"
        style={{ background: '#ffffff' }}
      >
        <div className="w-full max-w-[420px] space-y-5">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6B8E23, #C8553D, #7C3AED)' }}
            >
              DP
            </div>
            <span className="font-extrabold text-lg text-[#0F172A]">
              Dream<span style={{ color: '#6B8E23' }}>Palm</span>
            </span>
          </div>

          {/* FORM VIEW */}
          {view === 'form' && (
            <div className="space-y-5">
              <div className="space-y-2">
                {/* Pill badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(107,142,35,0.1)', color: '#6B8E23', border: '1px solid rgba(107,142,35,0.2)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6B8E23]" />
                  Khusus Petani
                </span>
                <h2 className="text-2xl font-extrabold text-[#0F172A] leading-snug">
                  Daftar Akun Petani
                </h2>
                <p className="text-sm text-[#64748b]">
                  Pantau lahan sawit Anda dan lihat hasil analisis secara langsung.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl text-xs font-semibold text-center"
                  style={{ borderColor: 'rgba(200,85,61,0.3)', border: '1px solid rgba(200,85,61,0.3)', background: 'rgba(200,85,61,0.06)', color: '#C8553D' }}>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled={isLoading}
                    required
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    onBlur={(e) => { if (e.target.value && !e.target.validity.valid) setEmailError(e.target.validationMessage); }}
                    placeholder="nama@email.com"
                    className={inputClass}
                    style={{ ...inputStyle, borderColor: emailError ? '#C8553D' : '#e2e8f0' }}
                    onFocus={(e) => { e.target.style.borderColor = '#6B8E23'; e.target.style.boxShadow = '0 0 0 3px rgba(107,142,35,0.1)'; }}
                    onBlurCapture={(e) => { e.target.style.borderColor = emailError ? '#C8553D' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  {emailError && <p className="text-xs font-semibold" style={{ color: '#C8553D' }}>{emailError}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Buat Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      disabled={isLoading}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className={inputClass}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#6B8E23'; e.target.style.boxShadow = '0 0 0 3px rgba(107,142,35,0.1)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#94a3b8' }}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="flex items-center gap-2 px-1 pt-1">
                      <div className="flex h-1 flex-1 gap-1">
                        {[1, 3, 5].map((threshold, i) => (
                          <div
                            key={i}
                            className="h-full flex-1 rounded-full transition-all duration-300"
                            style={{ background: passwordScore >= threshold ? getStrengthColor(passwordScore) : '#e2e8f0' }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: getStrengthColor(passwordScore) }}>
                        {getStrengthText(passwordScore)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">Konfirmasi Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      disabled={isLoading}
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password Anda"
                      className={inputClass}
                      style={{ ...inputStyle, borderColor: confirmPasswordError ? '#C8553D' : '#e2e8f0' }}
                      onFocus={(e) => { e.target.style.borderColor = '#6B8E23'; e.target.style.boxShadow = '0 0 0 3px rgba(107,142,35,0.1)'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = confirmPasswordError ? '#C8553D' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#94a3b8' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs font-semibold" style={{ color: '#C8553D' }}>{confirmPasswordError}</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    disabled={isLoading}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#6B8E23]"
                  />
                  <span className="text-xs text-[#64748b] leading-snug">
                    Saya menyetujui{' '}
                    <span className="font-bold" style={{ color: '#6B8E23' }}>Syarat Layanan</span> dan{' '}
                    <span className="font-bold" style={{ color: '#6B8E23' }}>Kebijakan Privasi</span> DREAMPALM.
                  </span>
                </label>

                {/* ReCAPTCHA */}
                <div className="flex justify-center py-1 shrink-0">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #6B8E23 0%, #7C3AED 100%)' }}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Buat Akun
                </button>
              </form>

              <div className="text-center">
                <p className="text-xs text-[#64748b]">
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="font-bold hover:underline"
                    style={{ color: '#6B8E23' }}
                  >
                    Sign In di sini
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === 'success' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div
                className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'rgba(107,142,35,0.1)', color: '#6B8E23' }}
              >
                <BadgeCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Registrasi Berhasil!</h3>
                <p className="text-sm text-[#64748b] leading-relaxed max-w-sm mx-auto">
                  Akun Anda telah terdaftar. Kami telah mengirimkan email verifikasi ke inbox Anda. Klik tautan verifikasi sebelum melakukan login.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
              >
                Kembali ke Halaman Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ===== RIGHT PANEL: DreamPalm Visual (Desktop only) ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        
        {/* Radial glows */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6B8E23 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-10 h-[400px] w-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-1/3 left-0 h-[250px] w-[250px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C8553D 0%, transparent 70%)' }}
        />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(107,142,35,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(107,142,35,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6B8E23 0%, #C8553D 60%, #7C3AED 100%)' }}
            >
              DP
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Dream<span style={{ color: '#6B8E23' }}>Palm</span>
            </span>
          </div>

          {/* Central slogan */}
          <div className="my-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#C8553D' }}>
              Precision Application in Oil Palm
            </p>
            <h1
              className="font-extrabold text-white leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)' }}
            >
              Teknologi UAV & AI untuk{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6B8E23, #7C3AED)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Kelapa Sawit
              </span>
            </h1>
          </div>

          {/* Footer */}
          <div>
            <div
              className="h-px w-full mb-4"
              style={{ background: 'linear-gradient(90deg, #6B8E23, #C8553D, #7C3AED)' }}
            />
            <p className="text-xs" style={{ color: '#334155' }}>
              © 2026 DREAMPALM Research & Development Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}