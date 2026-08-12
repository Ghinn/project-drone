"use client";
import { useState } from 'react';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

export default function SettingsSection() {
  const [sprayRate, setSprayRate] = useState(15);
  const [aiSensitivity, setAiSensitivity] = useState(80);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-sm p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
        <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
          Sprayer Calibration &amp; Rate
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Adjust automated spraying dosage per target (ml/second)
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>Flow Rate (ml/s)</span>
            <span style={{ color: DRONE_TOKENS.greenLight }}>{sprayRate} ml/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={sprayRate}
            onChange={e => setSprayRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-[#84994F]"
          />
        </div>
      </div>

      <div className="rounded-sm p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
        <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
          AI Detection Threshold
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Minimum model confidence score required before flagging a BSR infection
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>Confidence Threshold</span>
            <span style={{ color: DRONE_TOKENS.amber }}>{aiSensitivity}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={aiSensitivity}
            onChange={e => setAiSensitivity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-[#FCB53B]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => alert('Operator settings updated successfully!')}
          className="px-6 py-2.5 rounded-sm text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: DRONE_TOKENS.green }}
        >
          Save Configurations
        </button>
      </div>
    </div>
  );
}