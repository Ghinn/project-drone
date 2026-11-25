"use client";

import React from "react";

interface CameraPreviewProps {
  onTriggerCapture: () => void;
  loading: boolean;
  statusText: string;
  isCameraReady: boolean;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  onTriggerCapture,
  loading,
  statusText,
  isCameraReady,
}) => {
  const streamUrl =
    process.env.NEXT_PUBLIC_MAPIR_STREAM_URL ||
    "https://stream.dreampalm.id/dreampalm/";

  const statusLabel = loading
    ? "Capture"
    : isCameraReady
      ? "MAPIR Ready"
      : "Offline";

  return (
    <div
      className="bg-white rounded-2xl border border-[#ECECF2]"
      style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
    >
      <div className="px-5 py-4 border-b border-[#F0F0F3] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-[#6B8E23] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span className="text-sm font-semibold text-[#1C1D21]">
            Live Camera MAPIR
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            loading
              ? "bg-[#F5F5FA] text-[#8181A5] border border-[#ECECF2]"
              : isCameraReady
                ? "bg-[#F0F7E6] text-[#6B8E23] border border-[#6B8E23]/20"
                : "bg-[#FDF2F0] text-[#C8553D] border border-[#C8553D]/20"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              loading
                ? "bg-[#8181A5]"
                : isCameraReady
                  ? "bg-[#6B8E23] animate-pulse"
                  : "bg-[#C8553D]"
            }`}
          />
          {statusLabel}
        </div>
      </div>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl bg-[#0F172A] aspect-video">
          <iframe
            src={streamUrl}
            title="MAPIR Live Preview"
            allow="autoplay; fullscreen"
            className="w-full h-full border-0 pointer-events-none"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/50 text-[10px] font-semibold text-white/90 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            Live
          </div>

          {loading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0F172A]/75"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-xl border border-white/10 bg-[#1C1D21]/90 text-white text-center max-w-xs">
                <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#6B8E23] animate-spin" />
                <div>
                  <p className="text-sm font-semibold">
                    {statusText.includes("Memotret") ||
                    statusText.includes("trigger") ||
                    statusText.includes("kamera")
                      ? "Mengambil Foto..."
                      : "Memproses Analisis..."}
                  </p>
                  {statusText && (
                    <p className="mt-0.5 text-xs text-white/70">{statusText}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onTriggerCapture}
          disabled={loading || !isCameraReady}
          className="mt-4 w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-[#6B8E23] hover:bg-[#5a7a1c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                aria-hidden="true"
              />
              Memproses...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19 4h-3.5l-1.8-2.4c-.4-.5-1-.6-1.7-.6H12c-.7 0-1.3.1-1.7.6L8.5 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
              </svg>
              Ambil Foto &amp; Analisis
            </>
          )}
        </button>

        {!isCameraReady && !loading && (
          <p className="mt-2 text-center text-xs text-[#C8553D]">
            Kamera offline — periksa koneksi MAPIR.
          </p>
        )}
      </div>
    </div>
  );
};
