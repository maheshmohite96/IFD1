from flask import Flask, request, jsonify, render_template # type: ignore
import os
from werkzeug.utils import secure_filename # type: ignore
from datetime import datetime
import sqlite3
from analysis import perform_ela, predict_with_cnn  # assuming these are in analysis.py
from analysis import perform_ela, predict_with_cnn

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database setup
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            ela_score REAL,
            cnn_prediction REAL,
            final_verdict TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Perform analysis
        ela_image, ela_score = perform_ela(filepath)
        cnn_prediction = predict_with_cnn(filepath)
        
        # Determine verdict (thresholds can be adjusted)
        verdict = "Fake" if ela_score > 15 or cnn_prediction > 0.7 else "Real"
        
        # Store results in database
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO analyses (filename, upload_date, ela_score, cnn_prediction, final_verdict) VALUES (?, ?, ?, ?, ?)',
            (filename, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), ela_score, cnn_prediction, verdict)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'filename': filename,
            'ela_score': ela_score,
            'cnn_prediction': float(cnn_prediction),
            'verdict': verdict
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    
    
    
@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Debug: Log file save
            print(f"File saved to: {filepath}")
            
            ela_image, ela_score = perform_ela(filepath)
            cnn_prediction = predict_with_cnn(filepath)  # or mock value
            
            verdict = "Fake" if ela_score > 15 or cnn_prediction > 0.7 else "Real"
            
            # Debug: Log results
            print(f"ELA Score: {ela_score}, CNN: {cnn_prediction}, Verdict: {verdict}")
            
            return jsonify({
                'filename': filename,
                'ela_score': ela_score,
                'cnn_prediction': float(cnn_prediction),
                'verdict': verdict
            })
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        print(f"Error in analyze_image: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    
# Ensure upload folder exists
os.makedirs("static/uploads", exist_ok=True)

def predict_with_cnn(image_path):
    return 0.75  # Mock value (0=real, 1=fake)



from app import init_db
init_db()

@app.route('/history')
def history():
    conn = get_db_connection()
    analyses = conn.execute('SELECT * FROM analyses ORDER BY upload_date DESC').fetchall()
    conn.close()
    return render_template('history.html', analyses=analyses) 