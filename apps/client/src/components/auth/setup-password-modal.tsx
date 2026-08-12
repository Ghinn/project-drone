'use client';

import {
  useEffect,
  useState,
  type FormEvent
} from 'react';
import { BadgeCheck, X, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type SetupPasswordView =
  | 'form'
  | 'success';

export function SetupPasswordModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = useTranslations('SetupPasswordModal'); 

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [view, setView] = useState<SetupPasswordView>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === '/setup-password') {
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

  async function handleSetupPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrorMessage('Token tidak valid atau tidak ditemukan pada URL.');
      return;
    }

    if (passwordScore < 3) {
      setErrorMessage(t('errors.weakPassword'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('errors.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resetRes = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, newPassword: password }),
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
    router.replace('/');
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

            <form className="mt-6 space-y-4" onSubmit={handleSetupPasswordSubmit}>
              {/* INPUT CREATE PASSWORD */}
              <div>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-[15px] text-[#191919] transition placeholder:text-[#6A717F] focus:border-[#023337] focus:outline-none focus:ring-1 focus:ring-[#023337]"
                    disabled={isLoading}
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
                    disabled={isLoading}
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
              {t('actions.backToHome')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}