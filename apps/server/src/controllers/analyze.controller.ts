import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

export const saveAnalyzeSnapshot = asyncHandler(async (req: any, res: any) => {
  const currentUser = req.currentUser;
  const { droneId, snapshotRAW } = req.body;

  console.log("[Analyze Debug] Menerima snapshotRAW:", typeof snapshotRAW, snapshotRAW ? snapshotRAW.substring(0, 50) : 'KOSONG/NULL');

  if (!currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!snapshotRAW || !droneId) {
    return res.status(400).json({ error: "Data gambar RAW tidak lengkap" });
  }

  try {

    let absoluteFilePath = '';
    let imageUrl = snapshotRAW;
    let imagePathToProcess = snapshotRAW;

    // Ekstraksi Path jika dikirim sebagai Full URL (http://...)
    if (imagePathToProcess.startsWith('http')) {
      try {
        const parsedUrl = new URL(imagePathToProcess);
        // Mengekstrak '/uploads/snapshot-v1-...' dari URL penuh
        imagePathToProcess = parsedUrl.pathname; 
      } catch (err) {
        console.warn("Gagal melakukan parse URL snapshotRAW:", err);
      }
    }

    // Cek tipe payload gambar
    if (imagePathToProcess.startsWith('data:image')) {
      const base64Data = imagePathToProcess.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `raw-${Date.now()}-${uuidv4().substring(0, 6)}.jpg`;
      
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      absoluteFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(absoluteFilePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    } 
    else if (imagePathToProcess.startsWith('/uploads/')) {
      absoluteFilePath = path.join(__dirname, '../../public', imagePathToProcess);
    }
    else if (imagePathToProcess.startsWith('/snapshots/')) {
      absoluteFilePath = path.join(__dirname, '../../../client/public', imagePathToProcess);
    }
    else {
      const uploadDir = path.join(__dirname, '../../public/uploads');
      absoluteFilePath = path.join(uploadDir, path.basename(imagePathToProcess));
      imageUrl = `/uploads/${path.basename(imagePathToProcess)}`;
    }

    // Pastikan fisik filenya benar-benar ada di server sebelum dilempar ke Python
    if (!fs.existsSync(absoluteFilePath)) {
      // Fallback tambahan: Coba cari langsung di public/snapshots jika belum ketemu
      const altPath = path.join(__dirname, '../../public/snapshots', path.basename(imagePathToProcess));
      if (fs.existsSync(altPath)) {
        absoluteFilePath = altPath;
      } else {
        console.error("[Analyze Error] File fisik tidak ditemukan di path manapun:", absoluteFilePath);
        return res.status(404).json({ error: "File gambar fisik tidak ditemukan di server" });
      }
    }

    // Eksekusi Script Python
    const pythonScriptPath = path.join(__dirname, '../../scripts/process-snapshot.py');
    const pythonProcess = spawn('python', [pythonScriptPath, absoluteFilePath]);

    let pythonOutput = '';
    
    // Tangkap data dari print(json.dumps(...)) di Python
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Python Stderr]: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Gagal memproses gambar pada mesin Python" });
      }

      try {
        
        // 1. CEK OUTPUT MENTAH DARI PYTHON
        console.log("[Analyze Debug] Output Mentah Python:", pythonOutput);

        const parsedOutput = JSON.parse(pythonOutput);
        
        // 2. CEK HASIL PARSING
        console.log("[Analyze Debug] Parsed Output:", parsedOutput);
        
        if (!parsedOutput.success) {
          return res.status(500).json({ error: parsedOutput.error });
        }

        const finalData = {
          snapshotRAW: imageUrl,
          snapshotNDVI: parsedOutput.snapshotNDVI,
          snapshotRG: parsedOutput.snapshotRG,
          snapshotRGR: parsedOutput.snapshotRGR,
          ndviRAW: parsedOutput.ndviRAW,
          ndviAI: parsedOutput.ndviAI,
          classification: parsedOutput.classification
        };

        return res.status(200).json({
          success: true,
          data: finalData,
          message: "Pra-pemrosesan YOLOv4 dan Ekstraksi NDVI berhasil"
        });

      } catch (parseError) {
        console.error("Gagal parse output Python:", parseError);
        return res.status(500).json({ error: "Gagal membaca hasil analisis Python" });
      }
    });

  } catch (error) {
    console.error("[Analyze AI] Error:", error);
    return res.status(500).json({ error: "Gagal memproses Analyze AI" });
  }
});