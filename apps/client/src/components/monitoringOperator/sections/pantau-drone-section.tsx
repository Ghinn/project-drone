"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import { 
  Camera, 
  Battery, 
  Wifi, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle,
  CheckCircle,
  X,
  Radio,
  Dot,
  ArrowUpDown,
  ArrowUp,
  MoveHorizontal,
  ArrowRight
} from 'lucide-react';
import { MapWaypoint } from './drone-map';

const T = DRONE_TOKENS;

// Leaflet map harus dynamic import (tidak SSR) karena butuh window
const DroneMap = dynamic(() => import('./drone-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-[#111] flex items-center justify-center min-h-[210px]">
      <span className="text-xs text-gray-400">Memuat peta GPS Leaflet...</span>
    </div>
  ),
});

type PredictionResult = {
  label: string;
  healthy: number;
  unhealthy: number;
  disease: string;
  confidence: number;
  severity: 'ok' | 'caution' | 'warning' | 'critical';
  recommendation: string;
} | null;

const MOCK_RESULT: PredictionResult = {
  label: 'Terdeteksi Penyakit Ganoderma (BSR)',
  healthy: 12.4,
  unhealthy: 87.6,
  disease: 'Busuk Pangkal Batang (BSR) — Ganoderma boninense',
  confidence: 94.2,
  severity: 'critical',
  recommendation: 'Segera lakukan penyemprotan fungisida pada area Blok A-12, Baris 8. Isolasi pohon dan tandai koordinat GPS untuk inspeksi lanjutan.',
};

const SEVERITY_STYLE = {
  ok:       { bg: `${T.green}20`, text: T.green,  border: `${T.green}44`,  label: 'SEHAT',      labelEn: 'HEALTHY'  },
  caution:  { bg: `${T.amber}20`, text: T.amber,  border: `${T.amber}44`,  label: 'PERHATIAN',  labelEn: 'CAUTION'  },
  warning:  { bg: `${T.orange}20`,text: T.orange, border: `${T.orange}44`, label: 'WASPADA',    labelEn: 'WARNING'  },
  critical: { bg: `${T.red}18`,   text: T.red,    border: `${T.red}44`,    label: 'KRITIS',     labelEn: 'CRITICAL' },
};

// Mock waypoints riwayat drone
const MOCK_WAYPOINTS: MapWaypoint[] = [
  { lat: 3.3556, lng: 114.5977, id: 'REC-033', label: 'Sehat',      status: 'ok',       time: '14:19:05' },
  { lat: 3.3561, lng: 114.5983, id: 'REC-034', label: 'Sehat',      status: 'ok',       time: '14:22:38' },
  { lat: 3.3566, lng: 114.5990, id: 'REC-035', label: 'BSR Ringan', status: 'caution',  time: '14:25:11' },
  { lat: 3.3572, lng: 114.5997, id: 'REC-036', label: 'BSR Sedang', status: 'warning',  time: '14:28:05' },
  { lat: 3.3578, lng: 114.6004, id: 'REC-037', label: 'BSR Parah',  status: 'critical', time: '14:32:17' },
];

// Mock records untuk mode riwayat kamera
const RECORD_HISTORY = [
  { id: 'REC-037', time: '14:32:17', gps: '3°21\'14.2"N 114°35\'48.9"E', cls: 'BSR Parah',  conf: 94, sev: 'critical' as const, wpIndex: 4 },
  { id: 'REC-036', time: '14:28:05', gps: '3°21\'12.1"N 114°35\'47.3"E', cls: 'BSR Ringan', conf: 55, sev: 'caution'  as const, wpIndex: 2 },
  { id: 'REC-035', time: '14:25:11', gps: '3°21\'10.8"N 114°35\'46.0"E', cls: 'Sehat',      conf: 99, sev: 'ok'       as const, wpIndex: 1 },
  { id: 'REC-034', time: '14:22:38', gps: '3°21\'09.4"N 114°35\'44.7"E', cls: 'Sehat',      conf: 97, sev: 'ok'       as const, wpIndex: 0 },
  { id: 'REC-033', time: '14:19:05', gps: '3°21\'08.1"N 114°35\'43.2"E', cls: 'BSR Sedang', conf: 71, sev: 'warning'  as const, wpIndex: 3 },
];

// Mock posisi live drone (simulasi bergerak)
const LIVE_POSITIONS = [
  { lat: 3.3556, lng: 114.5977 },
  { lat: 3.3561, lng: 114.5983 },
  { lat: 3.3566, lng: 114.5990 },
  { lat: 3.3572, lng: 114.5997 },
  { lat: 3.3578, lng: 114.6004 },
];
// Koordinat Kebun Percobaan
const CIKABAYAN_POSITIONS = [
  { lat: -6.5491118, lng: 106.7160657 },
  { lat: -6.5489800, lng: 106.7162400 },
  { lat: -6.5488200, lng: 106.7164100 },
  { lat: -6.5487100, lng: 106.7165800 },
  { lat: -6.5489200, lng: 106.7167100 },
  { lat: -6.5491800, lng: 106.7165600 },
  { lat: -6.5493400, lng: 106.7163300 },
  { lat: -6.5492100, lng: 106.7161100 },
];

type SnapshotCondition = 'idle' | 'sehat' | 'tidak_sehat';

export default function PantauDroneSection() {
  const { droneOn, telemetry, latestSnapshot } = useMonitoringOperator();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [droneId, setDroneId] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState<string>('15.22');
  const [posIdx, setPosIdx] = useState(0);

  const [snapshotCondition, setSnapshotCondition] = useState<SnapshotCondition>('idle');
  const [currentSnapshotImg, setCurrentSnapshotImg] = useState<string | null>(null);
  const [snapshotPos, setSnapshotPos] = useState<{ latStr: string; lngStr: string; altStr: string } | null>(null);
  const [ndviValue, setNdviValue] = useState<number>(0);
  const [snapshotFlash, setSnapshotFlash] = useState(false);



  // State Flow Controls
  const [isWaitingSnapshot, setIsWaitingSnapshot] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNozzleModal, setShowNozzleModal] = useState(false);
  const [isSprayingActive, setIsSprayingActive] = useState(false);
  const lastProcessedImgRef = useRef<string | null>(null);

  // Timer
  const aiProcessTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupShowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // telemetri
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [droneSpeed, setDroneSpeed] = useState(0.0);
  const [altitude, setAltitude] = useState(25.3);

  // semprot pestisida countdown
  const TOTAL_SPRAY_SECONDS = 60;
  const [sprayCountdown, setSprayCountdown] = useState(0);
  const [sprayVolume, setSprayVolume] = useState(0.0);
  const [tankRemaining, setTankRemaining] = useState(98);

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
        console.error("[Operator] Error fetching /operator/my-drone", err);
      }
    };

    fetchMyDroneInfo();
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Inisialisasi WebRTC
  useEffect(() => {
    if (!droneOn || !droneId) return;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:4000';
    const socket = io(BACKEND_URL, { path: '/webrtc-signaling/' });
    socketRef.current = socket;

    const pc = new RTCPeerConnection({ 
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] 
    });
    pcRef.current = pc;

    let isRemoteSet = false;
    let pendingCandidates: any[] = [];

    pc.ontrack = (event) => {
      console.log("[WebRTC] Stream video diterima dari Drone");
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(e => console.error("[WebRTC] Autoplay ditolak browser:", e));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { droneId, candidate: event.candidate });
      }
    };

    socket.emit('join-room', { droneId, role: 'operator' });

    setTimeout(() => {
      socket.emit('sdp-message', { droneId, sdp: { type: 'request-offer' } });
    }, 500);

    socket.on('sdp-message', async (sdpData) => {
      if (sdpData && sdpData.type === 'offer') {
        try {
          console.log("[WebRTC] Menerima SDP Offer dari Drone. Membuat Answer...");
          
          await pc.setRemoteDescription(new RTCSessionDescription(sdpData));
          isRemoteSet = true;
          
          // Proses semua antrean ICE yang terlanjur datang lebih dulu
          pendingCandidates.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)));
          pendingCandidates = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.emit('sdp-message', { 
            droneId, 
            sdp: {
              type: pc.localDescription?.type, 
              sdp: pc.localDescription?.sdp 
            }
          });
          console.log("[WebRTC] SDP Answer berhasil dikirim ke Drone.");
        } catch (error) {
          console.error("[WebRTC] Gagal memproses SDP Offer:", error);
        }
      }
    });

    socket.on('ice-candidate', async (candidateData) => {
      try {
        if (candidateData) {
          const candidateStr = typeof candidateData === 'string' ? candidateData : candidateData.candidate;
          if (candidateStr) {
            if (isRemoteSet) {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } else {
              pendingCandidates.push(candidateData);
            }
          }
        }
      } catch (e) {
        console.error('[WebRTC] Gagal menambahkan ICE candidate', e);
      }
    });

    return () => {
      pc.close();
      socket.disconnect();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [droneOn, droneId]);

  // Handler Gambar yang Masuk dari WebRTC/SSE
  useEffect(() => {
    if (isWaitingSnapshot && latestSnapshot && latestSnapshot.imageUrl) {

      if (latestSnapshot.imageUrl === lastProcessedImgRef.current) {
        return; 
      }

      console.log("Gambar berhasil diterima via SSE:", latestSnapshot.imageUrl);
      
      setIsWaitingSnapshot(false);
      setIsAnalyzing(true);
      
      // Render gambar resolusi tinggi ke canvas
      setCurrentSnapshotImg(latestSnapshot.imageUrl);
      setSnapshotFlash(true);
      setTimeout(() => setSnapshotFlash(false), 300);

      // Simulasi Proses AI 3 Detik
      if (aiProcessTimerRef.current) clearTimeout(aiProcessTimerRef.current);
      
      aiProcessTimerRef.current = setTimeout(() => {
        // Contoh Output AI
        const isHealthy = Math.random() > 0.5; 
        const mockNdvi = isHealthy ? 0.28 : 0.18;

        setNdviValue(mockNdvi);
        setSnapshotCondition(isHealthy ? 'sehat' : 'tidak_sehat');
        setIsAnalyzing(false);

        // Logika kemunculan Popup Nozzle
        if (!isHealthy) {
          popupShowTimerRef.current = setTimeout(() => {
            setShowNozzleModal(true);

            popupHideTimerRef.current = setTimeout(() => {
              setShowNozzleModal(false);
              setIsSprayingActive(true);
            }, 10000);
          }, 5000);
        } else {
          setShowNozzleModal(false);
          setIsSprayingActive(false);
        }
      }, 3000);
    }
  }, [latestSnapshot, isWaitingSnapshot]);

  // Handle Snapshot
  const handleSnapshot = () => {
    if (!droneOn || isAnalyzing) return;

    if (aiProcessTimerRef.current) clearTimeout(aiProcessTimerRef.current);
    if (popupShowTimerRef.current) clearTimeout(popupShowTimerRef.current);
    if (popupHideTimerRef.current) clearTimeout(popupHideTimerRef.current);

    setIsWaitingSnapshot(true);
    setCurrentSnapshotImg(null);
    setSnapshotCondition('idle');
    setNdviValue(0);
    setShowNozzleModal(false);
    setIsSprayingActive(false);

    try {
      fetch('/api/operator/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          droneId: droneId,
          targetTopic: 'action',
          command: 'take_picture'
        })
      }).catch(err => console.error("[Command] Gagal eksekusi trigger API", err));
    } catch (error) {
      console.error("[Command] Terjadi kesalahan trigger:", error);
    }

    setSnapshotPos({
      latStr: `${Math.abs(currentPos.lat).toFixed(6)}°S`,
      lngStr: `${Math.abs(currentPos.lng).toFixed(6)}°E`,
      altStr: altDisplay,
    });
  };

  // Basic Timers & Dummy Data
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}.${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Pergerakan GPS Drone
  useEffect(() => {
    if (!droneOn) return;
    const interval = setInterval(() => {
      setPosIdx(prev => (prev + 1) % CIKABAYAN_POSITIONS.length);
      setBatteryLevel(prev => (prev > 20 ? Number((prev - 0.01).toFixed(1)) : prev));
      setAltitude(prev => Number((25.0 + Math.sin(Date.now() / 6000) * 0.3).toFixed(1)));
      setDroneSpeed(prev => (Math.random() > 0.6 ? Number((1.2 + Math.random() * 0.5).toFixed(1)) : 1.4));
    }, 9000);
    return () => clearInterval(interval);
  }, [droneOn]);

  // Monitor Penyemprotan Pestisida
  useEffect(() => {
    let sprayTimer: NodeJS.Timeout;

    if (isSprayingActive) {
      setSprayCountdown(TOTAL_SPRAY_SECONDS);
      setSprayVolume(0.0);
      setTankRemaining(98);

      sprayTimer = setInterval(() => {
        setSprayCountdown(prevSec => {
          if (prevSec <= 1) {
            clearInterval(sprayTimer);

            if (droneId) {
              fetch('/api/operator/spray', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  droneId: droneId,
                  durationSpray: 60, // Durasi dalam detik
                  volumeSpray: 100.0, // Volume akhir
                  capacityTank: 100.0,
                  remainingTank: 90.0 // Sisa akhir
                })
              }).then(res => console.log("Data /spray tersimpan di DB"))
                .catch(err => console.error("Gagal simpan data /spray di DB", err));
            }

            return 60;
          }
          const nextSec = prevSec - 1;
          const elapsed = TOTAL_SPRAY_SECONDS - nextSec;
          const nextVol = Math.min(100.0, Number(((elapsed / TOTAL_SPRAY_SECONDS) * 100).toFixed(1)));
          setSprayVolume(nextVol);
          const nextTank = Math.max(90, Math.round(98 - (elapsed / TOTAL_SPRAY_SECONDS) * 8));
          setTankRemaining(nextTank);
          return nextSec;
        });
      }, 1000);
    } else {
      setSprayCountdown(0);
      setSprayVolume(0.0);
      setTankRemaining(98);
    }

    return () => clearInterval(sprayTimer);
  }, [isSprayingActive, droneId]);

  const currentPos = (telemetry.latitude !== 0 && telemetry.longitude !== 0)
    ? { lat: telemetry.latitude, lng: telemetry.longitude }
    : CIKABAYAN_POSITIONS[posIdx];

  const currentLatStr = `${Math.abs(currentPos.lat).toFixed(6)}°S`;
  const currentLngStr = `${Math.abs(currentPos.lng).toFixed(6)}°E`;

  const battDisplay = telemetry.battery ? telemetry.battery.toFixed(0) : Math.round(batteryLevel).toString();
  const altDisplay = telemetry.altitude ? `${telemetry.altitude.toFixed(1)} m` : `${altitude} m`;
  const speedDisplay = telemetry.groundSpeed ? `${telemetry.groundSpeed.toFixed(1)} m/s` : `${droneSpeed} m/s`;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto text-gray-800 dark:text-gray-100 select-none pb-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <div className="lg:col-span-8 bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-[#222]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-pulse" />
              <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">Live Camera</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 font-medium">{timeStr}</span>
              <span className="px-2.5 py-0.5 bg-[#EAF5D6] text-[#6A9A1E] font-bold text-[11px] rounded tracking-wide">
                LIVE
              </span>
              <span className="px-2.5 py-0.5 bg-[#D8EFEB] text-[#23816F] font-bold text-[11px] rounded tracking-wide">
                LOITER
              </span>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] bg-black overflow-hidden flex items-center justify-center">
            {droneOn ? (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                <Radio size={32} className="animate-pulse opacity-50" />
                <span className="text-xs">Kamera Offline · Aktifkan Drone</span>
              </div>
            )}

            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#84CC16]" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#84CC16]" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#84CC16]" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#84CC16]" />

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono text-[#86EFAC]">
              {currentLatStr} {currentLngStr} · ALT {altDisplay}
            </div>

            {snapshotFlash && (
              <div className="absolute inset-0 bg-white/80 transition-opacity duration-200 pointer-events-none" />
            )}
          </div>

          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111]">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Battery size={16} className="text-gray-500" />
                <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{battDisplay}%</span>
              </div>
              
              <div className="flex items-center gap-1.5 font-medium">
                <Wifi size={16} className="text-gray-500" />
                <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">52.4 GHz</span>
              </div>
            </div>

            {/* Snapshot Button */}
            <button
              onClick={handleSnapshot}
              disabled={!droneOn || isAnalyzing || isWaitingSnapshot || !droneId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-xs ml-auto ${
                isAnalyzing || isWaitingSnapshot || !droneId
                  ? 'bg-amber-600 opacity-90 cursor-wait'
                  : 'bg-[#5F802A] hover:bg-[#506D23] active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Camera size={15} className={(isAnalyzing || isWaitingSnapshot) ? 'animate-spin' : ''} />
              <span>
                {isWaitingSnapshot 
                  ? 'Menangkap Gambar...' 
                  : isAnalyzing 
                    ? 'Memproses AI (3s)...' 
                    : 'Ambil Snapshot'}
              </span>
            </button>
          </div>

        </div>

        <div className="lg:col-span-4 flex flex-col gap-0 bg-white">
          
          <div className="h-[250px] w-full">
            <DroneMap
              mode="live"
              dronePosition={currentPos}
              latDisplay={`${currentPos.lat.toFixed(4)}°`}
              lngDisplay={`${currentPos.lng.toFixed(4)}°`}
              altDisplay={altDisplay}
              height="100%"
            />
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
                    {droneOn ? (telemetry.altitude ? telemetry.altitude.toFixed(1) : altitude.toFixed(1)) : '0.0'}{' '}
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
                    0.0{' '}
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
                    0.0{' '}
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
                    {droneOn ? (telemetry.groundSpeed ? telemetry.groundSpeed.toFixed(1) : droneSpeed.toFixed(1)) : '0.0'}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Jelajah</span>
              </div>
            </div>
          </div>

        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-[#222]">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Snapshot</h3>
            <span className="text-xs font-mono text-gray-400 font-medium">
              {currentSnapshotImg ? timeStr : '--.--'}
            </span>
          </div>
          
          <div className="relative w-full aspect-[16/10] bg-gray-50 dark:bg-[#151515] overflow-hidden flex items-center justify-center">
            {currentSnapshotImg ? (
              <>
                <img
                  src={currentSnapshotImg}
                  alt="Snapshot Pohon"
                  className="w-full h-full object-cover"
                />
                {snapshotPos && (
                  <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    {snapshotPos.latStr} {snapshotPos.lngStr} · ALT {snapshotPos.altStr}
                  </div>
                )}
              </>
            ) : (
              // Mute State
              <div className="flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-2">
                  <Camera size={22} className="text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Belum ada snapshot</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[220px]">
                  Posisikan drone di atas pohon lalu klik &quot;Ambil Snapshot&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-colors duration-300 ${
          !isAnalyzing && snapshotCondition === 'tidak_sehat'
            ? 'bg-[#FDF3F0] dark:bg-[#1E1412] border-[#FCE2DB] dark:border-[#38201a]'
            : 'bg-white dark:bg-[#111] border-gray-100 dark:border-[#222]'
        }`}>
          
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Hasil Prediksi AI</h3>
            {isAnalyzing ? (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-xs rounded tracking-wider animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                MENGANALISIS...
              </span>
            ) : snapshotCondition === 'idle' ? (
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-500 font-bold text-xs rounded tracking-wider">
                ---
              </span>
            ) : snapshotCondition === 'sehat' ? (
              <span className="px-3 py-1 bg-[#EAF5D6] text-[#6A9A1E] font-bold text-xs rounded tracking-wider">
                SEHAT
              </span>
            ) : (
              <span className="px-3 py-1 bg-[#FCE8E6] text-[#C84030] font-bold text-xs rounded tracking-wider">
                TIDAK SEHAT
              </span>
            )}
          </div>

          {/* Metric Center */}
          <div className="my-auto py-4 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              INDEKS NDVI
            </span>
            <div className={`text-5xl sm:text-6xl font-extrabold tracking-tight my-2 font-mono ${
              isAnalyzing || snapshotCondition === 'idle'
                ? 'text-gray-300 dark:text-gray-700'
                : snapshotCondition === 'sehat'
                ? 'text-[#4D7C0F]'
                : 'text-[#E59819]'
            }`}>
              {isAnalyzing || snapshotCondition === 'idle' ? '0.00' : ndviValue.toFixed(2)}
            </div>

            <div className="w-full max-w-md mt-2">
              <div className="relative w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width:
                      isAnalyzing || snapshotCondition === 'idle'
                        ? '0%'
                        : `${ndviValue * 100}%`,
                    background:
                      isAnalyzing || snapshotCondition === 'idle'
                        ? 'transparent'
                        : snapshotCondition === 'sehat'
                        ? 'linear-gradient(to right, #7A1414 0%, #C83B2B 60%, #E67E22 100%)'
                        : 'linear-gradient(to right, #7A1414 0%, #C83B2B 100%)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1 px-0.5">
                <span>0.0</span>
                <span>0.2</span>
                <span>0.4</span>
                <span>0.6</span>
                <span>0.8</span>
                <span>1.0</span>
              </div>
            </div>
          </div>

          {/* loading AI ceritanya */}
          {isAnalyzing ? (
            <div className="bg-amber-50 dark:bg-[#20180a] border border-amber-200 dark:border-[#423214] rounded-xl p-3.5 text-center mt-2 animate-pulse">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                ⏳ AI sedang menganalisis kesehatan tanaman dari citra drone...
              </p>
            </div>
          ) : snapshotCondition === 'idle' ? (
            <div className="bg-gray-100 dark:bg-[#1e1b18] border border-gray-200 dark:border-[#332b25] rounded-xl p-3.5 text-center mt-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Hasil analisis akan muncul setelah snapshot diambil
              </p>
            </div>
          ) : snapshotCondition === 'sehat' ? (
            <div className="bg-[#F4F9EB] dark:bg-[#16210f] border border-[#D5E8B5] dark:border-[#2d421e] rounded-xl p-3.5 flex items-start gap-3 mt-2">
              <CheckCircle className="text-[#65A30D] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#4D7C0F] dark:text-[#84cc16]">Tanaman Sehat</h4>
                <p className="text-xs text-[#3F6212] dark:text-[#a3e635] mt-0.5 leading-relaxed">
                  Tidak diperlukan tindakan. Lanjutkan ke pohon berikutnya.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF5ED] dark:bg-[#251810] border border-[#FFE4D3] dark:border-[#42291d] rounded-xl p-3.5 flex items-start gap-3 mt-2">
              <AlertTriangle className="text-[#EA580C] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#EA580C]">Tindakan Diperlukan</h4>
                <p className="text-xs text-[#9A3412] dark:text-[#fdba74] mt-0.5 leading-relaxed">
                  Instruksikan pilot untuk menyemprotkan pestisida ke pangkal batang menggunakan Remote Control.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>


      <div className={`bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs p-5 transition-opacity duration-300 ${
        isSprayingActive ? 'opacity-100' : 'opacity-40 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Monitor Penyemprotan Pestisida</h3>
          {isSprayingActive && (
            sprayCountdown === 0 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#EAF5D6] text-[#6A9A1E] dark:bg-[#1f2d12] dark:text-[#a3e635] flex items-center gap-1">
                PENYEMPROTAN SELESAI
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 animate-pulse">
                ● PROSES PENYEMPROTAN
              </span>
            )
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#222] gap-y-4 md:gap-y-0">
          
          {/* Durasi */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              DURASI
            </span>
            <div className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
              {formatDuration(sprayCountdown)}
            </div>
            <span className="text-[11px] font-mono text-gray-400 mt-0.5">
              mm:ss
            </span>
          </div>

          {/* Volume Keluar */}
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

          {/* Volume & Sisa Tangki */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              SISA VOLUME (ML)
            </span>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono mt-0.5">
              {isSprayingActive ? Math.max(0, Math.round(100 - sprayVolume)) : 0} ml
            </div>

            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-3">
              SISA TANGKI
            </span>
            <div className="text-xs font-bold text-[#6B8E23] font-mono mt-0.5">
              {tankRemaining}%
            </div>
          </div>

          {/* Tangki Graphic */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              TANGKI
            </span>

            <div className="w-8 h-14 bg-gray-100 dark:bg-[#222] rounded-md border border-gray-300 dark:border-[#333] relative overflow-hidden flex flex-col justify-end p-0.5 shadow-2xs">
              <div className="w-4 h-1 bg-gray-400 rounded-t-xs -mt-1 mx-auto z-10" />
              <div
                className="w-full bg-linear-to-t from-[#597B27] to-[#7EA635] rounded-xs transition-all duration-500"
                style={{ height: `${tankRemaining}%` }}
              />
            </div>
            
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
              Segera instruksikan pilot untuk mengaktifkan spray toggle pada Remote Control drone.
            </p>

            {/* Note */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-normal">
              Pop-up ini akan tertutup otomatis setelah 10 detik.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
