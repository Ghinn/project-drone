import { Suspense } from 'react';
import { VerificationModal } from '@/components/auth/verification-modal';

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FB] p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerificationModal />
      </Suspense>
    </main>
  );
}