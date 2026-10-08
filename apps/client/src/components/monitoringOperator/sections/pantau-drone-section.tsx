"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import { 
  Camera, 
  Battery, 
  Wifi, 
  AlertTriangle,
  RefreshCcw,
  CheckCircle,
  Radio,
  ArrowUpDown,
  ArrowUp,
  MoveHorizontal,
  ArrowRight
} from 'lucide-react';
import DroneMap from './drone-map';

const T = DRONE_TOKENS;

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

type SnapshotCondition = 'idle' | 'sehat' | 'tidak_sehat';

export default function PantauDroneSection() {
  const { droneOn, telemetry, latestSnapshot } = useMonitoringOperator();
  
  // Refs untuk WebRTC dan Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [droneId, setDroneId] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState<string>('15.22');

  // State Switching dan Hover Delay Canvas 
  const [mainView, setMainView] = useState<'camera' | 'map'>('camera');
  const [swapHoverTarget, setSwapHoverTarget] = useState<'main' | 'mini' | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [snapshotCondition, setSnapshotCondition] = useState<SnapshotCondition>('idle');
  const [currentSnapshotImg, setCurrentSnapshotImg] = useState<string | null>(null);
  const [operatorPos, setOperatorPos] = useState<{lat: number, lng: number} | null>(null);
  const [snapshotPos, setSnapshotPos] = useState<{ latStr: string; lngStr: string; altStr: string } | null>(null);
  const [ndviValue, setNdviValue] = useState<number>(0);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);

  // State Flow Controls
  const [isWaitingSnapshot, setIsWaitingSnapshot] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNozzleModal, setShowNozzleModal] = useState(false);
  const [isSprayingActive, setIsSprayingActive] = useState(false);
  const lastProcessedImgRef = useRef<string | null>(null);

  // Timer AI dan Popup
  const aiProcessTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupShowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popupHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor Spray
  const TANK_CAPACITY_ML = 700.0;
  const TOTAL_SPRAY_SECONDS = 5;
  const SPRAY_TARGET_ML = 15.0;
  const [sprayCountdown, setSprayCountdown] = useState(0);
  const [sprayVolume, setSprayVolume] = useState(0.0);
  const [tankRemaining, setTankRemaining] = useState(100);
  const [currentTankVolume, setCurrentTankVolume] = useState(TANK_CAPACITY_ML);
  const [modalCountdown, setModalCountdown] = useState(5);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);

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
  
  // Inisialisasi WebRTC
  useEffect(() => {
    if (!droneOn || !droneId) {
      setIsVideoActive(false);
      return;
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
      if (event.streams[0]) {
        mediaStreamRef.current = event.streams[0]; // Simpan referensi stream
        setIsVideoActive(true);
        // if (videoRef.current) {
        //   videoRef.current.srcObject = event.streams[0];
        //   videoRef.current.play().catch(e => console.error("[WebRTC] Autoplay ditolak browser:", e));
        // }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit('ice-candidate', { droneId, candidate: event.candidate });
    };

    socket.emit('join-room', { droneId, role: 'operator' });
    setTimeout(() => socket.emit('sdp-message', { droneId, sdp: { type: 'request-offer' } }), 500);

    socket.on('sdp-message', async (sdpData) => {
      if (sdpData && sdpData.type === 'offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdpData));
          isRemoteSet = true;
          pendingCandidates.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)));
          pendingCandidates = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('sdp-message', { droneId, sdp: { type: pc.localDescription?.type, sdp: pc.localDescription?.sdp } });
        } catch (error) { console.error("[WebRTC] Gagal memproses SDP Offer:", error); }
      }
    });

    socket.on('ice-candidate', async (candidateData) => {
      try {
        if (candidateData) {
          const candidateStr = typeof candidateData === 'string' ? candidateData : candidateData.candidate;
          if (candidateStr) {
            if (isRemoteSet) await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            else pendingCandidates.push(candidateData);
          }
        }
      } catch (e) { console.error('[WebRTC] Gagal menambahkan ICE candidate', e); }
    });

    return () => {
      pc.close();
      socket.disconnect();
      setIsVideoActive(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [droneOn, droneId]);

  // Hook Stream: Selalu pasang ulang stream saat komponen Video ter-remount pasca-Swap
  useEffect(() => {
    if (isVideoActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(e => console.error("[WebRTC Reattach] Gagal memutar video:", e));
    }
  }, [mainView, isVideoActive]); // Triggers every time views are swapped

  // Handler Gambar yang Masuk dari WebRTC/SSE
  useEffect(() => {
    if (isWaitingSnapshot && latestSnapshot && latestSnapshot.imageUrl) {

      const currentImgUrl = latestSnapshot.imageUrl;

      if (currentImgUrl === lastProcessedImgRef.current) {
        return; 
      }

      lastProcessedImgRef.current = currentImgUrl;

      setIsWaitingSnapshot(false);
      setIsAnalyzing(true);
      
      setCurrentSnapshotImg(currentImgUrl);
      setSnapshotFlash(true);
      setTimeout(() => setSnapshotFlash(false), 300);

      // Integration PredictionAI
      const fetchPredictionAI = async () => {
        try {

          // Analyze Snapshot: Pra-Pemrosesan (YOLOv4 OpenVINO Cropping, NDVI, RG, RGR)
          const analyzeRes = await fetch('/api/operator/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              droneId: droneId,
              snapshotRAW: currentImgUrl, 
            })
          });

          if (!analyzeRes.ok) throw new Error("Gagal melakukan analyzeRes");
          const analyzeData = await analyzeRes.json();
          const praAnalyze = analyzeData.data;

          // Prediction: Classification (Klasifikasi CNN .keras)
          const predictionRes = await fetch('/api/operator/prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              droneId: droneId,
              snapshotRAW: praAnalyze.snapshotRAW,
              snapshotNDVI: praAnalyze.snapshotNDVI,
              snapshotRG: praAnalyze.snapshotRG,
              snapshotRGR: praAnalyze.snapshotRGR,
              classification: praAnalyze.classification, 
              ndviRAW: praAnalyze.ndviRAW,
              ndviAI: praAnalyze.ndviAI,

              latitudeAI: currentPos.lat,
              longitudeAI: currentPos.lng,
              altitudeAI: telemetry.altitude ?? 0,
              groundSpeedAI: telemetry.groundSpeed ?? 0,
              climbRateAI: telemetry.climbRate ?? 0,
              distanceToHomeAI: distanceToDevice,
              batteryAI: telemetry.battery ?? 0,
              radioAI: telemetry.radio ?? null
            })
          });

          // [OPSIONAL] ndviRAW selagi menunggu CNN
          // if (praAnalyze && praAnalyze.ndviRAW !== undefined) {
          //    setNdviValue(praAnalyze.ndviRAW);
          // }

          if (!predictionRes.ok) throw new Error("Gagal melakukan predictionRes");
          const predictionData = await predictionRes.json();
          const finalResult = predictionData.data;

          setCurrentPredictionId(finalResult.id);

          setSnapshotCondition(finalResult.classification);
          if (finalResult.ndviAI !== undefined) {
             setNdviValue(finalResult.ndviAI);
          }

          setIsAnalyzing(false);
          lastProcessedImgRef.current = latestSnapshot.imageUrl;

          // Logika Spray (trigger CNN .keras)
          if (finalResult.classification === 'tidak_sehat') {
            setShowNozzleModal(true);
            setModalCountdown(5);
            
            let countdown = 5;
            popupHideTimerRef.current = setInterval(async () => {
              countdown -= 1;
              
              if (countdown > 0) {
                setModalCountdown(countdown);
              } else {
                clearInterval(popupHideTimerRef.current);
                setShowNozzleModal(false);
                setIsSprayingActive(true); 

                try {
                  await fetch('/api/operator/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      droneId: droneId, 
                      targetTopic: 'action', 
                      command: 'spray_on' 
                    })
                  });
                  console.log("[Command] Perintah payload berhasil dikirim");
                } catch (err) {
                  console.error("Gagal mengirim perintah payload", err);
                }
              }
            }, 1000);

          } else {
            setShowNozzleModal(false);
            setIsSprayingActive(false);
          }

        } catch (error) {
          console.error("[AI Pipeline] Kesalahan saat memproses fetchPredictionAI:", error);
          setIsAnalyzing(false);
          setSnapshotCondition('idle');
        }
      };

      fetchPredictionAI();
    }
  }, [latestSnapshot, isWaitingSnapshot, droneId, currentPos, telemetry.altitude]);
  
  // Monitor Penyemprotan Pestisida
  useEffect(() => {
    let sprayTimer: NodeJS.Timeout;

    if (isSprayingActive) {
      const initialVolume = currentTankVolume; 

      setSprayCountdown(TOTAL_SPRAY_SECONDS);
      setSprayVolume(0.0);
      setTankRemaining(Math.round((initialVolume / TANK_CAPACITY_ML) * 100));

      sprayTimer = setInterval(() => {
        setSprayCountdown(prevSec => {
          
          if (prevSec <= 1) {
            clearInterval(sprayTimer);

            const finalTankVolume = initialVolume - SPRAY_TARGET_ML;
            setCurrentTankVolume(finalTankVolume);
            setSprayVolume(SPRAY_TARGET_ML);       
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
                  predictionId: currentPredictionId,
                  durationSpray: TOTAL_SPRAY_SECONDS,
                  volumeSpray: SPRAY_TARGET_ML,
                  capacityTank: TANK_CAPACITY_ML,
                  remainingTank: finalTankVolume
                })
              }).then(res => console.log("Data /spray tersimpan di DB"))
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
    } else {
      setSprayCountdown(0);
      setSprayVolume(0.0);
    }

    return () => clearInterval(sprayTimer);
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
      latStr: currentLatStr,
      lngStr: currentLngStr,
      altStr: droneOn ? `${(telemetry.altitude ?? 0).toFixed(2)} m` : '0.00 m',
    });
  };

  // Basic Timers
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


  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleMouseInteraction = (target: 'main' | 'mini') => {
    setSwapHoverTarget(null);
    
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    idleTimerRef.current = setTimeout(() => {
      setSwapHoverTarget(target);
    }, 3000); 
  };

  const handleMouseLeave = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setSwapHoverTarget(null);
  };

  const toggleView = () => {
    setMainView(prev => prev === 'camera' ? 'map' : 'camera');
    setSwapHoverTarget(null);
  };

  // Helper untuk Me-render Kanvas
  const renderVideoCanvas = () => (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center pointer-events-none">
      {droneOn && isVideoActive ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-auto"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
          <Radio size={32} className="animate-pulse opacity-50" />
          <span className="text-xs">Kamera Offline</span>
        </div>
      )}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#84CC16]" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#84CC16]" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#84CC16]" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#84CC16]" />

      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono text-[#86EFAC] z-50">
        {currentLatStr} {currentLngStr} · ALT {droneOn ? (telemetry.altitude ?? 0).toFixed(2) : '0.00'} m
      </div>

      {snapshotFlash && <div className="absolute inset-0 bg-white/80 transition-opacity duration-200 z-[60]" />}
    </div>
  );

  const activeRCMode = useMemo(() => {
    if (telemetry.rc?.ch8 === 'MODE_HIGH' || telemetry.rc?.ch8 === 'ON') return 'RTL';
    if (telemetry.rc?.ch7 === 'MODE_HIGH' || telemetry.rc?.ch7 === 'ON') return 'AUTO';
    if (telemetry.rc?.ch6 === 'MODE_HIGH' || telemetry.rc?.ch6 === 'ON') return 'LOITER';
    if (telemetry.rc?.ch9 === 'MODE_HIGH' || telemetry.rc?.ch9 === 'ON') return 'SPRAY';
    
    return 'MODE RC OFF';
  }, [telemetry.rc]);

  return (
    <div className="w-full space-y-4 max-w-[1400px] mx-auto text-gray-800 dark:text-gray-100 select-none pb-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* AREA LAYOUT KIRI */}
        <div className="lg:col-span-8 w-full min-w-0 bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden flex flex-col justify-between">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-[#222]">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-pulse" /> */}
              <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">Live Camera</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 font-medium">{timeStr}</span>
              <span className={`px-2.5 py-0.5 font-bold text-[11px] rounded tracking-wide transition-colors ${
              (!droneOn || !isVideoActive)
                ? 'bg-[#FCE8E6] text-[#C84030] dark:bg-[#2e1513] dark:text-[#f87171]'
                : 'bg-[#EAF5D6] text-[#5D7E2A] dark:bg-[#1c2c10] dark:text-[#84cc16]'
              }`}>
                {(!droneOn || !isVideoActive) ? 'OFFLINE' : 'LIVE'}
              </span>

              {/* Badge Mode RC Dinamis */}
              <span className={`px-2.5 py-0.5 font-bold text-[11px] rounded tracking-wide transition-colors ${
                activeRCMode === 'MODE RC OFF'
                  ? 'bg-gray-100 text-gray-500 dark:bg-[#262626] dark:text-gray-400'
                  : activeRCMode === 'RTL'
                    ? 'bg-[#FCE8E6] text-[#C84030] dark:bg-[#2e1513] dark:text-[#f87171]'
                    : 'bg-[#D8EFEB] text-[#23816F] dark:bg-[#13332d] dark:text-[#5eead4]'
              }`}>
                {activeRCMode}
              </span>
            </div>
          </div>

          <div 
            className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] bg-black overflow-hidden"
            onMouseEnter={() => handleMouseInteraction('main')}
            onMouseMove={() => handleMouseInteraction('main')}
            onMouseLeave={handleMouseLeave}
          >
            {mainView === 'camera' ? renderVideoCanvas() : renderMapCanvas()}

            {/* Overlay: Swap Kiri */}
            <div 
              className={`absolute inset-0 z-[100] cursor-pointer bg-black/20 flex items-center justify-center transition-all duration-300 ${swapHoverTarget === 'main' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              onClick={toggleView}
            >
               <span className="bg-black/70 dark:bg-black/90 dark:text-white text-white font-medium text-xs px-4 py-2 rounded backdrop-blur-md shadow-xl flex items-center gap-2 border border-gray-200">
                 Tap to swap views
               </span>
            </div>
          </div>

          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111]">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Battery size={16} className="text-gray-500" />
                <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{droneOn ? (telemetry.battery ?? 0).toFixed(0) : '0'}%</span>
              </div>
              
              <div className="flex items-center gap-1.5 font-medium">
                <Wifi size={16} className="text-gray-500" />
                {droneOn && telemetry?.radio?.rssi !== undefined ? (
                  <span className={`font-mono font-semibold ${
                    telemetry.radio.rssi > 150 ? 'text-[#5D7E2A] dark:text-[#84cc16]' : 
                    telemetry.radio.rssi > 90 ? 'text-amber-600 dark:text-amber-500' : 
                    'text-[#C84030] dark:text-red-500'
                  }`}>
                    {Math.round((telemetry.radio.rssi / 254) * 100)}%
                  </span>
                ) : (
                  <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
                    0%
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleSnapshot}
              disabled={!droneOn || !isVideoActive || isAnalyzing || isWaitingSnapshot || !droneId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-xs ml-auto ${
                (!droneOn || !isVideoActive) 
                  ? 'bg-gray-400 dark:bg-gray-700 opacity-50 cursor-not-allowed' // Style saat offline/kamera mati
                  : (isAnalyzing || isWaitingSnapshot || !droneId)
                    ? 'bg-amber-600 opacity-90 cursor-wait'
                    : 'bg-[#5F802A] hover:bg-[#506D23] active:scale-95 cursor-pointer'
              }`}
            >
              <Camera size={15} className={(isAnalyzing || isWaitingSnapshot) ? 'animate-spin' : ''} />
              <span>
                {!droneOn || !isVideoActive 
                  ? 'Kamera Offline' 
                  : isWaitingSnapshot 
                    ? 'Menangkap Gambar...' 
                    : isAnalyzing 
                      ? 'Memproses AI (3s)...' 
                      : 'Ambil Snapshot'}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 w-full min-w-0 flex flex-col gap-4 bg-white dark:bg-[#111] ">
          
          {/* AREA LAYOUT KANAN */}
          <div 
            className="h-[250px] w-full relative overflow-hidden rounded-xl border border-gray-100 dark:border-[#222] shadow-xs bg-white dark:bg-[#111]"
            onMouseEnter={() => handleMouseInteraction('mini')}
            onMouseMove={() => handleMouseInteraction('mini')}
            onMouseLeave={handleMouseLeave}
          >
            {mainView === 'map' ? renderVideoCanvas() : renderMapCanvas()}

            {/* Overlay: Swap Kanan */}
            <div 
              className={`absolute inset-0 z-[100] cursor-pointer bg-black/20 flex items-center justify-center transition-all duration-300 ${swapHoverTarget === 'mini' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              onClick={toggleView}
            >
               <span className="bg-white/90 dark:bg-black/70 text-gray-800 dark:text-white font-medium text-xs px-3 px-4 py-2 rounded backdrop-blur-md shadow-xl flex items-center gap-2 dark-border border-gray-200">
                 Tap to swap views
               </span>
            </div>
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


      {/* AREA SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full min-w-0 bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden flex flex-col justify-between">
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

        {/* AI Monitor */}
        <div className={`w-full min-w-0 rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-colors duration-300 ${
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

          {/* loading AI dummy */}
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