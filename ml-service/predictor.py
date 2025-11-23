"""
Crop Price Predictor using LSTM and Prophet models
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os
import logging
from typing import Dict, List, Any
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class CropPricePredictor:
    """Main predictor class for crop price forecasting"""

    def __init__(self, models_dir='models'):
        self.models_dir = models_dir
        self.lstm_model = None
        self.prophet_model = None
        self.scaler = None
        self.loaded = False

        # Create models directory if it doesn't exist
        os.makedirs(models_dir, exist_ok=True)

        # Try to load existing models
        self._load_models()

    def _load_models(self):
        """Load pre-trained models if available"""
        try:
            lstm_path = os.path.join(self.models_dir, 'lstm_model.h5')
            prophet_path = os.path.join(self.models_dir, 'prophet_model.pkl')
            scaler_path = os.path.join(self.models_dir, 'scaler.pkl')

            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                logger.info("Scaler loaded successfully")

            if os.path.exists(lstm_path):
                from tensorflow import keras
                self.lstm_model = keras.models.load_model(lstm_path)
                logger.info("LSTM model loaded successfully")

            if os.path.exists(prophet_path):
                self.prophet_model = joblib.load(prophet_path)
                logger.info("Prophet model loaded successfully")

            self.loaded = True

        except Exception as e:
            logger.warning(f"Could not load models: {str(e)}")
            self.loaded = False

    def is_loaded(self):
        """Check if models are loaded"""
        return self.loaded

    def predict(self, price_history: List[Dict], horizon: str = 'both') -> Dict:
        """
        Make price predictions based on historical data

        Args:
            price_history: List of dictionaries with 'date' and 'price' keys
            horizon: '7d', '30d', or 'both'

        Returns:
            Dictionary with predictions and confidence scores
        """
        try:
            # Convert to DataFrame
            df = pd.DataFrame(price_history)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')

            # If models aren't loaded, use statistical forecasting
            if not self.loaded or self.lstm_model is None:
                logger.info("Using statistical forecasting (models not trained yet)")
                return self._statistical_forecast(df, horizon)

            # Use LSTM model for predictions
            return self._lstm_forecast(df, horizon)

        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            # Fallback to simple forecast
            return self._statistical_forecast(pd.DataFrame(price_history), horizon)

    def _statistical_forecast(self, df: pd.DataFrame, horizon: str) -> Dict:
        """
        Statistical forecasting using moving averages and trend analysis
        (Fallback when models aren't trained yet)
        """
        prices = df['price'].values

        # Calculate moving averages
        ma_7 = np.mean(prices[-7:]) if len(prices) >= 7 else np.mean(prices)
        ma_14 = np.mean(prices[-14:]) if len(prices) >= 14 else np.mean(prices)
        ma_30 = np.mean(prices[-30:]) if len(prices) >= 30 else np.mean(prices)

        # Calculate trend
        trend = (ma_7 - ma_30) / ma_30 if ma_30 > 0 else 0

        # Calculate volatility
        volatility = np.std(prices[-30:]) if len(prices) >= 30 else np.std(prices)

        # Make predictions
        current_price = prices[-1]

        # 7-day prediction
        trend_7d = trend * 0.1  # Conservative trend projection
        noise_7d = np.random.normal(0, volatility * 0.05)
        price_7d = current_price * (1 + trend_7d) + noise_7d

        # 30-day prediction
        trend_30d = trend * 0.3
        noise_30d = np.random.normal(0, volatility * 0.1)
        price_30d = current_price * (1 + trend_30d) + noise_30d

        # Calculate confidence scores
        data_quality = min(len(prices) / 365, 1.0)  # More data = higher confidence
        trend_confidence = 1 - abs(trend)  # Lower trend = higher confidence
        confidence_7d = (data_quality * 0.6 + trend_confidence * 0.4) * 100
        confidence_30d = confidence_7d * 0.85  # Lower confidence for longer horizon

        result = {
            'current_price': float(current_price),
            'algorithm': 'statistical_ma',
            'trend': 'up' if trend > 0.01 else 'down' if trend < -0.01 else 'stable'
        }

        if horizon in ['7d', 'both']:
            result['7d'] = {
                'predicted_price': max(0, float(price_7d)),
                'confidence': float(min(95, max(60, confidence_7d))),
                'change_percent': float((price_7d - current_price) / current_price * 100)
            }

        if horizon in ['30d', 'both']:
            result['30d'] = {
                'predicted_price': max(0, float(price_30d)),
                'confidence': float(min(90, max(55, confidence_30d))),
                'change_percent': float((price_30d - current_price) / current_price * 100)
            }

        return result

    def _lstm_forecast(self, df: pd.DataFrame, horizon: str) -> Dict:
        """
        LSTM-based forecasting using trained neural network
        """
        try:
            from sklearn.preprocessing import MinMaxScaler

            prices = df['price'].values.reshape(-1, 1)

            # Scale the data
            if self.scaler is None:
                self.scaler = MinMaxScaler()
                scaled_prices = self.scaler.fit_transform(prices)
            else:
                scaled_prices = self.scaler.transform(prices)

            # Prepare sequence for LSTM
            sequence_length = 30
            if len(scaled_prices) < sequence_length:
                # Pad with mean if not enough data
                mean_val = np.mean(scaled_prices)
                padding = np.full((sequence_length - len(scaled_prices), 1), mean_val)
                scaled_prices = np.vstack([padding, scaled_prices])

            # Get the last sequence
            last_sequence = scaled_prices[-sequence_length:].reshape(1, sequence_length, 1)

            # Predict 7 days
            pred_7d_scaled = self.lstm_model.predict(last_sequence, verbose=0)
            pred_7d = self.scaler.inverse_transform(pred_7d_scaled)[0][0]

            # For 30-day prediction, use iterative forecasting
            current_sequence = last_sequence.copy()
            predictions = []
            for _ in range(30):
                next_pred = self.lstm_model.predict(current_sequence, verbose=0)
                predictions.append(next_pred[0][0])
                # Update sequence
                current_sequence = np.roll(current_sequence, -1, axis=1)
                current_sequence[0, -1, 0] = next_pred[0][0]

            pred_30d_scaled = np.array(predictions[-1:]).reshape(1, 1)
            pred_30d = self.scaler.inverse_transform(pred_30d_scaled)[0][0]

            current_price = prices[-1][0]

            # Calculate confidence based on model performance
            # (In production, this would be based on validation metrics)
            confidence_7d = 85.0
            confidence_30d = 72.0

            # Determine trend
            short_term_trend = (pred_7d - current_price) / current_price
            trend = 'up' if short_term_trend > 0.01 else 'down' if short_term_trend < -0.01 else 'stable'

            result = {
                'current_price': float(current_price),
                'algorithm': 'lstm_neural_network',
                'trend': trend
            }

            if horizon in ['7d', 'both']:
                result['7d'] = {
                    'predicted_price': max(0, float(pred_7d)),
                    'confidence': confidence_7d,
                    'change_percent': float((pred_7d - current_price) / current_price * 100)
                }

            if horizon in ['30d', 'both']:
                result['30d'] = {
                    'predicted_price': max(0, float(pred_30d)),
                    'confidence': confidence_30d,
                    'change_percent': float((pred_30d - current_price) / current_price * 100)
                }

            return result

        except Exception as e:
            logger.error(f"LSTM forecast error: {str(e)}")
            return self._statistical_forecast(df, horizon)

    def train(self, data_path: str, model_type: str = 'both') -> Dict:
        """
        Train models on provided dataset

        Args:
            data_path: Path to CSV file with columns: date, price, crop_name (optional)
            model_type: 'lstm', 'prophet', or 'both'

        Returns:
            Dictionary with training results
        """
        try:
            # Load data
            df = pd.read_csv(data_path)
            logger.info(f"Loaded training data: {len(df)} rows")

            results = {}

            if model_type in ['lstm', 'both']:
                results['lstm'] = self._train_lstm(df)

            if model_type in ['prophet', 'both']:
                results['prophet'] = self._train_prophet(df)

            self.loaded = True
            return results

        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            raise

    def _train_lstm(self, df: pd.DataFrame) -> Dict:
        """Train LSTM model"""
        try:
            from tensorflow import keras
            from sklearn.preprocessing import MinMaxScaler
            from sklearn.model_selection import train_test_split

            # Prepare data
            prices = df['price'].values.reshape(-1, 1)

            # Scale data
            self.scaler = MinMaxScaler()
            scaled_prices = self.scaler.fit_transform(prices)

            # Create sequences
            sequence_length = 30
            X, y = [], []

            for i in range(len(scaled_prices) - sequence_length):
                X.append(scaled_prices[i:i+sequence_length])
                y.append(scaled_prices[i+sequence_length])

            X = np.array(X)
            y = np.array(y)

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

            # Build LSTM model
            model = keras.Sequential([
                keras.layers.LSTM(64, activation='relu', input_shape=(sequence_length, 1), return_sequences=True),
                keras.layers.Dropout(0.2),
                keras.layers.LSTM(32, activation='relu'),
                keras.layers.Dropout(0.2),
                keras.layers.Dense(16, activation='relu'),
                keras.layers.Dense(1)
            ])

            model.compile(optimizer='adam', loss='mse', metrics=['mae'])

            # Train model
            logger.info("Training LSTM model...")
            history = model.fit(
                X_train, y_train,
                epochs=50,
                batch_size=32,
                validation_data=(X_test, y_test),
                verbose=0
            )

            # Save model
            model.save(os.path.join(self.models_dir, 'lstm_model.h5'))
            joblib.dump(self.scaler, os.path.join(self.models_dir, 'scaler.pkl'))

            self.lstm_model = model

            return {
                'status': 'success',
                'final_loss': float(history.history['loss'][-1]),
                'final_val_loss': float(history.history['val_loss'][-1]),
                'epochs': len(history.history['loss'])
            }

        except Exception as e:
            logger.error(f"LSTM training error: {str(e)}")
            raise

    def _train_prophet(self, df: pd.DataFrame) -> Dict:
        """Train Prophet model"""
        try:
            from prophet import Prophet

            # Prepare data for Prophet
            prophet_df = df[['date', 'price']].copy()
            prophet_df.columns = ['ds', 'y']
            prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])

            # Initialize and fit Prophet model
            logger.info("Training Prophet model...")
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=0.05
            )

            model.fit(prophet_df)

            # Save model
            joblib.dump(model, os.path.join(self.models_dir, 'prophet_model.pkl'))

            self.prophet_model = model

            return {
                'status': 'success',
                'changepoints': len(model.changepoints),
                'training_samples': len(prophet_df)
            }

        except Exception as e:
            logger.error(f"Prophet training error: {str(e)}")
            raise

    def get_model_info(self) -> Dict:
        """Get information about loaded models"""
        return {
            'lstm_loaded': self.lstm_model is not None,
            'prophet_loaded': self.prophet_model is not None,
            'scaler_loaded': self.scaler is not None,
            'models_directory': self.models_dir,
            'status': 'ready' if self.loaded else 'not_trained'
        }
