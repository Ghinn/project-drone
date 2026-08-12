'use client';

import {
  useEffect,
  useState,
  type FormEvent
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {Clock3, X, Eye, EyeOff} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';

type RegistrationView =
  | 'form'
  | 'verify-pending';

  export function RegistrationModal() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('RegistrationModal');
  
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [view, setView] = useState<RegistrationView>('form');
  const [email, setEmail] = useState('');
  const [registeredInEmail, setRegistereddEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk Validasi Email onBlur
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // States untuk fitur reCAPTCHA & Terms
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (pathname === '/register') {
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

  // Validasi Ketidakcocokan Kata Sandi
  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setConfirmPasswordError(t('errors.passwordMismatch'));
      } else {
        setConfirmPasswordError(null);
      }
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword, t]);

  // Validasi Penilaian Kekuatan Kata Sandi
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1; // Minimal standar Firebase
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // Max 5
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const getStrengthTextColor = (score: number) => {
    if (score <= 2) return 'text-red-500';
    if (score <= 3) return 'text-yellow-600';
    return 'text-green-500';
  };
  const getStrengthText = (score: number) => {
    if (score === 0) return '';
    if (score <= 2) return t('errors.weakPassword');
    if (score <= 3) return t('errors.mediumPassword');
    return t('errors.strongPassword');
  };

  const passwordScore = evaluatePasswordStrength(password);
  const confirmPasswordScore = evaluatePasswordStrength(confirmPassword);

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (emailError) return;

    if (passwordScore < 3) {
      setErrorMessage(t('errors.weakPassword'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('errors.passwordMismatch'));
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(t('errors.termsNotAccepted'));
      return;
    }

    if (!recaptchaToken) {
      setErrorMessage(t('errors.invalidCaptcha'));
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

      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || t('errors.unknown'));
      }
      
      // Jika berhasil, alihkan ke tampilan sukses/pending
      setRegistereddEmail(email);
      setView('verify-pending');
    } catch (error: any) {
      setErrorMessage(error.message || t('errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  }

  function closeModal() {
    setIsModalVisible(false);
    router.replace('/');
  }

  function switchToLogin() {
    router.replace('/login');
  }

  function goToVerificationNow() {
    setIsModalVisible(false);
    router.replace(`/verify-pending?email=${encodeURIComponent(registeredInEmail)}`);
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

              {/* INPUT CREATE PASSWORD */}
              <div>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading}
                    placeholder={t('placeholders.createPassword')}
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

                {password && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <div className="flex h-1.5 flex-1 gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 1 ? getStrengthColor(passwordScore) : 'bg-gray-200'}`}></div>
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 3 ? getStrengthColor(passwordScore) : 'bg-gray-200'}`}></div>
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 5 ? getStrengthColor(passwordScore) : 'bg-gray-200'}`}></div>
                    </div>
                    <span className={`text-[11px] font-semibold ${getStrengthTextColor(passwordScore)}`}>{getStrengthText(passwordScore)}</span>
                  </div>
                )}
              </div>

              {/* INPUT CONFIRM CREATE PASSWORD */}
              <div>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading}
                    placeholder={t('placeholders.confirmPassword')}
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A717F] hover:text-[#191919]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {confirmPasswordError ? (
                  <p className="mt-1.5 px-1 text-[12px] font-medium text-red-500">
                    {confirmPasswordError}
                  </p>
                ) : confirmPassword ? (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <div className="flex h-1.5 flex-1 gap-1">
                      <div className={`h-full flex-1 rounded-full ${confirmPasswordScore >= 1 ? getStrengthColor(confirmPasswordScore) : 'bg-gray-200'}`}></div>
                      <div className={`h-full flex-1 rounded-full ${confirmPasswordScore >= 3 ? getStrengthColor(confirmPasswordScore) : 'bg-gray-200'}`}></div>
                      <div className={`h-full flex-1 rounded-full ${confirmPasswordScore >= 5 ? getStrengthColor(confirmPasswordScore) : 'bg-gray-200'}`}></div>
                    </div>
                    <span className={`text-[11px] font-semibold ${getStrengthTextColor(confirmPasswordScore)}`}>{getStrengthText(confirmPasswordScore)}</span>
                  </div>
                ) : null}
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
                  {t('terms')}
                </span>
              </label>

              {/* ACTION BUTTONS: SIGN UP & SWITCH TO SIGN IN */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  className="w-full rounded-xl bg-[#5B6068] px-4 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? '...' : t('actions.register')}
                </button>

                <button
                  className="w-full rounded-xl bg-[#F7F9FB] border border-[#D1D5DB] px-4 py-3.5 text-[15px] font-normal text-[#5B6068] transition hover:bg-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={switchToLogin}
                  type="button"
                >
                  {t('actions.loginAccount')}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {view === 'verify-pending' ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF5E5] text-[#EBCE01]">
              <Clock3 aria-hidden="true" className="h-10 w-10" />
            </div>

            <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
              {t('states.verifyTitle')}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              {t('states.verifyBody', { email: registeredInEmail })}
            </p>
            
            {registeredInEmail ? (
              <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
              {t('states.verifyPendingBody', { email: registeredInEmail })}
            </p>
            ): null}
            
            <button
              className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
              onClick={goToVerificationNow}
              type="button"
            >
              {t('actions.checkVerification')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}