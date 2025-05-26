import React, { useState } from 'react';
import axios from 'axios';

function ImageForgeryDetector() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Image Forgery Detector</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="file-input">
          <input 
            type="file" 
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label htmlFor="image-upload">
            {file ? file.name : "Choose an image..."}
          </label>
        </div>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
        
        <button type="submit" disabled={loading || !file}>
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className={`result ${result.toLowerCase()}`}>
          <h2>Result: {result}</h2>
        </div>
      )}
      
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .file-input {
          margin: 20px 0;
        }
        
        .file-input input[type="file"] {
          display: none;
        }
        
        .file-input label {
          display: inline-block;
          padding: 10px 15px;
          background: #4CAF50;
          color: white;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .image-preview {
          margin: 20px 0;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 300px;
          border: 1px solid #ddd;
        }
        
        button {
          padding: 10px 20px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        
        .error {
          color: #f44336;
          margin: 10px 0;
        }
        
        .result {
          margin: 20px 0;
          padding: 15px;
          border-radius: 4px;
          font-weight: bold;
          text-align: center;
        }
        
        .result.fake {
          background-color: #ffebee;
          color: #f44336;
        }
        
        .result.real {
          background-color: #e8f5e9;
          color: #4CAF50;
        }
      `}</style>
    </div>
  );
}

export default ImageForgeryDetector;