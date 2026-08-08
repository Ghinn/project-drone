'use client';

import {
  useEffect,
  useState,
  type FormEvent
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {BadgeCheck, Clock3, X} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';

type RegistrationView =
  | 'form'
  | 'success'
  | 'verify-pending';

type RegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const REDIRECT_SECONDS = 5;

export function RegistrationModal({open, onOpenChange}: RegistrationModalProps) {
  const router = useRouter();
  const t = useTranslations('RegistrationModal');
  
  const [view, setView] = useState<RegistrationView>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State untuk Validasi Email onBlur
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // States untuk fitur reCAPTCHA & Terms
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  function resetState() {
    setView('form');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsLoading(false);
    setErrorMessage(null);
    setAcceptTerms(false);
    setRecaptchaToken(null);
  }

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (emailError) return;

    if (password !== confirmPassword) {
      setErrorMessage(t('errors.passwordMismatch') || 'Kata sandi tidak cocok.');
      return;
    }

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

    try {
      const captchaVerifyRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const captchaVerifyData = await captchaVerifyRes.json();

      if (!captchaVerifyData.success) {
        setErrorMessage(captchaVerifyData.message || t('errors.invalidCaptcha'));
        setIsLoading(false);
        return; 
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const registerRes = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || t('errors.unknown'));
      }
      
      // Jika berhasil, alihkan ke tampilan sukses/pending
      setView('success');
    } catch (error: any) {
      setErrorMessage(error.message || t('errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  }

  function closeModal() {
    onOpenChange(false);
  }

  function switchToLogin() {
    onOpenChange(false);
    router.push('/login'); // Sesuaikan rute menuju popup/laman login
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all"
        role="dialog"
      >
        <button
          aria-label={t('actions.close') || 'Close'}
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
                Create Account
              </h2>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-[14px] font-semibold text-red-600">
                {errorMessage}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleRegistrationSubmit}>
              {/* INPUT EMAIL */}
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
                    }
                  }}
                  placeholder={t('placeholders.email') || 'Email Address'}
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

              {/* INPUT CREATE PASSWORD */}
              <div>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                  disabled={isLoading}
                  placeholder={t('placeholders.createPassword') || 'Create Password'}
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {/* INPUT CONFIRM CREATE PASSWORD */}
              <div>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                  disabled={isLoading}
                  placeholder={t('placeholders.confirmPassword') || 'Confirm Create Password'}
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {/* RECAPTCHA SECTION */}
              <div className="flex justify-center py-2">
                <ReCAPTCHA
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
                  {t('terms') || 'I agree to the Terms of Service and Privacy Policy'}
                </span>
              </label>

              {/* ACTION BUTTONS: SIGN UP & SWITCH TO SIGN IN */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  className="w-full rounded-xl bg-[#5B6068] px-4 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? '...' : t('actions.signUp') || 'Sign Up'}
                </button>

                <button
                  className="w-full rounded-xl bg-[#F7F9FB] border border-[#D1D5DB] px-4 py-3.5 text-[15px] font-normal text-[#5B6068] transition hover:bg-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={switchToLogin}
                  type="button"
                >
                  {t('actions.loginAccount') || 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {view === 'success' ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F9ED] text-[#21C45D]">
              <BadgeCheck aria-hidden="true" className="h-10 w-10" />
            </div>

            <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
              Registration Successful
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              Your account has been created successfully. Please check your email to verify your account before signing in.
            </p>

            <button
              className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
              onClick={switchToLogin}
              type="button"
            >
              Back to Sign In
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}