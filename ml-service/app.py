"""
ML Service for AgroVision - Crop Price Forecasting API
This service provides AI-powered price predictions using LSTM and Prophet models.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from predictor import CropPricePredictor

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize predictor
predictor = CropPricePredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-service',
        'models_loaded': predictor.is_loaded()
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict crop prices for specified time horizons

    Request body:
    {
        "crop_id": "wheat",
        "price_history": [{"date": "2024-01-01", "price": 250.5}, ...],
        "horizon": "7d"  # or "30d" or "both"
    }
    """
    try:
        data = request.get_json()

        # Validate input
        if not data or 'price_history' not in data:
            return jsonify({
                'error': 'Missing required field: price_history'
            }), 400

        crop_id = data.get('crop_id', 'unknown')
        price_history = data['price_history']
        horizon = data.get('horizon', 'both')

        # Get predictions
        predictions = predictor.predict(price_history, horizon)

        return jsonify({
            'success': True,
            'crop_id': crop_id,
            'predictions': predictions
        }), 200

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """
    Train models on new data

    Request body:
    {
        "data_path": "/path/to/training/data.csv",
        "model_type": "lstm"  # or "prophet" or "both"
    }
    """
    try:
        data = request.get_json()
        data_path = data.get('data_path')
        model_type = data.get('model_type', 'both')

        if not data_path:
            return jsonify({
                'error': 'Missing required field: data_path'
            }), 400

        # Train the model
        result = predictor.train(data_path, model_type)

        return jsonify({
            'success': True,
            'message': 'Model training completed',
            'details': result
        }), 200

    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    try:
        info = predictor.get_model_info()
        return jsonify({
            'success': True,
            'info': info
        }), 200
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    logger.info(f"Starting ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
