export interface NDVIPredictionResult {
  success: boolean;
  filename: string;
  modelName: string;
  modelStatus: string;
  classification: "Sehat" | "Terserang";
  classIndex: 0 | 1;
  scoreTerserang: number;
  scoreSehat: number;
  predictionScore: number;
  scoreCalibrated: boolean;
  threshold: number;
  ndvi: number | null;
  bands: {
    green: number | null;
    red: number | null;
    nir: number | null;
  };
  validPixelPercentage: number;
  inputShape: number[];
  snapshotThumbnail: string;
  snapshotNDVI: string;
  radiometricMode: string;
  radiometricValidated: boolean;
  physicalCoverageTargetMeters: number;
  physicalCoverageValidated: boolean;
  automaticSprayingAllowed: boolean;
}

export interface MapirHealthResponse {
  drone_id?: string;
  raspberry_pi: string;
  mapir: {
    ready: boolean;
    ip?: string;
  };
  capture_busy: boolean;
}
