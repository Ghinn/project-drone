import tensorflow as tf
import numpy as np
from PIL import Image
from pathlib import Path
import sys
import json
import os

# ============================================================
# PATH MODEL (MENGGUNAKAN ABSOLUTE PATH DINAMIS)
# ============================================================
# Mendapatkan direktori absolut tempat script backend_ML.py ini berada
script_dir = os.path.dirname(os.path.abspath(__file__))

# Menggabungkan direktori script dengan nama file model
MODEL_PATH = os.path.join(script_dir, "best_CNN_Mavix3_final.keras")

# ============================================================
# MODE EKSEKUSI & IMAGE PATH
# ============================================================
# Deteksi apakah ada argumen path gambar dari server Node.js / Snapshot Button
is_api_mode = len(sys.argv) > 1

if is_api_mode:
    # Menggunakan path gambar dinamis dari request API
    IMAGE_PATH = sys.argv[1]
else:
    # ============================================================
    # DUMMY PATH (Testing Manual Tanpa API)
    # ============================================================
    # Disesuaikan juga menggunakan path absolut
    IMAGE_PATH = os.path.join(script_dir, "dataset_CNN_Mavix3_FINAL/SEHAT/P_014.png")

try:
    # ============================================================
    # LOAD MODEL & IMAGE
    # ============================================================
    model = tf.keras.models.load_model(MODEL_PATH)

    img = Image.open(IMAGE_PATH).convert("RGB")
    img = img.resize((224, 224))

    arr = np.array(img).astype(np.float32)

    # Channel CNN
    RED   = arr[:, :, 0]
    GREEN = arr[:, :, 1]
    NIR   = arr[:, :, 2]

    # ============================================================
    # STATISTIK BAND & NDVI
    # ============================================================
    red_mean = np.mean(RED)
    green_mean = np.mean(GREEN)
    nir_mean = np.mean(NIR)

    denom = nir_mean + red_mean
    ndvi_mean = (nir_mean - red_mean) / denom if denom != 0 else np.nan

    # ============================================================
    # PREDIKSI CNN
    # ============================================================
    cnn_input = arr / 255.0
    cnn_input = np.expand_dims(cnn_input, axis=0)

    prob_tidak_sehat = float(model.predict(cnn_input, verbose=0)[0][0])
    prob_sehat = 1.0 - prob_tidak_sehat

    label = "TIDAK_SEHAT" if prob_tidak_sehat >= 0.5 else "SEHAT"

    # ============================================================
    # OUTPUT / RESPON
    # ============================================================
    if is_api_mode:
        # Output format JSON agar Node.js (Port 4000) bisa parsing datanya
        result = {
            "ndvi": round(float(ndvi_mean), 4) if not np.isnan(ndvi_mean) else 0.0,
            "label": label,
            "probabilitas_sehat": round(prob_sehat, 6),
            "probabilitas_tidak_sehat": round(prob_tidak_sehat, 6)
        }
        print(json.dumps(result))
    else:
        # Output terminal biasa saat mengeksekusi dummy manual
        print("=== NILAI BAND ===")
        print(f"Red   : {red_mean:.4f}")
        print(f"Green : {green_mean:.4f}")
        print(f"NIR   : {nir_mean:.4f}")

        print("\n=== NDVI ===")
        print(f"NDVI  : {ndvi_mean:.4f}")

        print("\n=== CNN ===")
        print(f"Probabilitas SEHAT       : {prob_sehat:.6f} ({prob_sehat*100:.2f}%)")
        print(f"Probabilitas TIDAK_SEHAT : {prob_tidak_sehat:.6f} ({prob_tidak_sehat*100:.2f}%)")
        print(f"Prediksi                 : {label}")

except Exception as e:
    if is_api_mode:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    else:
        print(f"Terjadi kesalahan pada script: {str(e)}")