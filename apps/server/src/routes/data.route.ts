import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    getDashboardData, 
    getDataLogs, 
    getDataStats,
    streamTelemetrySSE
} from '../controllers/data.controller';
import { requireSession } from '../middleware/auth.middleware';
import { broadcastToDrone } from '../services/sse.service'; 

const router = Router();

// Path Penyimpanan
const snapshotDir = path.join(__dirname, '../../../client/public/snapshots');

if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, snapshotDir);
    },
    filename: function (req, file, cb) {
        const droneId = req.body.droneId || 'unknown';
        cb(null, `snapshot-${droneId}-${Date.now()}.png`);
    }
});

const upload = multer({ storage: storage });

// RPi akan menembak ke POST /api/data/snapshot/upload
router.post('/snapshot/upload', upload.single('image'), (req, res) => {
    try {
        const { droneId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada gambar yang diunggah' });
        }

        const fileName = req.file.filename;
        const publicUrl = `/snapshots/${fileName}`;

        console.log(`[Backend] Menerima snapshot RAW baru dari Drone ${droneId}: ${fileName}`);

        // Broadcast SSE ke Frontend agar UI Canvas langsung me-render gambar
        broadcastToDrone(droneId, {
            type: 'snapshot:new',
            data: {
                imageUrl: publicUrl,
                timestamp: new Date()
            }
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Snapshot berhasil disimpan',
            imageUrl: publicUrl
        });

    } catch (error) {
        console.error('[Backend] Gagal memproses snapshot:', error);
        return res.status(500).json({ error: 'Gagal memproses snapshot' });
    }
});

router.use(requireSession);

// Mendefinisikan endpoint untuk masing-masing halaman frontend
router.get('/dashboard', getDashboardData);
router.get('/histori', getDataLogs);
router.get('/analisis', getDataStats);
router.get('/stream', streamTelemetrySSE); 

export default router;