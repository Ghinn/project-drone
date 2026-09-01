"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchableDropdownProps<T> {
  options: T[];
  value: string | null;
  onChange: (value: string) => void;

  placeholder?: string;
  searchPlaceholder?: string;

  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;

  disabled?: boolean;
  placement?: "bottom" | "top"; 
}

export default function SearchableDropdown<T>({
  options,
  value,
  onChange,

  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",

  getOptionLabel,
  getOptionValue,

  disabled = false,
  placement = "bottom",
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (option) => getOptionValue(option) === value,
  );

  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleSelect = (option: T) => {
    onChange(getOptionValue(option));

    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium outline-none transition-colors bg-gray-100 border-gray-200 text-gray-700 dark:bg-[#202024] dark:border-zinc-800 dark:text-zinc-300 hover:border-[#8FA64A] disabled:opacity-50 disabled:cursor-not-allowed ${isOpen ? "border-[#8FA64A]" : ""}`}
      >
        <span className={`flex-1 text-center pl-4 ${selectedOption ? "truncate" : "text-zinc-500"}`}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <svg
          className={`w-4 h-4 shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute w-full z-50 left-0 right-0 mt-1 overflow-hidden rounded-lg border shadow-xl bg-white border-gray-200 dark:bg-[#202024] dark:border-zinc-800 flex
          ${placement === "top" ? "bottom-full mb-1 flex-col-reverse" : "top-full mt-1 flex-col"}`}
        >
          <div
            className={`p-2 border-gray-200 dark:border-zinc-800 ${placement === "top" ? "border-t" : "border-b"}`}
          >
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 rounded-md text-xs outline-none bg-gray-100 text-gray-700 dark:bg-[#18181b] dark:text-zinc-200 placeholder:text-zinc-500 focus:ring-1 focus:ring-[#8FA64A]"
              />
            </div>
          </div>

          <div className="max-h-[72px] overflow-y-auto p-1">
            {search.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-zinc-500">
                  Ketik nama untuk mencari...
                </p>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = optionValue === value;

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left text-xs transition-colors hover:bg-[#8FA64A]/10 dark:text-zinc-300 ${isSelected ? "bg-[#8FA64A]/10 text-[#8FA64A]" : ""}`}
                  >
                    <span className="truncate flex-1">{optionLabel}</span>

                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-zinc-500">
                  Tidak ada data ditemukan
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
