"use client";

import {
  useEffect,
  useState,
  useRef,
  type FormEvent
} from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendEmailVerification
} from 'firebase/auth';
import ReCAPTCHA from 'react-google-recaptcha';
import { BadgeCheck, Clock3, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { homeForRole } from '@/lib/auth/roles';
import { auth as firebaseAuth, googleProvider } from '@/lib/firebase/client';
import { useAuth } from '@/providers/auth-provider';

type AuthView =
  | 'form'
  | 'success'
  | 'verify-pending'
  | 'verify-success';

const REDIRECT_SECONDS = 5;

function getContinueUrl() {
  if (typeof window === 'undefined') {
    return '/monitoring';
  }
  return `${window.location.origin}/monitoring`;
}

function getFirebaseErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as {code: unknown}).code === 'string'
  ) {
    return (error as {code: string}).code;
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('LoginModal');
  const { syncSession } = useAuth(); 

  const [view, setView] = useState<AuthView>('form');
  const [email, setEmail] = useState('');
  const [signedInEmail, setSignedInEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redirectPath, setRedirectPath] = useState('/monitoring');

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const appleProvider = new OAuthProvider('apple.com');

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.replace(redirectPath);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setCountdown((current) => (current === null ? null : current - 1));
    }, 1000);
    return () => { window.clearTimeout(timeoutId); };
  }, [countdown, redirectPath, router]);

  function beginRedirect(path: string) {
    setRedirectPath(path);
    setCountdown(REDIRECT_SECONDS);
  }

  function mapError(error: unknown): string {
    const code = getFirebaseErrorCode(error);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-login-credentials':
        return t('errors.invalidCredentials') || 'Email atau kata sandi salah.';
      case 'auth/email-already-in-use':
        return t('errors.emailAlreadyInUse') || 'Email sudah digunakan.';
      case 'auth/weak-password':
        return t('errors.weakPassword') || 'Kata sandi terlalu lemah.';
      case 'auth/popup-closed-by-user':
        return t('errors.popupClosed') || 'Proses masuk dibatalkan.';
      case 'auth/too-many-requests':
        return t('errors.tooManyRequests') || 'Terlalu banyak percobaan masuk. Silakan coba lagi nanti.';
      case 'auth/user-disabled':
        return t('errors.userDisabled') || 'Akun ini telah dinonaktifkan.';
      default:
        if (error instanceof Error && error.message) {
          return error.message; 
        }
        return t('errors.unknown') || 'Terjadi kesalahan sistem.';
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailError) return;
    if (!acceptTerms) {
      setErrorMessage('Harap setujui syarat dan ketentuan sebelum masuk.');
      return;
    }
    if (!recaptchaToken) {
      setErrorMessage('Harap selesaikan verifikasi reCAPTCHA.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    firebaseAuth.languageCode = locale;
    try {
      const captchaVerifyRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
      });
      const captchaVerifyData = await captchaVerifyRes.json();
      if (!captchaVerifyData.success) {
        setErrorMessage(captchaVerifyData.message || 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
        setIsLoading(false);
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return; 
      }
      await setPersistence(
        firebaseAuth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const nextRole = await syncSession(credential.user);
      setSignedInEmail(credential.user.email ?? email);
      setView('success');
      beginRedirect(homeForRole(nextRole));
    } catch (error: any) {
      await signOut(firebaseAuth);
      if (error?.message?.includes('Email verification') || error?.message?.includes('verify')) {
        setSignedInEmail(email);
        setView('verify-pending');
      } else {
        setErrorMessage(mapError(error));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider: typeof googleProvider | typeof appleProvider) {
    setIsLoading(true);
    setErrorMessage(null);
    firebaseAuth.languageCode = locale;
    try {
      const credential = await signInWithPopup(firebaseAuth, provider);
      const nextRole = await syncSession(credential.user);
      setSignedInEmail(credential.user.email ?? '');
      setView('success');
      beginRedirect(homeForRole(nextRole));
    } catch (error: any) {
      await signOut(firebaseAuth);
      setErrorMessage(mapError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!firebaseAuth.currentUser) {
      setErrorMessage('Pengguna tidak ditemukan.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    firebaseAuth.languageCode = locale;
    try {
      await sendEmailVerification(firebaseAuth.currentUser, {
        url: getContinueUrl(),
        handleCodeInApp: false
      });
      triggerToastNotification('Email verifikasi berhasil dikirim ulang.');
    } catch (error) {
      setErrorMessage(mapError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckVerification() {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      setErrorMessage('Pengguna tidak ditemukan.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await currentUser.reload();
      if (!currentUser.emailVerified) {
        setErrorMessage('Verifikasi email Anda masih tertunda.');
        return;
      }
      const nextRole = await syncSession(currentUser);
      setSignedInEmail(currentUser.email ?? signedInEmail);
      setView('verify-success');
      beginRedirect(homeForRole(nextRole));
    } catch (error) {
      setErrorMessage(mapError(error));
    } finally {
      setIsLoading(false);
    }
  }

  const [toast, setToast] = useState<string | null>(null);
  function triggerToastNotification(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Shared input style
  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all";
  const inputStyle = {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    color: '#0F172A',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>

      {/* ===== LEFT PANEL: DreamPalm Visual (Desktop only) ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        
        {/* Background radial glows */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6B8E23 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-10 h-[400px] w-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-0 h-[250px] w-[250px] rounded-full opacity-10"
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

        {/* Content */}
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#6B8E23' }}>
              Disease Recognition & Enhanced Aerial Marking
            </p>
            <h1
              className="font-extrabold text-white leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)' }}
            >
              Mendeteksi penyakit{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6B8E23, #C8553D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                sebelum
              </span>{' '}gejala terlihat.
            </h1>
          </div>

          {/* Footer */}
          <div>
            {/* Gradient line */}
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

      {/* ===== RIGHT PANEL: Login Form ===== */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 overflow-y-auto"
        style={{ background: '#ffffff' }}
      >
        <div className="w-full max-w-[420px] space-y-6">

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
              <div>
                <h2 className="text-2xl font-extrabold text-[#0F172A] leading-snug">
                  Selamat Datang
                </h2>
                <p className="text-sm text-[#64748b] mt-1.5">
                  Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl border text-xs font-semibold text-center"
                  style={{ borderColor: 'rgba(200,85,61,0.3)', background: 'rgba(200,85,61,0.06)', color: '#C8553D' }}
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled={isLoading}
                    required
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    onBlur={(e) => { if (e.target.value && !e.target.validity.valid) setEmailError(e.target.validationMessage); }}
                    placeholder="nama@email.com"
                    className={inputClass}
                    style={{
                      ...inputStyle,
                      borderColor: emailError ? '#C8553D' : '#e2e8f0',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#6B8E23'; e.target.style.boxShadow = '0 0 0 3px rgba(107,142,35,0.1)'; }}
                    onBlurCapture={(e) => { e.target.style.borderColor = emailError ? '#C8553D' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  {emailError && <p className="text-xs font-semibold" style={{ color: '#C8553D' }}>{emailError}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      disabled={isLoading}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        disabled={isLoading}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#6B8E23]"
                      />
                      <span className="text-xs text-[#64748b]">Ingat Saya</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-xs font-bold hover:underline"
                      style={{ color: '#7C3AED' }}
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      disabled={isLoading}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-[#6B8E23]"
                    />
                    <span className="text-xs text-[#64748b] leading-snug">
                      Saya menyetujui Syarat Layanan dan Kebijakan Privasi DREAMPALM.
                    </span>
                  </label>
                </div>

                {/* ReCAPTCHA */}
                <div className="flex justify-center py-1 shrink-0">
                  <ReCAPTCHA
                    ref={recaptchaRef}
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
                  Sign In
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#e2e8f0' }} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#94a3b8] font-bold tracking-wider">
                    ATAU LANJUTKAN DENGAN
                  </span>
                </div>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => void handleOAuth(googleProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all hover:bg-[#f1f5f9]"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => void handleOAuth(appleProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all hover:bg-[#f1f5f9]"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M16.365 21.436c-1.309.924-2.645.894-3.955.084-1.327-.811-2.66-.826-3.989 0-1.282.811-2.584.869-3.847-.042C.641 18.252-1.293 11.545 1.341 6.84c1.233-2.193 3.08-3.456 5.312-3.486 1.48-.03 2.822.84 4.013.84 1.13 0 2.66-1.021 4.31-.87 1.83.15 3.344.871 4.341 2.373-3.791 2.221-3.14 7.234.615 8.766-1.127 3.036-2.507 5.795-3.567 6.973zm-3.83-16.71c.06-1.892 1.481-3.664 3.421-4.084.346 2.052-1.05 4.024-3.361 4.144h-.06z"/>
                  </svg>
                  Apple
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-[#64748b]">
                  Petani yang belum terdaftar?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="font-bold hover:underline"
                    style={{ color: '#6B8E23' }}
                  >
                    Buat Akun
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
                <h3 className="text-2xl font-bold text-[#0F172A]">Masuk Berhasil!</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  Anda akan dialihkan secara otomatis dalam{' '}
                  <span className="font-bold" style={{ color: '#6B8E23' }}>{countdown ?? REDIRECT_SECONDS}</span> detik.
                </p>
              </div>
              {signedInEmail && (
                <div
                  className="mx-auto max-w-[320px] rounded-xl px-4 py-2.5 text-xs font-mono"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                >
                  Sesi aktif: {signedInEmail}
                </div>
              )}
              <button
                onClick={() => router.replace(redirectPath)}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
              >
                Buka Dashboard Sekarang
              </button>
            </div>
          )}

          {/* VERIFY PENDING VIEW */}
          {view === 'verify-pending' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div
                className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'rgba(200,85,61,0.1)', color: '#C8553D' }}
              >
                <Clock3 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Verifikasi Email Anda</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi ke email Anda. Harap verifikasi sebelum masuk.
                </p>
              </div>
              {signedInEmail && (
                <div className="mx-auto max-w-[320px] rounded-xl px-4 py-2.5 text-xs font-mono"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                  {signedInEmail}
                </div>
              )}
              {errorMessage && (
                <div className="p-3 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(200,85,61,0.06)', border: '1px solid rgba(200,85,61,0.2)', color: '#C8553D' }}>
                  {errorMessage}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => void handleCheckVerification()}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
                >
                  Cek Verifikasi
                </button>
                <button
                  onClick={() => void handleResendVerification()}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl font-bold text-xs hover:bg-[#f1f5f9] transition-colors"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                >
                  Kirim Ulang
                </button>
              </div>
            </div>
          )}

          {/* VERIFY SUCCESS VIEW */}
          {view === 'verify-success' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div
                className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'rgba(107,142,35,0.1)', color: '#6B8E23' }}
              >
                <BadgeCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Email Terverifikasi!</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  Email Anda berhasil diverifikasi. Anda akan dialihkan dalam{' '}
                  <span className="font-bold" style={{ color: '#6B8E23' }}>{countdown ?? REDIRECT_SECONDS}</span> detik.
                </p>
              </div>
              <button
                onClick={() => router.replace(redirectPath)}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
              >
                Buka Dashboard Sekarang
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-5 text-xs font-bold"
          style={{ background: '#0F172A', color: '#fff', border: '1px solid rgba(107,142,35,0.3)' }}>
          <svg className="w-4 h-4" fill="none" stroke="#6B8E23" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
          </svg>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}