# ML Service Quick Start Guide

Get the AgroVision ML forecasting service running in 5 minutes.

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- 1GB free disk space

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
cd ml-service
./setup.sh
```

The script will:
1. Create a virtual environment
2. Install all dependencies
3. Set up configuration
4. Optionally train models with sample data

### Option 2: Manual Setup

```bash
cd ml-service

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Generate sample data and train models
python train_model.py --generate-sample --model-type both
```

## Starting the Service

```bash
# Activate virtual environment (if not already active)
source venv/bin/activate

# Start the ML service
python app.py
```

The service starts on `http://localhost:5001`

## Verify Installation

Test the health endpoint:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "models_loaded": true
}
```

## Making Your First Prediction

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crop_id": "wheat",
    "price_history": [
      {"date": "2024-01-01", "price": 250.0},
      {"date": "2024-01-02", "price": 252.0},
      {"date": "2024-01-03", "price": 251.5}
    ],
    "horizon": "both"
  }'
```

## Integration with AgroVision Backend

### 1. Start the ML Service (Port 5001)

```bash
cd ml-service
source venv/bin/activate
python app.py
```

### 2. Configure Backend

In `backend/.env`, add:

```
ML_SERVICE_URL=http://localhost:5001
```

### 3. Start Backend (Port 5000)

```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Now open `http://localhost:5173` - predictions will use the ML service!

## Training with Real Data

### Using Kaggle Datasets

1. Get Kaggle API credentials:
   - Go to https://www.kaggle.com/account
   - Create API token (downloads `kaggle.json`)
   - Place in `~/.kaggle/kaggle.json`
   - Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

2. Train with dataset:

```bash
python train_model.py \
  --dataset "pateljay731/indian-cereals-production" \
  --model-type both
```

### Using Your Own Data

Prepare a CSV file with columns: `date`, `price`, and optionally `crop_name`, `region`

```bash
python train_model.py \
  --data-path /path/to/your/data.csv \
  --model-type both
```

## Monitoring

Check model status:

```bash
curl http://localhost:5001/model/info
```

Check logs:

```bash
# The service logs to stdout
# View logs in your terminal where the service is running
```

## Troubleshooting

### TensorFlow Installation Issues

**Mac M1/M2:**
```bash
pip install tensorflow-macos==2.15.0
pip install tensorflow-metal==1.1.0
```

**Linux:**
```bash
pip install tensorflow==2.15.0
```

### Prophet Installation Issues

```bash
# Install dependencies first
pip install pystan==2.19.1.1
pip install prophet==1.1.5

# On Linux:
sudo apt-get install python3-dev

# On Mac:
brew install gcc
```

### Models Not Loading

Re-train the models:

```bash
python train_model.py --generate-sample --model-type both
```

### Port Already in Use

Change the port in `.env`:

```
ML_SERVICE_PORT=5002
```

And update backend `.env`:

```
ML_SERVICE_URL=http://localhost:5002
```

## Production Deployment

### Using Docker

```bash
# Build image
docker build -t agrovision-ml .

# Run container
docker run -p 5001:5001 -v $(pwd)/models:/app/models agrovision-ml
```

### Environment Variables

Set in production:

```bash
export FLASK_DEBUG=False
export ML_SERVICE_PORT=5001
export MODELS_DIR=/app/models
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore different Kaggle datasets for better predictions
- Fine-tune model parameters in `predictor.py`
- Add monitoring and logging for production
- Implement model versioning

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review error logs in the terminal
- Ensure all services are running on correct ports
- Verify virtual environment is activated

## Performance Tips

1. **Use GPU for Training**: Install TensorFlow with GPU support for faster training
2. **Cache Predictions**: Implement Redis caching for frequently requested predictions
3. **Batch Processing**: Use batch prediction endpoint for multiple crops
4. **Model Optimization**: Export models to TensorFlow Lite for faster inference

Happy forecasting! 🌾📈
