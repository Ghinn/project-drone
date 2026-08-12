'use client';

import {
  useEffect,
  useState,
  type FormEvent
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { BadgeCheck, X, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

type ForgotPasswordView =
  | 'form'
  | 'success';

export function ForgotPasswordModal() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('ForgotPasswordModal'); 

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [view, setView] = useState<ForgotPasswordView>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // State untuk Validasi Email onBlur
  const [emailError, setEmailError] = useState<string | null>(null);

  // States untuk fitur reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // State untuk Send Code
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (pathname === '/forgot-password') {
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
    if (otpCooldown > 0) {
      const timerId = window.setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => window.clearTimeout(timerId);
    }
  }, [otpCooldown]);

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
    if (pass.length >= 6) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; 
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

  async function handleSendCode() {
    if (!email || emailError) {
      setErrorMessage(t('errors.invalidEmail'));
      return;
    }

    setIsSendingCode(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('errors.unknown'));
      }

      setIsOtpSent(true);
      setOtpCooldown(60);
    } catch (error: any) {
      setErrorMessage(error.message || t('errors.unknown'));
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleForgotPasswordSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (!confirmationCode) {
      setErrorMessage(t('errors.missingCode'));
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

      const resetRes = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: confirmationCode, newPassword: password }),
      });

      const resetData = await resetRes.json();

      if (!resetRes.ok) {
        throw new Error(resetData.error || t('errors.unknown'));
      }

      setView('success');
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
          disabled={isLoading || isSendingCode}
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

            <form className="mt-6 space-y-4" onSubmit={handleForgotPasswordSubmit}>
              
              {/* INPUT EMAIL */}
              <div>
                <input
                  autoComplete="email"
                  className={`w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#D1D5DB] focus:border-[#023337] focus:ring-[#023337]'} outline-none transition placeholder:text-[#6A717F] focus:ring-1`}
                  disabled={isLoading || isSendingCode}
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

              {/* INPUT NEW PASSWORD */}
              <div>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading || isSendingCode}
                    placeholder={t('placeholders.newPassword')}
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

              {/* INPUT CONFIRM NEW PASSWORD */}
              <div>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading || isSendingCode}
                    placeholder={t('placeholders.confirmNewPassword')}
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

              {/* INPUT CONFIRMATION CODE & BUTTON SEND CODE */}
              <div>
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading || isSendingCode}
                    placeholder={t('placeholders.confirmationCode')}
                    required
                    type="text"
                    value={confirmationCode}
                    onChange={(event) => setConfirmationCode(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || !!emailError || !email || otpCooldown > 0 }
                    className="rounded-xl bg-[#5B6068] border border-[#D1D5DB] px-5 py-3 text-[15px] font-bold text-white transition hover:bg-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSendingCode 
                      ? '...' 
                      : otpCooldown > 0 
                        ? `${t('actions.sendCode')} (${otpCooldown}s)` 
                        : t('actions.sendCode')
                    }
                  </button>
                </div>

                {isOtpSent && otpCooldown > 0 && (
                   <p className="mt-2 px-1 text-[13px] font-medium text-green-600">
                     Kode OTP telah dikirim ke email Anda!
                   </p>
                )}

              </div>

              {/* ACTION BUTTON: SUBMIT */}
              <div className="flex flex-col pt-3">
                <button
                  className="w-full rounded-xl bg-[#5B6068] px-4 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? '...' : t('actions.submit')}
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
              {t('states.successTitle')}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
              {t('states.successBody')}
            </p>

            <button
              className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
              onClick={switchToLogin}
              type="button"
            >
              {t('states.backToLogin')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}