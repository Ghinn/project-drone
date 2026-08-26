"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";

export type SortOrder = "newest" | "oldest";

interface SortDateDropdownProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}

export default function SortDateDropdown({
  value,
  onChange,
}: SortDateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (sortOrder: SortOrder) => {
    onChange(sortOrder);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2.5 border rounded-xl bg-white dark:bg-[#16161a] transition-colors ${isOpen ? "border-[#84994F] text-[#84994F]" : "border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:text-[#191919] dark:hover:text-white"}`}
        title="Urutkan tanggal masuk"
      >
        <ArrowUpDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl dark:border-zinc-800 dark:bg-[#16161a]">
          <div className="border-b border-[#E5E7EB] px-3 py-2.5 dark:border-zinc-800">
            <p className="text-xs font-bold text-[#191919] dark:text-white">
              Urutkan Tanggal Masuk
            </p>
            <p className="mt-0.5 text-[11px] text-[#6A717F]">
              Atur urutan pengguna
            </p>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => handleSelect("newest")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${value === "newest" ? "bg-[#84994F]/10 font-semibold text-[#84994F]" : "text-[#5B6068] hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
            >
              <span>Terbaru</span>
              {value === "newest" && <Check className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelect("oldest")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${value === "oldest" ? "bg-[#84994F]/10 font-semibold text-[#84994F]" : "text-[#5B6068] hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
            >
              <span>Terlama</span>
              {value === "oldest" && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
