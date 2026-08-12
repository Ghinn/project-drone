'use client';

import {
  useEffect,
  useState,
  useRef
} from 'react';
import { BadgeCheck, X, AlertCircle, Loader2, Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type VerificationView =
  | 'verify-pending'
  | 'loading'
  | 'error'
  | 'success';

export function VerificationModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = useTranslations('VerificationModal');

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [view, setView] = useState<VerificationView>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State untuk Validasi Email onBlur
  const [countdown, setCountdown] = useState<number | null>(null);
  const [verifiedPendingEmail, setVerifiedPendingEmail] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  const hasFetched = useRef(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (pathname === '/verify-pending') {
      setIsModalVisible(true);
      setView('verify-pending');
      if (emailParam) setVerifiedPendingEmail(emailParam);
      setCountdown(10);
    } else if (token) {
      setIsModalVisible(true);
      setView('loading');
    }
  }, [pathname, searchParams, token]);

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
    if (view !== 'loading' || !token) return;

    if (hasFetched.current) return;
    hasFetched.current = true;

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t('errors.unknown'));
        }

        if (data.email) {
            setVerifiedEmail(data.email);
        }

        setView('success');
        setCountdown(10);
      } catch (error: any) {
        setView('error');
        setErrorMessage(error.message);
      }
    };

    verifyToken();
  }, [token, view, t]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setIsModalVisible(false);

      if (pathname === '/verify-pending') {
        window.open('https://mail.google.com/', '_blank');
        router.replace('/');
      } else {
        router.replace('/monitoringFarmer');
      }
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setCountdown((current) => (current === null ? null : current - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [countdown, router]);

  function closeModal() {
    setIsModalVisible(false);
    router.replace('/');
  }

  function goToDashboardNow() {
    setIsModalVisible(false);
    router.replace('/monitoringFarmer');
  }

  if (!isModalVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all" role="dialog">
        <button
          aria-label={t('actions.close')}
          className="absolute right-4 top-4 rounded-full p-2 text-[#6A717F] transition hover:bg-neutral-100 hover:text-[#191919]"
          onClick={closeModal}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="px-8 py-12 text-center">
          {view === 'verify-pending' ? (
            <>
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF5E5] text-[#EBCE01]">
                <Clock3 aria-hidden="true" className="h-10 w-10" />
              </div>
              
              <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
                {t('states.verifyTitle')}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
                {t('states.verifyBody', { 
                  email: verifiedPendingEmail, 
                  seconds: countdown ?? 10 
                })}
              </p>

              {verifiedPendingEmail ? (
                <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
                  {t('states.verifyPendingBody')}
                </p>
              ) : null}
            </>
          ) : null}

          {view === 'loading' ? (
            <>
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6A717F]">
                <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
              </div>
              
              <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
                {t('states.verifyingTitle')}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
                {t('states.verifyingBody', { email: verifiedEmail || verifiedPendingEmail || 'Anda' })}
              </p>
            </>
          ) : null}

          {view === 'error' ? (
            <>
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle aria-hidden="true" className="h-10 w-10" />
              </div>

              <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
                {t('states.errorTitle')}
              </h3>
              
              <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
                {errorMessage}
              </p>

              <button
                className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
                onClick={closeModal}
                type="button"
              >
                {t('actions.backToHome')}
              </button>
            </>
          ) : null}

          {view === 'success' ? (
            <>
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F9ED] text-[#21C45D]">
                <BadgeCheck aria-hidden="true" className="h-10 w-10" />
              </div>

              <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
                {t('states.successTitle')}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
                {t('states.successBody', { seconds: countdown ?? 10 })}
              </p>

              {verifiedEmail ? (
                <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
                  {t('states.signedInAs', { email: verifiedEmail })}
                </p>
              ) : null}

              <button
                className="mt-8 inline-flex w-full items-center justify-center rounded-[18px] bg-[#5B6068] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#23272E]"
                onClick={goToDashboardNow}
                type="button"
              >
                {t('actions.openDashboard')}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}