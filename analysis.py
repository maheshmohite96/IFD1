# analysis.py
import cv2 # type: ignore
import numpy as np # type: ignore
from PIL import Image # type: ignore
import io
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.preprocessing import image # type: ignore

# Error Level Analysis (ELA)
def perform_ela(image_path, quality=90):
    original = Image.open(image_path)
    
    buffer = io.BytesIO()
    original.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    compressed = Image.open(buffer)
    
    ela_image = np.array(original) - np.array(compressed)
    ela_image = ela_image.clip(0, 255).astype('uint8')
    
    return ela_image, np.mean(ela_image)

# CNN Prediction (you'll need to add a model file)
def predict_with_cnn(image_path):
    # Load pre-trained model (place model file in project root)
    model = load_model('forgery_detection_model.h5')  
    
    img = image.load_img(image_path, target_size=(256, 256))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    
    prediction = model.predict(img_array)
    return prediction[0][0]