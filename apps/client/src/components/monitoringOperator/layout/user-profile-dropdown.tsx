"use client";
import { DRONE_TOKENS } from './monitoringOperator-types';

export default function UserProfileDropdown() {
  return (
    <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-[#1e1e1e]">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
        style={{ background: DRONE_TOKENS.green }}
      >
        RA
      </div>
      <div className="hidden md:block">
        <p className="text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100">
          Researcher
        </p>
        <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">
          Operator / Teknisi
        </p>
      </div>
    </div>
  );
}