# AgroVision ML Service

AI-powered crop price forecasting service using LSTM and Prophet models.

## Features

- **LSTM Neural Network**: Deep learning model for time-series price prediction
- **Prophet Model**: Facebook's forecasting tool for trend and seasonality analysis
- **Statistical Fallback**: Moving average forecasting when models aren't trained
- **RESTful API**: Easy integration with Node.js backend
- **Kaggle Integration**: Download and train on real agricultural datasets

## Quick Start

### 1. Installation

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional)
nano .env
```

### 3. Train Models

#### Option A: Generate Sample Data (Recommended for testing)

```bash
python train_model.py --generate-sample --model-type both
```

#### Option B: Use Kaggle Dataset

First, set up Kaggle API credentials:

```bash
# 1. Go to https://www.kaggle.com/account
# 2. Create API token (downloads kaggle.json)
# 3. Place it in ~/.kaggle/
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

Then download and train:

```bash
# Example with agricultural price dataset
python train_model.py --dataset "pateljay731/indian-cereals-production" --model-type both
```

Popular Kaggle datasets for agricultural forecasting:
- `pateljay731/indian-cereals-production`
- `kianwee/agricultural-raw-material-prices-19902020`
- `prasad22/commodity-prices-data-set`
- `saurabhshahane/agriculture-export-data`

#### Option C: Use Your Own Data

Prepare a CSV file with columns: `date`, `price`, and optionally `crop_name`, `region`

```bash
python train_model.py --data-path /path/to/your/data.csv --model-type both
```

### 4. Start the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "models_loaded": true
}
```

### Make Predictions

```bash
POST /predict
Content-Type: application/json

{
  "crop_id": "wheat",
  "price_history": [
    {"date": "2024-01-01", "price": 250.5},
    {"date": "2024-01-02", "price": 252.0},
    ...
  ],
  "horizon": "both"
}
```

Response:
```json
{
  "success": true,
  "crop_id": "wheat",
  "predictions": {
    "current_price": 252.0,
    "algorithm": "lstm_neural_network",
    "trend": "up",
    "7d": {
      "predicted_price": 258.3,
      "confidence": 85.0,
      "change_percent": 2.5
    },
    "30d": {
      "predicted_price": 265.7,
      "confidence": 72.0,
      "change_percent": 5.4
    }
  }
}
```

### Model Information

```bash
GET /model/info
```

Response:
```json
{
  "success": true,
  "info": {
    "lstm_loaded": true,
    "prophet_loaded": true,
    "scaler_loaded": true,
    "models_directory": "models",
    "status": "ready"
  }
}
```

### Train Model

```bash
POST /train
Content-Type: application/json

{
  "data_path": "/path/to/training/data.csv",
  "model_type": "both"
}
```

## Integration with Node.js Backend

Add to your Node.js backend (`backend/src/routes/crops.js`):

```javascript
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// In your prediction endpoint:
router.get('/:id/prediction', async (req, res) => {
  try {
    const cropId = req.params.id;

    // Fetch price history from database
    const priceHistory = await PriceHistory.findByCropId(cropId);

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      crop_id: cropId,
      price_history: priceHistory,
      horizon: 'both'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error);
    // Fallback to simple prediction
    res.json(/* fallback response */);
  }
});
```

## Model Details

### LSTM Architecture

- **Input Layer**: 30-day price sequence
- **LSTM Layer 1**: 64 units with dropout (0.2)
- **LSTM Layer 2**: 32 units with dropout (0.2)
- **Dense Layer**: 16 units (ReLU activation)
- **Output Layer**: Single price prediction
- **Optimizer**: Adam
- **Loss Function**: Mean Squared Error (MSE)

### Prophet Configuration

- Daily, weekly, and yearly seasonality
- Automatic changepoint detection
- Handles holidays and special events
- Robust to missing data

### Statistical Fallback

When models aren't trained, the service uses:
- 7-day, 14-day, and 30-day moving averages
- Trend analysis
- Volatility-based confidence scoring

## Development

### Project Structure

```
ml-service/
├── app.py              # Flask API server
├── predictor.py        # ML prediction logic
├── train_model.py      # Model training script
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
├── README.md           # Documentation
├── models/             # Trained models directory
│   ├── lstm_model.h5
│   ├── prophet_model.pkl
│   └── scaler.pkl
└── data/               # Training data directory
    └── crop_prices.csv
```

### Testing

```bash
# Test health endpoint
curl http://localhost:5001/health

# Test prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crop_id": "wheat",
    "price_history": [
      {"date": "2024-01-01", "price": 250},
      {"date": "2024-01-02", "price": 252}
    ],
    "horizon": "7d"
  }'

# Check model info
curl http://localhost:5001/model/info
```

## Production Deployment

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
```

Build and run:

```bash
docker build -t agrovision-ml .
docker run -p 5001:5001 -v $(pwd)/models:/app/models agrovision-ml
```

### Environment Variables

Set in production:

```bash
export FLASK_DEBUG=False
export ML_SERVICE_PORT=5001
export MODELS_DIR=/app/models
```

## Troubleshooting

### Models not loading

- Ensure models are trained: `python train_model.py --generate-sample`
- Check models directory exists and contains: `lstm_model.h5`, `scaler.pkl`
- Verify file permissions

### TensorFlow errors

```bash
# Install specific TensorFlow version
pip install tensorflow==2.15.0

# For Mac M1/M2:
pip install tensorflow-macos==2.15.0
pip install tensorflow-metal==1.1.0
```

### Prophet installation issues

```bash
# Install prophet dependencies first
pip install pystan==2.19.1.1
pip install prophet==1.1.5

# On Linux:
sudo apt-get install python3-dev

# On Mac:
brew install gcc
```

## Performance

- **Prediction latency**: ~50-200ms per request
- **Training time**:
  - LSTM: 5-15 minutes (50 epochs, 730 days of data)
  - Prophet: 2-5 minutes
- **Memory usage**: ~500MB-1GB with models loaded
- **Throughput**: ~50-100 predictions/second

## Future Enhancements

- [ ] Add ensemble predictions (combining LSTM + Prophet)
- [ ] Implement online learning / model updates
- [ ] Add external factors (weather, policy, demand)
- [ ] Support multiple crops simultaneously
- [ ] Add prediction intervals and uncertainty quantification
- [ ] Implement model versioning and A/B testing
- [ ] Add monitoring and logging (Prometheus, Grafana)
- [ ] Cache predictions with Redis
- [ ] Add batch prediction endpoints

## License

MIT License - see main AgroVision repository

## Support

For issues, questions, or contributions, please refer to the main AgroVision repository.
