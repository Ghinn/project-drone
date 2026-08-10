"use client";

import {
  useEffect,
  useState,
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
import { BadgeCheck, Clock3, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email Validation onBlur
  const [emailError, setEmailError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redirectPath, setRedirectPath] = useState('/monitoring');

  // ReCAPTCHA, Terms, Remember Me
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

    return () => {
      window.clearTimeout(timeoutId);
    };
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
      // reCAPTCHA verification on server
      const captchaVerifyRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const captchaVerifyData = await captchaVerifyRes.json();

      if (!captchaVerifyData.success) {
        setErrorMessage(captchaVerifyData.message || 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
        setIsLoading(false);
        return; 
      }

      // Setup Session Persistence
      await setPersistence(
        firebaseAuth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

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

  // Toast helper for resending verify email
  const [toast, setToast] = useState<string | null>(null);
  function triggerToastNotification(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#111111] transition-colors duration-300 font-sans">
      
      {/* ================= SISI KIRI: GAMBAR VISUAL PALMSENSE (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1697350978674-4b40261b0dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0b2416]/80 dark:bg-[#07180e]/85 mix-blend-multiply z-10" />

        {/* Content (z-index 20) */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#84994F] text-white rounded flex items-center justify-center font-bold text-lg shadow-md border border-white/10">
              DP
            </div>
            <span className="font-extrabold text-xl tracking-wider uppercase text-zinc-100">DREAMPALM</span>
          </div>

          {/* Slogan */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold font-sans leading-tight text-white tracking-wide">
              Mendeteksi penyakit sebelum gejala terlihat.
            </h1>
            <p className="text-zinc-300 leading-relaxed text-base font-light">
              Sistem pemantauan cerdas bertenaga AI dan IoT untuk perkebunan kelapa sawit berkelanjutan.
            </p>
          </div>

          {/* Footer research team */}
          <div className="text-xs text-zinc-400 font-light tracking-wide">
            © 2026 DREAMPALM Research & Development Team. All rights reserved.
          </div>
        </div>
      </div>

      {/* ================= SISI KANAN: FORM LOGIN ================= */}
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
              {/* Titles */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-snug">Selamat Datang</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">
                  Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-center text-xs font-semibold text-red-600 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 animate-shake">
                  {errorMessage}
                </div>
              )}

              {/* Log In Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Input Email */}
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

                {/* Input Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Enter your password</label>
                  <input 
                    type="password" 
                    value={password}
                    disabled={isLoading}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 text-sm text-gray-900 dark:text-white outline-none focus:border-[#84994F] focus:ring-1 focus:ring-[#84994F] transition-all"
                  />
                </div>

                {/* Remember Me & Terms Checkbox */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        disabled={isLoading}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-gray-200 dark:border-zinc-800 text-[#84994F] focus:ring-[#84994F] accent-[#84994F]"
                      />
                      <span className="text-xs text-gray-500 dark:text-zinc-400">Ingat Saya</span>
                    </label>
                    <a href="#" className="text-xs font-semibold text-gray-800 dark:text-zinc-300 hover:underline">
                      Lupa Password?
                    </a>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
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
                </div>

                {/* ReCAPTCHA */}
                <div className="flex justify-center py-2 shrink-0">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback test key if missing
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#84994F' }}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </button>
              </form>

              {/* OR CONTINUE WITH Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#111111] px-3 text-gray-400 dark:text-zinc-500 font-bold tracking-wider">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* Google & Apple Auth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => void handleOAuth(googleProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
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
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M16.365 21.436c-1.309.924-2.645.894-3.955.084-1.327-.811-2.66-.826-3.989 0-1.282.811-2.584.869-3.847-.042C.641 18.252-1.293 11.545 1.341 6.84c1.233-2.193 3.08-3.456 5.312-3.486 1.48-.03 2.822.84 4.013.84 1.13 0 2.66-1.021 4.31-.87 1.83.15 3.344.871 4.341 2.373-3.791 2.221-3.14 7.234.615 8.766-1.127 3.036-2.507 5.795-3.567 6.973zm-3.83-16.71c.06-1.892 1.481-3.664 3.421-4.084.346 2.052-1.05 4.024-3.361 4.144h-.06z"/>
                  </svg>
                  Apple
                </button>
              </div>

              {/* Redirect Footer */}
              <div className="text-center pt-4">
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Petani yang belum terdaftar?{' '}
                  <button 
                    onClick={() => router.push('/register')}
                    className="font-bold text-[#84994F] hover:underline bg-transparent border-none outline-none cursor-pointer"
                  >
                    Buat Akun
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS REDIRECT VIEW */}
          {view === 'success' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
                <BadgeCheck className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Masuk Berhasil!
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Menghubungkan ke panel kendali. Anda akan dialihkan secara otomatis dalam{' '}
                  <span className="font-bold text-[#84994F]">{countdown ?? REDIRECT_SECONDS}</span> detik.
                </p>
              </div>

              {signedInEmail && (
                <div className="mx-auto max-w-[320px] rounded-lg bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-zinc-300 font-mono">
                  Sesi aktif: {signedInEmail}
                </div>
              )}

              <button
                onClick={() => router.replace(redirectPath)}
                className="w-full py-3 px-4 rounded-lg text-white font-bold text-sm shadow-md transition-opacity hover:opacity-90"
                style={{ background: '#84994F' }}
              >
                Buka Dashboard Sekarang
              </button>
            </div>
          )}

          {/* VERIFY PENDING VIEW */}
          {view === 'verify-pending' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock3 className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verifikasi Email Anda
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi ke email Anda. Harap verifikasi sebelum masuk.
                </p>
              </div>

              {signedInEmail && (
                <div className="mx-auto max-w-[320px] rounded-lg bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 font-mono">
                  {signedInEmail}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-xs font-semibold text-red-600 border border-red-150 dark:bg-red-950/20 dark:border-red-950/30 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => void handleCheckVerification()}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-lg text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                  style={{ background: '#84994F' }}
                >
                  Cek Verifikasi
                </button>
                <button
                  onClick={() => void handleResendVerification()}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Kirim Ulang
                </button>
              </div>
            </div>
          )}

          {/* VERIFY SUCCESS VIEW */}
          {view === 'verify-success' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-300">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
                <BadgeCheck className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Email Terverifikasi!
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Email Anda berhasil diverifikasi. Anda akan dialihkan secara otomatis dalam{' '}
                  <span className="font-bold text-[#84994F]">{countdown ?? REDIRECT_SECONDS}</span> detik.
                </p>
              </div>

              <button
                onClick={() => router.replace(redirectPath)}
                className="w-full py-3 px-4 rounded-lg text-white font-bold text-sm shadow-md transition-opacity hover:opacity-90"
                style={{ background: '#84994F' }}
              >
                Buka Dashboard Sekarang
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
