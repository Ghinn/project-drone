"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown, Globe, Sun, Moon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { type AppLocale } from "@/i18n/config";
import { useAuth } from "@/providers/auth-provider";
import { DRONE_TOKENS } from "./monitoringOperator-types";

export default function UserProfileDropdown() {
  const router = useRouter();
  const { signOutApp } = useAuth();
  const locale = useLocale() as AppLocale;
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

  const handleLocaleChange = async (nextLocale: AppLocale) => {
    if (nextLocale === locale || pendingLocale !== null) return;
    try {
      setPendingLocale(nextLocale);
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!res.ok) throw new Error("Failed to update locale");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingLocale(null);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      try {
        await signOutApp();
        router.push("/");
      } catch (err) {
        console.error("Logout error:", err);
        router.push("/");
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative md:border-l border-gray-200 dark:border-[#1e1e1e] md:pl-3">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer outline-none rounded-xl p-1 sm:p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-900"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-xs"
          style={{ background: DRONE_TOKENS.green }}
        >
          RA
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100">
            Researcher
          </p>
          <p className="text-[10px] leading-tight text-gray-500 dark:text-gray-400 mt-0.5">
            Operator / Teknisi
          </p>
        </div>
        <ChevronDown
          className={`hidden sm:block w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 z-50 rounded-xl border border-gray-200 dark:border-[#1e1e1e] bg-white dark:bg-[#16161a] shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-[#1e1e1e]">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Researcher
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
              Operator / Teknisi
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-[#1e1e1e] p-1.5 md:hidden">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                ) : (
                  <Sun className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Tema</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    {isDarkMode ? "Mode Gelap" : "Mode Terang"}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-gray-200/80 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    !isDarkMode
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Mode Terang"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    isDarkMode
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Mode Gelap"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* LANGUAGE TOGGLE */}
          <div className="border-t border-gray-200 dark:border-[#1e1e1e] p-1.5">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Bahasa</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    {locale === "id" ? "Indonesia" : "English"}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-gray-200/80 dark:border-zinc-700/60">
                <button
                  type="button"
                  disabled={pendingLocale !== null}
                  onClick={() => void handleLocaleChange("id")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                    locale === "id"
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  } ${pendingLocale === "id" ? "opacity-50" : ""}`}
                  title="Bahasa Indonesia"
                >
                  <span aria-hidden="true">🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  disabled={pendingLocale !== null}
                  onClick={() => void handleLocaleChange("en")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                    locale === "en"
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  } ${pendingLocale === "en" ? "opacity-50" : ""}`}
                  title="English"
                >
                  <span aria-hidden="true">🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-[#1e1e1e] p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Logout</p>
                <p className="text-[10px] text-red-400">Keluar dari akun</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}