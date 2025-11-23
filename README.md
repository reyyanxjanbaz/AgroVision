# AgroVision

AgroVision is an AI-powered agricultural platform that provides real-time crop prices, market insights, and advanced price predictions using machine learning to help farmers and traders make informed decisions.

## Features

- **Real-time Dashboard**: View current market prices for various crops
- **Price History**: Interactive charts showing price trends over time
- **AI Price Forecasting**: LSTM and Prophet models for accurate 7-day and 30-day predictions
- **Market Factors**: Analysis of factors affecting crop prices (weather, demand, supply)
- **AI Chatbot**: Intelligent assistant for agricultural queries
- **News Feed**: Latest agricultural news and updates
- **ML-Powered Predictions**: Deep learning models trained on historical data

## Tech Stack

- **Frontend**: React, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **ML Service**: Python, Flask, TensorFlow, Prophet
- **AI**: OpenAI / GitHub Models (for Chatbot)

## Prerequisites

- Node.js (v14 or higher)
- Python 3.9 or higher (for ML service)
- npm or yarn
- Supabase account
- OpenAI API Key or GitHub Token (optional, for chatbot)
- NewsAPI Key (optional, for news)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/AgroVision.git
   cd AgroVision
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   Create `.env` in `backend/`:

   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_or_github_token
   NEWS_API_KEY=your_news_api_key
   ML_SERVICE_URL=http://localhost:5001
   ```

   Create `.env` in `frontend/`:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Database Setup**

   - Create a new project in Supabase
   - Run the SQL scripts in `backend/src/db/schema.sql` and `backend/src/db/seeds.sql` in the Supabase SQL Editor

5. **ML Service Setup** (Optional but Recommended)

   The ML service provides advanced price predictions using LSTM and Prophet models.

   ```bash
   cd ml-service
   ./setup.sh
   ```

   Or manually:

   ```bash
   cd ml-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python train_model.py --generate-sample --model-type both
   ```

   See [ml-service/QUICKSTART.md](ml-service/QUICKSTART.md) for detailed instructions.

6. **Run the Application**

   **Start the ML Service** (Terminal 1):

   ```bash
   cd ml-service
   source venv/bin/activate
   python app.py
   ```

   **Start the Backend Server** (Terminal 2):

   ```bash
   cd backend
   npm start
   ```

   **Start the Frontend** (Terminal 3):

   ```bash
   cd frontend
   npm run dev
   ```

   Access the application at `http://localhost:5173`.

## Architecture

```
┌─────────────────┐
│   Frontend      │  React (Port 5173)
│   (React)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  Node.js/Express (Port 5000)
│   (Express)     │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────────┐
│Supabase │ │  ML Service  │  Python/Flask (Port 5001)
│  (DB)   │ │  (Flask)     │  - LSTM Model
└─────────┘ └──────────────┘  - Prophet Model
```

## ML Service Features

The ML service (`ml-service/`) provides advanced AI forecasting:

- **LSTM Neural Network**: Deep learning time-series model
- **Prophet Model**: Facebook's forecasting tool for seasonality
- **Statistical Fallback**: Works even without trained models
- **Kaggle Integration**: Train on real agricultural datasets
- **RESTful API**: Easy integration with backend
- **Docker Support**: Container-ready for deployment

Key endpoints:
- `POST /predict` - Get price predictions
- `POST /train` - Train models with new data
- `GET /model/info` - Check model status
- `GET /health` - Health check

For detailed ML service documentation, see:
- [ml-service/README.md](ml-service/README.md) - Full documentation
- [ml-service/QUICKSTART.md](ml-service/QUICKSTART.md) - Quick start guide

## Training with Kaggle Datasets

1. Get Kaggle API credentials from https://www.kaggle.com/account
2. Place `kaggle.json` in `~/.kaggle/`
3. Train with a dataset:

```bash
cd ml-service
python train_model.py --dataset "pateljay731/indian-cereals-production" --model-type both
```

Popular agricultural datasets:
- `pateljay731/indian-cereals-production`
- `kianwee/agricultural-raw-material-prices-19902020`
- `prasad22/commodity-prices-data-set`

## Project Structure

```
AgroVision/
├── backend/           # Node.js Express API
│   └── src/
│       ├── routes/    # API endpoints
│       ├── models/    # Data models
│       └── config/    # Configuration
├── frontend/          # React application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── ml-service/        # Python ML service
│   ├── app.py         # Flask API
│   ├── predictor.py   # ML models
│   ├── train_model.py # Training script
│   ├── models/        # Trained models
│   └── data/          # Training datasets
└── database/          # Database migrations
```

## License

MIT
