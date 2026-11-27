"use client";

import React from "react";
import Image from "next/image";
import type { NDVIPredictionResult } from "@/types/mapir";

interface PredictionCardProps {
  data: NDVIPredictionResult;
  title?: string;
  originalJpgUrl?: string | null;
  originalRawUrl?: string | null;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  data,
  title = "Hasil Capture Terbaru",
  originalJpgUrl,
  originalRawUrl,
}) => {
  const isSehat = data.classification === "Sehat";
  const confidencePercent = (data.predictionScore * 100).toFixed(1);
  const jpgUrl = originalJpgUrl || data.snapshotThumbnail;

  return (
    <div
      className="bg-white dark:bg-[#111] rounded-2xl border border-[#ECECF2] dark:border-[#222] overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
    >
      <div className="px-5 py-4 border-b border-[#F0F0F3] dark:border-[#222]">
        <h2 className="text-sm font-semibold text-[#1C1D21] dark:text-gray-100">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-[#8181A5]">{data.filename}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F0F0F3] dark:divide-[#222]">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1C1D21] dark:text-gray-100">
              Hasil Capture JPG
            </span>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <a
                href={data.snapshotThumbnail}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-[#ECECF2] px-2.5 py-1 text-[11px] text-[#8181A5] transition-colors hover:text-[#6B8E23] dark:border-[#2a2a2a] dark:text-gray-400 dark:hover:text-[#a3e635]"
              >
                Lihat JPG 720
              </a>
              <a
                href={jpgUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-[#ECECF2] px-2.5 py-1 text-[11px] text-[#8181A5] transition-colors hover:text-[#6B8E23] dark:border-[#2a2a2a] dark:text-gray-400 dark:hover:text-[#a3e635]"
              >
                Unduh JPG
              </a>
              {originalRawUrl && (
                <a
                  href={originalRawUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-[#ECECF2] px-2.5 py-1 text-[11px] text-[#8181A5] transition-colors hover:text-[#6B8E23] dark:border-[#2a2a2a] dark:text-gray-400 dark:hover:text-[#a3e635]"
                >
                  Unduh RAW
                </a>
              )}
            </div>
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#0F172A]">
            <Image
              src={jpgUrl}
              alt="Hasil Capture JPG MAPIR"
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

      <section className="border-t border-[#F0F0F3] dark:border-[#222]">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <h3 className="text-xs font-semibold text-[#1C1D21] dark:text-gray-100">
            Visual NDVI
          </h3>
          {data.snapshotNDVI && (
            <a
              href={data.snapshotNDVI}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-[#ECECF2] px-2.5 py-1 text-[11px] text-[#8181A5] transition-colors hover:text-[#6B8E23] dark:border-[#2a2a2a] dark:text-gray-400 dark:hover:text-[#a3e635]"
            >
              Unduh PNG
            </a>
          )}
        </div>
        <div className="px-5 pb-5">
          {data.snapshotNDVI ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#ECECF2] dark:border-[#2a2a2a] bg-[#0F172A]">
              <Image
                src={data.snapshotNDVI}
                alt="Visual NDVI"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-[#8181A5]">Visual NDVI tidak tersedia.</p>
          )}
        </div>
      </section>
    </div>
  );
};
