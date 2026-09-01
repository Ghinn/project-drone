'use client';

import {
  useEffect,
  useState,
  useRef,
  type FormEvent
} from 'react';
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  OAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import ReCAPTCHA from 'react-google-recaptcha';
import {BadgeCheck, Clock3, X, Eye, EyeOff} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {homeForRole} from '@/lib/auth/roles';
import {auth as firebaseAuth, googleProvider} from '@/lib/firebase/client';
import {useAuth} from '@/providers/auth-provider';

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

export function LoginModal() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('LoginModal');
  
  const {syncSession} = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [view, setView] = useState<AuthView>('form');
  const [email, setEmail] = useState('');
  const [signedInEmail, setSignedInEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Validasi Email onBlur
  const [emailError, setEmailError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [redirectPath, setRedirectPath] = useState('/monitoring');

  // States untuk fitur baru (reCAPTCHA, Terms, Remember Me)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const appleProvider = new OAuthProvider('apple.com');

  useEffect(() => {
    if (pathname === '/login') {
      setIsModalVisible(true);
      setView('form');
    }
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalVisible(false);
        router.replace('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  useEffect(() => {
    if (countdown === null) {
      return;
    }

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
        return t('errors.invalidCredentials');
      case 'auth/email-already-in-use':
        return t('errors.emailAlreadyInUse');
      case 'auth/weak-password':
        return t('errors.weakPassword');
      case 'auth/popup-closed-by-user':
        return t('errors.popupClosed');
      case 'auth/too-many-requests':
        return t('errors.tooManyRequests');
      case 'auth/user-disabled':
        return t('errors.userDisabled');
      default:
        if (error instanceof Error && error.message) {
          return error.message; 
        }
        return t('errors.unknown');
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (emailError) return;

    if (!acceptTerms) {
      setErrorMessage(t('errors.termsNotAccepted') || 'Harap setujui syarat dan ketentuan.');
      return;
    }

    if (!recaptchaToken) {
      setErrorMessage(t('errors.invalidCaptcha') || 'Harap selesaikan verifikasi reCAPTCHA.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    firebaseAuth.languageCode = locale;

    try {
      // Verifikasi reCAPTCHA Ke Server
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

        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return; 
      }

      // Setup Firebase Session Persistence (Remember Me feature)
      await setPersistence(
        firebaseAuth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      if (!credential.user.emailVerified) {
        await signOut(firebaseAuth);
        setErrorMessage(t('hints.verificationStillPending'));
        setIsLoading(false);

        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return;
      }

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
        
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
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
      setErrorMessage(t('errors.unknown'));
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
    } catch (error) {
      setErrorMessage(mapError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckVerification() {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      setErrorMessage(t('errors.unknown'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await currentUser.reload();
      if (!currentUser.emailVerified) {
        setErrorMessage(t('hints.verificationStillPending'));
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

  function closeModal() {
    setIsModalVisible(false);
    router.replace('/');
  }

  function goToDashboardNow() {
    setIsModalVisible(false);
    router.replace(redirectPath);
  }

  if (!isModalVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all"
        role="dialog"
      >
        <button
          aria-label={t('actions.close')}
          className="absolute right-4 top-4 rounded-full p-2 text-[#6A717F] transition hover:bg-neutral-100 hover:text-[#191919]"
          disabled={isLoading}
          onClick={closeModal}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        {view === 'form' ? (
          <div className="px-8 py-8">
            <div className="text-center">
              <h2 className="text-[22px] font-bold text-[#191919]">
                {t('title')}
              </h2>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-[14px] font-semibold text-red-600">
                {errorMessage}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
              <div>
                <input
                  autoComplete="email"
                  className={`w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#D1D5DB] focus:border-[#023337] focus:ring-[#023337]'} outline-none transition placeholder:text-[#6A717F] focus:ring-1`}
                  disabled={isLoading}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={(e) => {
                    if (e.target.value && !e.target.validity.valid) {
                      setEmailError(e.target.validationMessage);
                    } else {
                      setEmailError(null);
                    }
                  }}
                  placeholder={t('placeholders.email')}
                  required
                  type="email"
                  value={email}
                />
                {emailError ? (
                  <p className="mt-1.5 px-1 text-[12px] font-medium text-red-500">
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                  disabled={isLoading}
                  placeholder={t('placeholders.password')}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A717F] hover:text-[#191919]"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* REMEMBER ME & FORGOT PASSWORD */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-[#6A717F] bg-transparent outline-none transition checked:border-[#023337] checked:bg-[#023337] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+')] checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-[13px] font-normal leading-snug text-[#5B6068]">
                    {t('actions.rememberMe')}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => router.replace('/forgot-password')}
                  className="text-[13px] font-semibold text-[#191919] hover:text-[#FF5C01] hover:underline"
                >
                  {t('actions.forgotPassword')}
                </button>
              </div>

              {/* RECAPTCHA SECTION */}
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setRecaptchaToken(token)}
                />
              </div>


              {/* TERMS CHECKBOX */}
              <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-[#6A717F] bg-transparent outline-none transition checked:border-[#023337] checked:bg-[#023337] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+PC9zdmc+')] checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="text-[14px] font-normal leading-snug text-[#5B6068]">
                  {t('terms')}
                </span>
              </label>

              {/* ACTION BUTTONS: SIGN IN & SIGN UP */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  className="w-full rounded-xl bg-[#5B6068] px-4 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? '...' : t('actions.login')}
                </button>

                {/* <button
                  className="w-full rounded-xl bg-[#F7F9FB] border border-[#D1D5DB] px-4 py-3.5 text-[15px] font-normal text-[#5B6068] transition hover:bg-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={() => router.push('/register')}
                  type="button"
                >
                  {t('actions.registrationAccount')}
                </button> */}
              </div>
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="bg-white px-4 font-medium text-[#6A717F]">
                  {t('divider')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[14px] font-semibold text-[#191919] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
                onClick={() => void handleOAuth(googleProvider)}
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('actions.google')}
              </button>
              
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[14px] font-semibold text-[#191919] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
                onClick={() => void handleOAuth(appleProvider)}
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.365 21.436c-1.309.924-2.645.894-3.955.084-1.327-.811-2.66-.826-3.989 0-1.282.811-2.584.869-3.847-.042C.641 18.252-1.293 11.545 1.341 6.84c1.233-2.193 3.08-3.456 5.312-3.486 1.48-.03 2.822.84 4.013.84 1.13 0 2.66-1.021 4.31-.87 1.83.15 3.344.871 4.341 2.373-3.791 2.221-3.14 7.234.615 8.766-1.127 3.036-2.507 5.795-3.567 6.973zm-3.83-16.71c.06-1.892 1.481-3.664 3.421-4.084.346 2.052-1.05 4.024-3.361 4.144h-.06z"/>
                </svg>
                {t('actions.apple')}
              </button>
            </div>
          </div>
        ) : null}

        {view === 'success' ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F9ED] text-[#21C45D]">
              <BadgeCheck aria-hidden="true" className="h-10 w-10" />
            </div>

            <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
              {t('states.successTitle')}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              {t('states.successBody', {
                seconds: countdown ?? REDIRECT_SECONDS
              })}
            </p>

            {signedInEmail ? (
              <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
                {t('states.signedInAs', {email: signedInEmail})}
              </p>
            ) : null}

            <button
              className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
              onClick={goToDashboardNow}
              type="button"
            >
              {t('actions.openDashboard')}
            </button>
          </div>
        ) : null}

        {view === 'verify-pending' ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF5E5] text-[#EBCE01]">
              <Clock3 aria-hidden="true" className="h-10 w-10" />
            </div>

            <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
              {t('states.verifyPendingTitle')}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              {t('states.verifyPendingBody', {email: signedInEmail})}
            </p>

            {signedInEmail ? (
              <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
                {t('states.signedInAs', {email: signedInEmail})}
              </p>
            ) : null}

            {errorMessage ? (
              <p
                className="mt-4 rounded-[18px] bg-[#FFF4ED] px-4 py-3 text-[14px] font-medium text-[#FF5C01]"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                className="w-full rounded-xl bg-[#FF5C01] px-4 py-3.5 text-[14px] font-bold text-white transition hover:bg-[#E15100]"
                disabled={isLoading}
                onClick={() => void handleCheckVerification()}
                type="button"
              >
                {t('actions.checkVerification')}
              </button>

              <button
                className="inline-flex items-center justify-center rounded-[18px] border border-[#E6EAF0] px-4 py-3.5 text-[14px] font-medium text-[#191919] transition hover:bg-[#F7F9FB] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={() => void handleResendVerification()}
                type="button"
              >
                {t('actions.resendVerification')}
              </button>
            </div>
          </div>
        ) : null}

        {view === 'verify-success' ? (
          <div className="px-6 py-10 text-center sm:px-8">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F9ED] text-[#21C45D]">
              <BadgeCheck aria-hidden="true" className="h-10 w-10" />
            </div>

            <h3 className="mt-6 text-[28px] font-bold text-[#191919]">
              {t('states.verifySuccessTitle')}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              {t('states.verifySuccessBody', {
                seconds: countdown ?? REDIRECT_SECONDS
              })}
            </p>

            {signedInEmail ? (
              <p className="mx-auto mt-5 max-w-[360px] rounded-[18px] bg-[#F7F9FB] px-4 py-3 text-[14px] font-medium text-[#5B6068]">
                {t('states.signedInAs', {email: signedInEmail})}
              </p>
            ) : null}

            <button
              className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
              onClick={goToDashboardNow}
              type="button"
            >
              {t('actions.openDashboard')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}