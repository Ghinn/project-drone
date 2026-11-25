"use client";

import React from "react";
import Image from "next/image";
import type { NDVIPredictionResult } from "@/types/mapir";

interface PredictionCardProps {
  data: NDVIPredictionResult;
  originalJpgUrl?: string | null;
  originalRawUrl?: string | null;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  data,
  originalJpgUrl,
  originalRawUrl,
}) => {
  const isSehat = data.classification === "Sehat";
  const confidencePercent = (data.predictionScore * 100).toFixed(1);

  return (
    <div
      className="bg-white dark:bg-[#111] rounded-2xl border border-[#ECECF2] dark:border-[#222] overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
    >
      <div className="px-5 py-4 border-b border-[#F0F0F3] dark:border-[#222]">
        <h2 className="text-sm font-semibold text-[#1C1D21] dark:text-gray-100">
          Hasil Capture Terbaru
        </h2>
        <p className="mt-0.5 text-xs text-[#8181A5]">{data.filename}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F0F0F3] dark:divide-[#222]">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1C1D21] dark:text-gray-100">
              Foto Hasil Capture
            </span>
            <div className="flex items-center gap-3">
              {originalJpgUrl && (
                <a
                  href={originalJpgUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8181A5] hover:text-[#6B8E23] dark:text-gray-400 dark:hover:text-[#a3e635] transition-colors"
                >
                  Unduh JPG
                </a>
              )}
              {originalRawUrl && (
                <a
                  href={originalRawUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8181A5] hover:text-[#6B8E23] dark:text-gray-400 dark:hover:text-[#a3e635] transition-colors"
                >
                  Unduh RAW
                </a>
              )}
            </div>
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#0F172A]">
            <Image
              src={data.snapshotThumbnail}
              alt="Foto Hasil Capture MAPIR"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <span className="text-xs font-semibold text-[#1C1D21] dark:text-gray-100">
            Hasil Analisis
          </span>

          <div className="p-4 rounded-xl border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#F6F6F6] dark:bg-[#181818]">
            <p className="text-xs uppercase tracking-wide font-semibold text-[#8181A5] mb-2">
              Klasifikasi CNN
            </p>
            <p
              className={`text-3xl font-bold tracking-tight ${
                isSehat ? "text-[#6B8E23] dark:text-[#a3e635]" : "text-[#C8553D] dark:text-[#f87171]"
              }`}
            >
              {data.classification}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#F6F6F6] dark:bg-[#181818]">
            <p className="text-xs uppercase tracking-wide font-semibold text-[#8181A5] mb-2">
              Skor Prediksi CNN
            </p>
            <p className="text-3xl font-bold text-[#1C1D21] dark:text-gray-100 tracking-tight">
              {confidencePercent}%
            </p>

            <div className="mt-2.5 w-full h-1 bg-[#ECECF2] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B8E23] rounded-full"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#F6F6F6] dark:bg-[#181818]">
            <p className="text-xs uppercase tracking-wide font-semibold text-[#8181A5] mb-2">
              Nilai NDVI
            </p>
            <p className="text-3xl font-bold text-[#1C1D21] dark:text-gray-100 tracking-tight font-mono">
              {data.ndvi !== null && !Number.isNaN(data.ndvi)
                ? data.ndvi.toFixed(4)
                : "N/A"}
            </p>
            <p className="mt-1.5 text-xs text-[#8181A5]">
              Informasi vegetasi tambahan.
            </p>
          </div>
        </div>
      </div>

      <details className="border-t border-[#F0F0F3] dark:border-[#222] group">
        <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none list-none text-xs text-[#8181A5] hover:text-[#1C1D21] dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
          <span className="font-medium">Visual NDVI</span>
          <span className="flex items-center gap-1 text-[11px] text-[#8181A5]">
            Visualisasi tambahan
            <svg
              className="w-3.5 h-3.5 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </summary>
        <div className="px-5 pb-5 pt-2">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#0F172A]">
            <Image
              src={data.snapshotNDVI}
              alt="Visual NDVI"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </details>
    </div>
  );
};
