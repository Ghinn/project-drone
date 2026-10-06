import os
import sys
import logging

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

logging.getLogger('tensorflow').setLevel(logging.FATAL)

import cv2
import numpy as np
import json
import openvino as ov
import tensorflow as tf
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_MODELS_DIR = os.path.join(BASE_DIR, '../../client/public/models')

# Path Model YOLOv4 OpenVINO
YOLO_XML_PATH = os.path.join(CLIENT_MODELS_DIR, 'best_openvino_model/best.xml')
YOLO_BIN_PATH = os.path.join(CLIENT_MODELS_DIR, 'best_openvino_model/best.bin')

# Path Model CNN (.keras)
KERAS_MODEL_PATH = os.path.join(CLIENT_MODELS_DIR, 'cnn_sawit_best.keras')
cnn_classifier = load_model(KERAS_MODEL_PATH)

def process_and_extract_ndvi(image_path):
    # Baca Gambar Mentah (RAW)
    # OpenCV otomatis membaca dalam format B-G-R
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Gambar tidak ditemukan di path: {image_path}")

    h, w, _ = img.shape
    size = min(h, w)
    start_x = (w - size) // 2
    start_y = (h - size) // 2
    cropped_img = img[start_y:start_y+size, start_x:start_x+size]
    img_720 = cv2.resize(cropped_img, (720, 720))

    # Ekstraksi Channel RGN -> NDVI, RG, RGR (Seperti kode sebelumnya)
    b_nir, g_green, r_red = cv2.split(img_720)
    nir = b_nir.astype(np.float32)
    red = r_red.astype(np.float32)

    epsilon = 1e-8
    ndvi_matrix = (nir - red) / (nir + red + epsilon)
    avg_ndvi = np.mean(ndvi_matrix)

    client_snapshots_dir = os.path.join(BASE_DIR, '../../client/public/snapshots')
    os.makedirs(client_snapshots_dir, exist_ok=True)

    base_dir, filename = os.path.split(image_path)
    name, ext = os.path.splitext(filename)
    
    ndvi_filename = f"{name}_ndvi.png"
    rg_filename = f"{name}_rg.png"
    rgr_filename = f"{name}_rgr.png"

    ndvi_path = os.path.join(client_snapshots_dir, ndvi_filename)
    rg_path = os.path.join(client_snapshots_dir, rg_filename)
    rgr_path = os.path.join(client_snapshots_dir, rgr_filename)

    # Generate format visual
    ndvi_norm = ((ndvi_matrix + 1) / 2 * 255).astype(np.uint8)
    ndvi_colormap = cv2.applyColorMap(ndvi_norm, cv2.COLORMAP_JET)
    zeros = np.zeros_like(b_nir)
    rg_img = cv2.merge([zeros, g_green, r_red])
    rgr_img = cv2.merge([r_red, g_green, r_red])

    cv2.imwrite(ndvi_path, ndvi_colormap)
    cv2.imwrite(rg_path, rg_img)
    cv2.imwrite(rgr_path, rgr_img)

    # Models CNN (.keras)
    try:
        # Resize gambar RGR ke dimensi input model (Sesuaikan jika model butuh 224x224 atau 720x720)
        img_keras = cv2.resize(rgr_img, (720, 720)) 
        
        # Normalisasi dan tambahkan batch dimension
        img_keras = np.expand_dims(img_keras, axis=0).astype(np.float32) / 255.0
        
        # Lakukan Prediksi
        prediction = cnn_classifier.predict(img_keras, verbose=0)
        
        # Ekstraksi Output:
        if isinstance(prediction, list):
            # Jika model multi-output
            probabilitas = float(prediction[0][0][0])
            ndvi_ai_val = float(prediction[1][0][0])
        else:
            # Jika model single/array-output
            probabilitas = float(prediction[0][0])
            # Ambil index ke-1 untuk ndviAI (jika ada), jika tidak, gunakan nilai probabilitas mentah sebagai ndviAI
            ndvi_ai_val = float(prediction[0][1]) if prediction.shape[1] > 1 else float(prediction[0][0])

        # Logika threshold kelas (misal >= 0.5 adalah tidak_sehat)
        classification_res = "tidak_sehat" if probabilitas >= 0.5 else "sehat"

        # testing spray
        # classification_res = "tidak_sehat"
        
        # Nilai ndviAI diambil langsung dari model sesuai permintaan Anda
        ndvi_ai = round(ndvi_ai_val, 2)

    except Exception as e:
        classification_res = "sehat"
        # classification_res = "tidak_sehat"
        ndvi_ai = 0.0

    # 8. Kembalikan Output ke Node.js dalam format JSON
    result = {
        "success": True,
        "ndviRAW": round(float(avg_ndvi), 2),
        "ndviAI": ndvi_ai, 
        "classification": classification_res,
        "snapshotNDVI": f"/snapshots/{ndvi_filename}",
        "snapshotRG": f"/snapshots/{rg_filename}",
        "snapshotRGR": f"/snapshots/{rgr_filename}"
    }
    
    # Print ke stdout agar Node.js bisa membacanya via child_process
    print(json.dumps(result))

if __name__ == "__main__":
    try:
        raw_image_path = sys.argv[1]
        process_and_extract_ndvi(raw_image_path)
    except Exception as e:
        error_result = {"success": False, "error": str(e)}
        print(json.dumps(error_result))
        sys.exit(1)