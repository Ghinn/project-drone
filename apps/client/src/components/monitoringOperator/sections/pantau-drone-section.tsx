"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { 
  Battery, 
  Wifi, 
  AlertTriangle,
  RefreshCcw,
  ArrowUpDown,
  ArrowUp,
  MoveHorizontal,
  ArrowRight
} from 'lucide-react';
import DroneMap from './drone-map';
import { CameraPreview } from '../CameraPreview';
import { PredictionCard } from '../PredictionCard';
import type { MapirHealthResponse, NDVIPredictionResult } from '@/types/mapir';

// Helper untuk calculateDistance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radius bumi dalam meter
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPredictionResult = (value: unknown): value is NDVIPredictionResult => {
  if (!isJsonRecord(value) || !isJsonRecord(value.bands)) return false;

  const nullableNumbers = [value.bands.green, value.bands.red, value.bands.nir];
  return (
    value.success === true &&
    typeof value.filename === 'string' &&
    typeof value.modelName === 'string' &&
    typeof value.modelStatus === 'string' &&
    (value.classification === 'Sehat' || value.classification === 'Terserang') &&
    (value.classIndex === 0 || value.classIndex === 1) &&
    isFiniteNumber(value.scoreTerserang) &&
    isFiniteNumber(value.scoreSehat) &&
    isFiniteNumber(value.predictionScore) &&
    typeof value.scoreCalibrated === 'boolean' &&
    isFiniteNumber(value.threshold) &&
    (value.ndvi === null || isFiniteNumber(value.ndvi)) &&
    nullableNumbers.every((number) => number === null || isFiniteNumber(number)) &&
    isFiniteNumber(value.validPixelPercentage) &&
    Array.isArray(value.inputShape) &&
    value.inputShape.every(isFiniteNumber) &&
    typeof value.snapshotThumbnail === 'string' &&
    typeof value.snapshotNDVI === 'string' &&
    typeof value.radiometricMode === 'string' &&
    typeof value.radiometricValidated === 'boolean' &&
    isFiniteNumber(value.physicalCoverageTargetMeters) &&
    typeof value.physicalCoverageValidated === 'boolean' &&
    typeof value.automaticSprayingAllowed === 'boolean'
  );
};

const getResponseDetail = (value: unknown, fallback: string) =>
  isJsonRecord(value) && typeof value.detail === 'string'
    ? value.detail
    : fallback;

export default function PantauDroneSection() {
  const { droneOn, telemetry } = useMonitoringOperator();

  const [droneId, setDroneId] = useState<string | null>(null);

  const [operatorPos, setOperatorPos] = useState<{lat: number, lng: number} | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captureStatusText, setCaptureStatusText] = useState('');
  const [mapirHealth, setMapirHealth] = useState<MapirHealthResponse>({
    raspberry_pi: 'offline',
    mapir: { ready: false },
    capture_busy: false,
  });
  const [predictionResult, setPredictionResult] = useState<NDVIPredictionResult | null>(null);
  const [originalJpgUrl, setOriginalJpgUrl] = useState<string | null>(null);
  const [originalRawUrl, setOriginalRawUrl] = useState<string | null>(null);
  const [showNozzleModal, setShowNozzleModal] = useState(false);
  const [isSprayingActive, setIsSprayingActive] = useState(false);

  const popupHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    () => () => {
      if (popupHideTimerRef.current) clearInterval(popupHideTimerRef.current);
    },
    [],
  );

  // Monitor Spray
  const TANK_CAPACITY_ML = 700.0;
  const TOTAL_SPRAY_SECONDS = 5;
  const SPRAY_TARGET_ML = 15.0;
  const [sprayCountdown, setSprayCountdown] = useState(0);
  const [sprayVolume, setSprayVolume] = useState(0.0);
  const [tankRemaining, setTankRemaining] = useState(100);
  const [currentTankVolume, setCurrentTankVolume] = useState(TANK_CAPACITY_ML);
  const [modalCountdown, setModalCountdown] = useState(5);

  useEffect(() => {
    let isMounted = true;
    const fetchMyDroneInfo = async () => {
      try {
        const res = await fetch('/api/operator/my-drone');
        if (res.ok) {
          const result = await res.json();
          if (result.data && result.data.id && isMounted) {
            setDroneId(result.data.id);
            console.log(`[Operator] Assigned Drone ID berhasil dimuat: ${result.data.id}`);
          }
        } else {
          console.warn("[Operator] Gagal memuat data /operator/my-drone");
        }
      } catch (err) {
        console.error("[Operator] Gagal fetching /operator/my-drone", err);
      }
    };
    fetchMyDroneInfo();
    return () => { isMounted = false; };
  }, []);

  const isValidTelemetryState = droneOn && telemetry.latitude !== 0 && telemetry.longitude !== 0;
  const currentPos = (telemetry.latitude !== 0 && telemetry.longitude !== 0)
    ? { 
        lat: telemetry.latitude, 
        lng: telemetry.longitude, 
        yaw: telemetry.yaw ?? 0
      }
    : { 
        lat: -6.5890586,
        lng: 106.8055139, 
        yaw: 0
      };

  const currentLatStr = isValidTelemetryState ? `${Math.abs(currentPos.lat).toFixed(6)}°S` : '0.000000°S';
  const currentLngStr = isValidTelemetryState ? `${Math.abs(currentPos.lng).toFixed(6)}°E` : '0.000000°E';

  const distanceToDevice = operatorPos 
    ? calculateDistance(currentPos.lat, currentPos.lng, operatorPos.lat, operatorPos.lng) 
    : 0;

  const renderMapCanvas = () => (
    <DroneMap
      mode="live"
      dronePosition={currentPos}
      operatorPosition={operatorPos || currentPos}
      latDisplay={currentLatStr}
      lngDisplay={currentLngStr}
      altDisplay={droneOn ? `${(telemetry.altitude ?? 0).toFixed(2)} m` : '0.00 m'}
      height="100%"
    />
  );
  
  useEffect(() => {
    let active = true;

    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/mapir/health', { cache: 'no-store' });
        const data: unknown = await response.json();

        if (
          !active ||
          !isJsonRecord(data) ||
          !isJsonRecord(data.mapir) ||
          typeof data.mapir.ready !== 'boolean'
        ) {
          if (active) {
            setMapirHealth({
              raspberry_pi: 'offline',
              mapir: { ready: false },
              capture_busy: false,
            });
          }
          return;
        }

        setMapirHealth({
          raspberry_pi:
            typeof data.raspberry_pi === 'string' ? data.raspberry_pi : 'offline',
          mapir: {
            ready: data.mapir.ready,
            ...(typeof data.mapir.ip === 'string' ? { ip: data.mapir.ip } : {}),
          },
          capture_busy: data.capture_busy === true,
        });
      } catch (error) {
        console.error('[MAPIR Health] Gagal memuat status kamera:', error);
        if (active) {
          setMapirHealth({
            raspberry_pi: 'offline',
            mapir: { ready: false },
            capture_busy: false,
          });
        }
      }
    };

    void fetchHealth();
    const interval = setInterval(fetchHealth, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleSnapshot = async () => {
    if (!mapirHealth.mapir.ready || mapirHealth.capture_busy || isAnalyzing) return;

    if (popupHideTimerRef.current) clearInterval(popupHideTimerRef.current);
    setIsAnalyzing(true);
    setCaptureStatusText('Memotret dengan MAPIR...');
    setPredictionResult(null);
    setOriginalJpgUrl(null);
    setOriginalRawUrl(null);
    setShowNozzleModal(false);
    setIsSprayingActive(false);
    setSprayCountdown(0);
    setSprayVolume(0);

    try {
      const captureResponse = await fetch('/api/mapir/captures', { method: 'POST' });
      const captureData: unknown = await captureResponse.json();

      if (!captureResponse.ok) {
        throw new Error(getResponseDetail(captureData, 'Gagal memulai capture MAPIR.'));
      }

      const captureId =
        isJsonRecord(captureData) && typeof captureData.capture_id === 'string'
          ? captureData.capture_id
          : isJsonRecord(captureData) && typeof captureData.id === 'string'
            ? captureData.id
            : null;

      if (!captureId) {
        throw new Error('ID capture tidak ditemukan pada response Capture API.');
      }

      let completed = false;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCaptureStatusText('Menunggu foto MAPIR selesai...');

        const statusResponse = await fetch(
          `/api/mapir/captures/${encodeURIComponent(captureId)}`,
          { cache: 'no-store' },
        );
        const statusData: unknown = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(getResponseDetail(statusData, 'Gagal memproses capture.'));
        }

        if (!isJsonRecord(statusData)) {
          throw new Error('Response status capture tidak valid.');
        }

        if (statusData.status === 'failed') {
          throw new Error(getResponseDetail(statusData, 'Capture MAPIR gagal.'));
        }

        if (statusData.status !== 'completed') continue;

        if (!isPredictionResult(statusData.mlResult)) {
          throw new Error('Response FastAPI tidak sesuai format hasil prediksi.');
        }

        const result = statusData.mlResult;
        setPredictionResult(result);
        setCaptureStatusText('');
        setOriginalJpgUrl(
          typeof statusData.originalJpgUrl === 'string'
            ? statusData.originalJpgUrl
            : null,
        );
        setOriginalRawUrl(
          typeof statusData.originalRawUrl === 'string'
            ? statusData.originalRawUrl
            : null,
        );
        completed = true;

        if (
          result.classification === 'Terserang' &&
          result.automaticSprayingAllowed &&
          droneId
        ) {
          setShowNozzleModal(true);
          setModalCountdown(5);

          let countdown = 5;
          popupHideTimerRef.current = setInterval(async () => {
            countdown -= 1;

            if (countdown > 0) {
              setModalCountdown(countdown);
              return;
            }

            if (popupHideTimerRef.current) {
              clearInterval(popupHideTimerRef.current);
            }
            setShowNozzleModal(false);
            setSprayCountdown(TOTAL_SPRAY_SECONDS);
            setSprayVolume(0);
            setTankRemaining(
              Math.round((currentTankVolume / TANK_CAPACITY_ML) * 100),
            );
            setIsSprayingActive(true);

            try {
              const sprayResponse = await fetch('/api/operator/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  droneId,
                  targetTopic: 'action',
                  command: 'spray_on',
                }),
              });
              if (!sprayResponse.ok) {
                throw new Error(`Perintah spray gagal (${sprayResponse.status}).`);
              }
            } catch (error) {
              console.error('[Command] Gagal mengirim perintah spray:', error);
              setSprayCountdown(0);
              setIsSprayingActive(false);
            }
          }, 1000);
        }
        break;
      }

      if (!completed) {
        throw new Error('Capture MAPIR melewati batas waktu 2 menit.');
      }
    } catch (error) {
      console.error('[MAPIR Capture] Gagal mengambil atau menganalisis gambar:', error);
      setCaptureStatusText(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat capture.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Monitor Penyemprotan Pestisida
  useEffect(() => {
    let sprayTimer: NodeJS.Timeout | undefined;

    if (isSprayingActive) {
      const initialVolume = currentTankVolume; 

      sprayTimer = setInterval(() => {
        setSprayCountdown(prevSec => {
          
          if (prevSec <= 1) {
            clearInterval(sprayTimer);

            const finalTankVolume = initialVolume - SPRAY_TARGET_ML;
            setCurrentTankVolume(finalTankVolume);
            setSprayVolume(0);
            setTankRemaining(Math.round((finalTankVolume / TANK_CAPACITY_ML) * 100));     
            setIsSprayingActive(false);            

            fetch('/api/operator/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                droneId: droneId, 
                targetTopic: 'action',
                command: 'spray_off' 
              })
            }).then(() => console.log("[Command] Perintah payload berhasil dikirim"))
              .catch(err => console.error("Gagal mengirim perintah payload", err));

            if (droneId) {
              fetch('/api/operator/spray', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  droneId: droneId,
                  predictionId: null,
                  durationSpray: TOTAL_SPRAY_SECONDS,
                  volumeSpray: SPRAY_TARGET_ML,
                  capacityTank: TANK_CAPACITY_ML,
                  remainingTank: finalTankVolume
                })
              }).then(() => console.log("Data /spray tersimpan di DB"))
                .catch(err => console.error("Gagal simpan data /spray di DB", err));
            }

            return 0;
          }

          // Countdown duration
          const nextSec = prevSec - 1;
          const elapsed = TOTAL_SPRAY_SECONDS - nextSec;

          // Countdown volume keluar
          const nextVol = Number(((elapsed / TOTAL_SPRAY_SECONDS) * SPRAY_TARGET_ML).toFixed(1));
          setSprayVolume(nextVol);

          // Kalkulasi sisa tangki berjalan
          const currentSisa = initialVolume - nextVol;
          const nextTankPercent = Math.round((currentSisa / TANK_CAPACITY_ML) * 100);
          setTankRemaining(nextTankPercent);

          return nextSec;
        });
      }, 1000);
    }

    return () => {
      if (sprayTimer) clearInterval(sprayTimer);
    };
  }, [isSprayingActive, droneId, currentTankVolume]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOperatorPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn("[GPS] Gagal mendapatkan lokasi perangkat:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeRCMode = useMemo(() => {
    if ((telemetry.rc?.ch6 ?? 0) > 1700) return 'LOITER';
    if ((telemetry.rc?.ch7 ?? 0) > 1700) return 'AUTO';
    if ((telemetry.rc?.ch8 ?? 0) > 1700) return 'RTL';
    if ((telemetry.rc?.ch9 ?? 0) > 1700) return 'SPRAY';
    
    return 'MODE RC OFF';
  }, [telemetry.rc]);

  return (
    <div className="w-full space-y-4 max-w-[1400px] mx-auto text-gray-800 dark:text-gray-100 select-none pb-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <div className="lg:col-span-8 w-full min-w-0 flex flex-col gap-3">
          <CameraPreview
            onTriggerCapture={handleSnapshot}
            loading={isAnalyzing || mapirHealth.capture_busy}
            statusText={captureStatusText}
            isCameraReady={mapirHealth.mapir.ready}
          />

          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] px-4 py-3 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Battery size={16} className="text-gray-500" />
              <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
                {droneOn ? (telemetry.battery ?? 0).toFixed(0) : '0'}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Wifi size={16} className="text-gray-500" />
              <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
                {droneOn && telemetry?.radio?.rssi !== undefined
                  ? `${Math.round((telemetry.radio.rssi / 254) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <span className="ml-auto font-semibold text-gray-500">
              {activeRCMode}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 w-full min-w-0 flex flex-col gap-4 bg-white dark:bg-[#111] ">
          
          {/* AREA LAYOUT KANAN */}
          <div className="h-[250px] w-full relative overflow-hidden rounded-xl border border-gray-100 dark:border-[#222] shadow-xs bg-white dark:bg-[#111]">
            {renderMapCanvas()}
          </div>

          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] p-4 flex flex-col justify-between flex-1 min-h-[170px] shadow-xs">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-bold tracking-wider text-gray-700 dark:text-gray-300 uppercase font-mono">
                INFORMASI PENERBANGAN
              </h3>
            </div>
            <hr/>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 flex-1 items-center px-1">
              {/* Ketinggian */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {droneOn ? (telemetry.altitude ?? 0).toFixed(2) : '0.00'}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Ketinggian</span>
              </div>

              {/* Kecepatan Naik */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowUp size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {droneOn ? (telemetry.climbRate ?? 0).toFixed(2) : '0.00'}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Naik</span>
              </div>

              {/* Jarak dari Home */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <MoveHorizontal size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {droneOn ? distanceToDevice.toFixed(1) : '0.0'}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Jarak dari Home</span>
              </div>

              {/* Kecepatan Jelajah */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {droneOn ? (telemetry.groundSpeed ?? 0).toFixed(1) : '0.0'}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Jelajah</span>
              </div>
            </div>
          </div>

        </div>
      </div>


      <div className="grid grid-cols-1 gap-4">
        {predictionResult ? (
          <PredictionCard
            data={predictionResult}
            originalJpgUrl={originalJpgUrl}
            originalRawUrl={originalRawUrl}
          />
        ) : (
          <div className="rounded-xl border border-gray-100 dark:border-[#222] bg-white dark:bg-[#111] p-5">
            <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              Hasil Prediksi AI
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
              {captureStatusText || 'Hasil analisis akan muncul setelah foto MAPIR diambil.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111] p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#222]">
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            Monitor Penyemprotan Pestisida
          </h2>
          {isSprayingActive && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 animate-pulse">
                ● PROSES PENYEMPROTAN
            </span>
          )}
        </div>

        {/* 
          WRAPPER KONTEN
          - Bagian Durasi, Volume Keluar, dan Sisa Volume dibungkus dalam div yang termute jika tidak aktif.
          - Bagian Tangki dipisahkan agar tetap interaktif.
        */}
        <div className="grid grid-cols-4 gap-4 divide-x divide-gray-100 dark:divide-[#333]">
          
          <div className={`col-span-3 grid grid-cols-3 transition-opacity duration-300 ${!isSprayingActive ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            
            <div className="flex flex-col items-center justify-center px-4 py-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                DURASI
              </span>
              <span className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
                {formatDuration(sprayCountdown)}
              </span>
              <span className="text-[11px] font-mono text-gray-400 mt-0.5">
              mm:ss
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                VOLUME KELUAR
              </span>
            <div className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
              {sprayVolume.toFixed(1)}
            </div>
              <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                ml
              </span>
          </div>

            <div className="flex flex-col items-center justify-center px-4 py-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                SISA VOLUME
              </span>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono mt-0.5">
              {isSprayingActive ? Math.max(0, Math.round(currentTankVolume - sprayVolume)) : Math.round(currentTankVolume)} ml
            </div>

              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-3">
                SISA TANGKI
              </span>
            <div className="text-xs font-bold text-[#6B8E23] font-mono mt-0.5">
              {tankRemaining}%
            </div>
          </div>

          </div>


          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              TANGKI
            </span>

            <div className="relative flex justify-center">
              
              {/* Visual Tangki Utama */}
              <div className="w-8 h-14 bg-gray-100 dark:bg-[#222] rounded-md border border-gray-300 dark:border-[#333] relative overflow-hidden flex flex-col justify-end p-0.5 shadow-2xs">
                <div className="w-4 h-1 bg-gray-400 rounded-t-xs -mt-1 mx-auto z-10" />
                <div
                  className="w-full bg-linear-to-t from-[#597B27] to-[#7EA635] rounded-xs transition-all duration-500"
                  style={{ height: `${tankRemaining}%` }}
                />
              </div>

              {/* Tombol Reload */}
              <button 
                  type="button"
                  onClick={() => {
                    setCurrentTankVolume(TANK_CAPACITY_ML);
                    setTankRemaining(100);
                  }}
                  className="absolute -right-11 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#262626] border border-gray-200 dark:border-[#333] rounded-lg transition-all shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#D8EFEB] dark:focus:ring-[#13332d]"
                  title="Isi Ulang Tangki (700ml)"
                >
                  <RefreshCcw size={14} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Label Persentase */}
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1">
              {tankRemaining}%
            </span>
          </div>

        </div>
      </div>

      {/* Popup Modal */}
      {showNozzleModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#181818] rounded-2xl p-7 shadow-2xl border border-gray-100 dark:border-[#333] flex flex-col items-center text-center">
            
            <div className="w-14 h-14 rounded-full bg-[#FCE8E6] dark:bg-[#381815] border border-[#F8B4AF] dark:border-[#5a2420] flex items-center justify-center mb-4 text-[#C84030]">
              <AlertTriangle size={28} strokeWidth={2.2} />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-[#A8281A] dark:text-[#f87171] leading-tight">
              Tanaman Tidak Sehat Terdeteksi!
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2.5 leading-relaxed">
              Spray Penyemprotan Pestistida Otomatis Aktif.
            </p>

            {/* Note */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-normal">
              Pop-up ini akan tertutup otomatis dan akan mulai melakukan spray setelah <span className="font-bold text-gray-700 dark:text-gray-200">{modalCountdown}</span> detik.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}