'use client';

import { Mail, X } from 'lucide-react';

type VerificationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null;
};

export function VerificationModal({ open, onOpenChange, email }: VerificationModalProps) {
  if (!open) return null;

  function openMailClient() {
    // Membuka tab baru yang mengarah ke provider email umum
    window.open('https://mail.google.com/', '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all" role="dialog">
        <button
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-full p-2 text-[#6A717F] transition hover:bg-neutral-100 hover:text-[#191919]"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="px-8 py-12 text-center">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F1F9] text-[#023337]">
            <Mail aria-hidden="true" className="h-10 w-10" />
          </div>

          <h3 className="mt-6 text-[22px] font-bold text-[#191919]">
            Periksa Kotak Masuk Anda
          </h3>

          <p className="mt-3 text-[15px] leading-7 text-[#5B6068]">
            Kami telah mengirimkan tautan verifikasi ke alamat email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun Anda.
          </p>

          {email ? (
            <p className="mx-auto mt-6 max-w-[360px] rounded-xl bg-[#F7F9FB] px-4 py-3 text-[14px] font-semibold text-[#191919]">
              {email}
            </p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              className="w-full rounded-xl bg-[#023337] px-4 py-3.5 text-[14px] font-bold text-white transition hover:bg-[#012225]"
              onClick={openMailClient}
              type="button"
            >
              Buka Email Saya
            </button>

            <button
              className="inline-flex items-center justify-center rounded-[18px] border border-[#E6EAF0] px-4 py-3.5 text-[14px] font-medium text-[#191919] transition hover:bg-[#F7F9FB]"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}