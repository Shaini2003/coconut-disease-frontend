# ML_Model/app.py
# COMPLETE FIX: Multi-factor image validation to reject non-coconut-leaf images

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import json
import uuid
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# ── Load model ────────────────────────────────────────────────────────────────
MODEL_PATH = './coconut_disease_model.keras'
print("🔄 Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded!")

with open('./class_names.json', 'r') as f:
    CLASS_NAMES = json.load(f)
print(f"✅ Classes: {CLASS_NAMES}")

# ── Recommendations ───────────────────────────────────────────────────────────
RECOMMENDATIONS = {
    'Bud Root Dropping': {
        'recommendation': 'Remove severely affected fronds. Apply systemic fungicide (Metalaxyl). Improve soil drainage. Avoid water stagnation near tree base.',
        'fertilizer':     'Apply potassium-rich fertilizer (MOP 0-0-60). Avoid excess nitrogen.',
        'severity':       'High'
    },
    'Bud Rot': {
        'recommendation': 'URGENT! Remove and destroy infected bud tissue. Apply Bordeaux mixture (1%) to crown. Avoid wetting crown during irrigation. Consult agricultural officer immediately.',
        'fertilizer':     'Apply balanced NPK with extra potassium. Avoid over-irrigation.',
        'severity':       'Critical'
    },
    'CCI_Caterpillars': {
        'recommendation': 'Apply chlorpyrifos (0.05%) spray. Use Bacillus thuringiensis (Bt) for eco-friendly treatment. Manually remove egg masses if infestation is small.',
        'fertilizer':     'Apply magnesium sulfate (1%) foliar spray to boost immunity.',
        'severity':       'Medium'
    },
    'Gray Leaf Spot': {
        'recommendation': 'Spray Mancozeb (2g/L) or Carbendazim (1g/L) every 2 weeks. Remove heavily infected leaves. Avoid overhead irrigation.',
        'fertilizer':     'Apply nitrogen fertilizer (NPK 15-15-15) for healthy new growth.',
        'severity':       'Medium'
    },
    'Healthy_Leaves': {
        'recommendation': '✅ Your coconut tree is HEALTHY! No disease detected. Continue regular care and monitoring.',
        'fertilizer':     'Apply balanced NPK 14-14-14 every 3 months.',
        'severity':       'None'
    },
    'Leaf Rot': {
        'recommendation': 'Remove all rotted leaf material immediately. Apply copper oxychloride (3g/L) fungicide. Improve air circulation and drainage.',
        'fertilizer':     'Apply calcium and phosphorus-rich fertilizer to strengthen cell walls.',
        'severity':       'High'
    },
    'Stem Bleeding': {
        'recommendation': 'URGENT! Scrape infected bark to healthy tissue. Apply Bordeaux paste on wound. Inject Metalaxyl (5ml per tree). Contact agricultural officer immediately.',
        'fertilizer':     'Avoid fertilizers until controlled. Then apply potassium-rich fertilizer.',
        'severity':       'Critical'
    },
    'WCLWD_DryingofLeaflets': {
        'recommendation': 'Weligama Coconut Leaf Wilt Disease detected! Remove severely affected palms. Apply oxytetracycline injections. Report to Coconut Research Institute Sri Lanka IMMEDIATELY.',
        'fertilizer':     'Apply zinc and boron micronutrients to slow progression.',
        'severity':       'Critical'
    }
}

def get_recommendation(disease_name):
    if disease_name in RECOMMENDATIONS:
        return RECOMMENDATIONS[disease_name]
    for key in RECOMMENDATIONS:
        if key.lower() in disease_name.lower() or disease_name.lower() in key.lower():
            return RECOMMENDATIONS[key]
    return {
        'recommendation': 'Consult an agricultural expert for diagnosis.',
        'fertilizer':     'Apply balanced NPK fertilizer.',
        'severity':       'Unknown'
    }

# ── Multi-factor image validator ──────────────────────────────────────────────
def is_coconut_leaf_image(img_array, preds):
    """
    Validates whether the uploaded image is likely a coconut leaf
    using 4 independent checks. Returns (is_valid: bool, reason: str)

    CHECK 1 - Confidence threshold: must be >= 80%
    CHECK 2 - Confidence gap: top class must dominate clearly
    CHECK 3 - Color analysis: reject blue-dominant, too dark, too bright
    CHECK 4 - Texture analysis: reject screenshots with low natural variance
    """

    top_confidence    = float(np.max(preds[0]))
    second_confidence = float(np.sort(preds[0])[-2])
    confidence_gap    = top_confidence - second_confidence

    # ── Check 1: Minimum confidence ───────────────────────────────────────────
    # A screenshot like a phone UI or Gantt chart gets ~0.88 for Healthy_Leaves
    # because the model has never seen "not a leaf" — it guesses the closest match.
    # We raise the bar to 0.85 for stricter rejection.
    if top_confidence < 0.85:
        return False, f'Confidence too low ({round(top_confidence*100,1)}%) — not a clear coconut leaf'

    # ── Check 2: Confidence gap (distribution) ────────────────────────────────
    # Real leaf: one class wins with >40% gap over second class
    # Screenshots: model spreads probability more — gap is smaller
    if confidence_gap < 0.25:
        return False, 'Model is uncertain — predictions are spread across classes, not a clear leaf'

    # ── Check 3: Color analysis ───────────────────────────────────────────────
    img_float = img_array.astype(np.float32)
    r_mean    = np.mean(img_float[:, :, 0])
    g_mean    = np.mean(img_float[:, :, 1])
    b_mean    = np.mean(img_float[:, :, 2])
    total     = r_mean + g_mean + b_mean

    if total > 0:
        b_ratio = b_mean / total
        g_ratio = g_mean / total

        # Reject blue-dominant images (phone screenshots, app UIs, sky photos)
        if b_ratio > 0.42 and g_ratio < 0.32:
            return False, 'Image appears to be a screenshot or non-plant image (blue dominant colors)'

        # Reject very dark images (dark mode screenshots, night photos)
        if total < 55:
            return False, 'Image is too dark to be a coconut leaf photo'

        # Reject very bright/white images (documents, white backgrounds)
        if total > 710:
            return False, 'Image is too bright and uniform to be a leaf photo'

    # ── Check 4: Texture/variance analysis ───────────────────────────────────
    # Natural leaf photos have complex texture (veins, spots, edges, shadows)
    # Screenshots have flat solid regions with sharp artificial edges
    gray      = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance  = laplacian.var()

    # Very low = flat screenshot/solid background
    if variance < 80:
        return False, 'Image lacks natural leaf texture — may be a screenshot or generated image'

    # ── Check 5: Saturation ───────────────────────────────────────────────────
    hsv             = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    saturation_mean = np.mean(hsv[:, :, 1])

    # Grayscale scans, documents, or B&W screenshots have near-zero saturation
    if saturation_mean < 25:
        return False, 'Image appears to be grayscale — not a leaf photo'

    return True, 'Valid coconut leaf image'


# ── Grad-CAM ──────────────────────────────────────────────────────────────────
def generate_gradcam(img_array, class_index):
    try:
        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[model.get_layer('Conv_1').output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_out, preds = grad_model(img_array)
            loss = preds[:, class_index]

        grads   = tape.gradient(loss, conv_out)
        pooled  = tf.reduce_mean(grads, axis=(0, 1, 2))
        heatmap = np.squeeze((conv_out[0] @ pooled[..., tf.newaxis]).numpy())
        heatmap = np.maximum(heatmap, 0)
        if heatmap.max() > 0:
            heatmap /= heatmap.max()
        return heatmap
    except Exception as e:
        print(f"⚠️ Grad-CAM error: {e}")
        return None


# ── GET /health ───────────────────────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({
        'status':      '✅ ML Server running',
        'model':       MODEL_PATH,
        'classes':     CLASS_NAMES,
        'num_classes': len(CLASS_NAMES)
    })


# ── POST /predict ─────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'Empty file'}), 400

    try:
        img_bytes = file.read()
        img       = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((224, 224))
        img_array = np.array(img)
        img_norm  = np.expand_dims(img_array / 255.0, axis=0).astype(np.float32)

        # Run model
        preds       = model.predict(img_norm, verbose=0)
        class_index = int(np.argmax(preds[0]))
        confidence  = float(preds[0][class_index])  # raw 0.0–1.0
        disease     = CLASS_NAMES[class_index]

        print(f"📊 Prediction: {disease} | Confidence: {round(confidence*100,2)}%")

        # ── Smart multi-factor validation ────────────────────────────────────
        is_valid, reason = is_coconut_leaf_image(img_array, preds)
        print(f"{'✅ Valid' if is_valid else '❌ Rejected'}: {reason}")

        if not is_valid:
            return jsonify({
                'error':         '⚠️ This does not appear to be a coconut leaf image. Please upload a clear photo of a coconut leaf.',
                'reason':        reason,
                'confidence':    round(confidence * 100, 2),
                'is_valid_leaf': False
            }), 422
        # ─────────────────────────────────────────────────────────────────────

        info = get_recommendation(disease)

        # All class probabilities as %
        all_probs = {
            CLASS_NAMES[i]: round(float(preds[0][i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

        # Grad-CAM
        gradcam_url = None
        heatmap = generate_gradcam(img_norm, class_index)
        if heatmap is not None:
            hm_resized = cv2.resize(heatmap, (224, 224))
            hm_colored = cv2.applyColorMap(np.uint8(255 * hm_resized), cv2.COLORMAP_JET)
            img_bgr    = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            overlay    = cv2.addWeighted(img_bgr, 0.6, hm_colored, 0.4, 0)

            os.makedirs('./gradcam_outputs', exist_ok=True)
            filename = f'{uuid.uuid4()}.jpg'
            cv2.imwrite(f'./gradcam_outputs/{filename}', overlay)
            gradcam_url = f'/gradcam/{filename}'

        return jsonify({
            'disease':           disease,
            'confidence':        confidence,       # 0.0–1.0 → backend ×100 = correct %
            'severity':          info['severity'],
            'recommendation':    info['recommendation'],
            'fertilizer':        info['fertilizer'],
            'gradcam_url':       gradcam_url,
            'all_probabilities': all_probs
        })

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


# ── GET /gradcam/<filename> ───────────────────────────────────────────────────
@app.route('/gradcam/<filename>')
def serve_gradcam(filename):
    return send_from_directory('./gradcam_outputs', filename)


# ── GET /diseases ─────────────────────────────────────────────────────────────
@app.route('/diseases')
def get_diseases():
    return jsonify({
        'diseases': [
            {'name': k, **v} for k, v in RECOMMENDATIONS.items()
        ]
    })


if __name__ == '__main__':
    os.makedirs('./gradcam_outputs', exist_ok=True)
    print("\n" + "="*50)
    print("🥥 Coconut Disease ML Server")
    print(f"   Model  : {MODEL_PATH}")
    print(f"   Classes: {len(CLASS_NAMES)}")
    print(f"   URL    : http://localhost:8000")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=8000, debug=True)