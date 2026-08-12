import { Suspense } from 'react';
import { SetupPasswordModal } from '@/components/auth/setup-password-modal';

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FB] p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SetupPasswordModal />
      </Suspense>
    </main>
  );
}