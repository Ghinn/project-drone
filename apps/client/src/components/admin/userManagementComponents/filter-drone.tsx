"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Filter, Search } from "lucide-react";

interface Drone {
  id: string;
  name: string;
}

interface FilterDroneProps {
  drones: Drone[];
  value: string | null;
  onChange: (droneId: string | null) => void;
}

export default function FilterDrone({
  drones,
  value,
  onChange,
}: FilterDroneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDrone = drones.find((drone) => drone.id === value);

  const filteredDrones = drones.filter((drone) =>
    drone.name.toLowerCase().includes(search.toLowerCase()),
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

  const handleSelect = (droneId: string | null) => {
    onChange(droneId);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2.5 border rounded-xl bg-white dark:bg-[#16161a] transition-colors ${value ? "border-[#84994F] text-[#84994F] bg-[#84994F]/5" : "border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:text-[#191919] dark:hover:text-white"}`}
        title="Filter drone"
      >
        <Filter className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xl dark:border-zinc-800 dark:bg-[#16161a]">
          <div className="border-b border-[#E5E7EB] p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#191919] dark:text-white">
                  Filter Drone
                </p>
                <p className="mt-0.5 text-[11px] text-[#6A717F]">
                  Tampilkan pengguna berdasarkan drone
                </p>
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="text-[11px] font-semibold text-[#84994F] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari drone..."
                className="w-full rounded-lg bg-gray-100 py-2 pl-8 pr-3 text-xs text-gray-700 outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-[#84994F] dark:bg-[#202024] dark:text-zinc-200"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto px-2 pb-2">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${!value ? "bg-[#84994F]/10 font-semibold text-[#84994F]" : "text-[#5B6068] hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
            >
              <span>Semua Drone</span>
              {!value && <Check className="h-4 w-4" />}
            </button>

            {filteredDrones.length > 0 ? (
              filteredDrones.map((drone) => {
                const isSelected = drone.id === value;

                return (
                  <button
                    key={drone.id}
                    type="button"
                    onClick={() => handleSelect(drone.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${isSelected ? "bg-[#84994F]/10 font-semibold text-[#84994F]" : "text-[#5B6068] hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                  >
                    <span className="truncate">{drone.name}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-zinc-500">
                Drone tidak ditemukan
              </div>
            )}
          </div>

          {selectedDrone && (
            <div className="border-t border-[#E5E7EB] px-3 py-2.5 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#84994F]" />
                <span className="text-[#6A717F]">Filter:</span>
                <span className="truncate font-semibold text-[#191919] dark:text-zinc-200">
                  {selectedDrone.name}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
