"""
Training script for crop price forecasting models
Downloads Kaggle dataset and trains LSTM/Prophet models
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import argparse
import logging
from predictor import CropPricePredictor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def download_kaggle_dataset(dataset_name: str, output_dir: str = 'data'):
    """
    Download dataset from Kaggle

    Args:
        dataset_name: Kaggle dataset identifier (e.g., 'username/dataset-name')
        output_dir: Directory to save downloaded data

    Note: Requires Kaggle API credentials in ~/.kaggle/kaggle.json
    """
    try:
        import kaggle
        os.makedirs(output_dir, exist_ok=True)

        logger.info(f"Downloading dataset: {dataset_name}")
        kaggle.api.dataset_download_files(dataset_name, path=output_dir, unzip=True)
        logger.info(f"Dataset downloaded to {output_dir}")

        return True
    except Exception as e:
        logger.error(f"Failed to download dataset: {str(e)}")
        logger.info("\nTo use Kaggle datasets:")
        logger.info("1. Create account at https://www.kaggle.com")
        logger.info("2. Go to Account Settings -> API -> Create New API Token")
        logger.info("3. Place kaggle.json in ~/.kaggle/ directory")
        logger.info("4. Run: chmod 600 ~/.kaggle/kaggle.json")
        return False

def generate_sample_data(output_path: str = 'data/crop_prices.csv', num_days: int = 730):
    """
    Generate sample agricultural price data for training
    Uses realistic patterns with seasonality and trends
    """
    logger.info(f"Generating sample data for {num_days} days...")

    # Start date
    start_date = datetime.now() - timedelta(days=num_days)

    # Generate dates
    dates = [start_date + timedelta(days=i) for i in range(num_days)]

    # Crops to generate data for
    crops = {
        'Wheat': {'base': 250, 'volatility': 15, 'trend': 0.0001},
        'Rice': {'base': 180, 'volatility': 12, 'trend': 0.00015},
        'Corn': {'base': 220, 'volatility': 18, 'trend': -0.00005},
        'Soybeans': {'base': 380, 'volatility': 25, 'trend': 0.0002},
        'Cotton': {'base': 320, 'volatility': 20, 'trend': 0.00012},
    }

    all_data = []

    for crop_name, params in crops.items():
        base_price = params['base']
        volatility = params['volatility']
        trend = params['trend']

        prices = []

        for i, date in enumerate(dates):
            # Seasonal component (higher prices in certain months)
            month = date.month
            seasonal = np.sin(2 * np.pi * month / 12) * 20

            # Trend component
            trend_component = i * trend * base_price

            # Random walk / volatility
            if i == 0:
                random_walk = 0
            else:
                random_walk = prices[-1] - base_price - seasonal - (i-1) * trend * base_price
                random_walk += np.random.normal(0, volatility)

            # Combine components
            price = base_price + seasonal + trend_component + random_walk

            # Add some random events (price spikes)
            if np.random.random() > 0.98:
                price *= np.random.uniform(1.1, 1.3)
            elif np.random.random() > 0.98:
                price *= np.random.uniform(0.7, 0.9)

            # Ensure positive prices
            price = max(price, base_price * 0.5)

            prices.append(price)

            all_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'crop_name': crop_name,
                'price': round(price, 2),
                'region': np.random.choice(['north', 'south', 'east', 'west'])
            })

    # Create DataFrame and save
    df = pd.DataFrame(all_data)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    logger.info(f"Sample data saved to {output_path}")
    logger.info(f"Total records: {len(df)}")
    logger.info(f"Crops: {', '.join(crops.keys())}")
    logger.info(f"Date range: {df['date'].min()} to {df['date'].max()}")

    return output_path

def prepare_data(input_path: str, crop_filter: str = None) -> pd.DataFrame:
    """
    Load and prepare data for training

    Args:
        input_path: Path to CSV file
        crop_filter: Optional crop name to filter by
    """
    logger.info(f"Loading data from {input_path}")

    df = pd.read_csv(input_path)

    # Basic validation
    required_columns = ['date', 'price']
    if not all(col in df.columns for col in required_columns):
        raise ValueError(f"Dataset must contain columns: {required_columns}")

    # Filter by crop if specified
    if crop_filter and 'crop_name' in df.columns:
        df = df[df['crop_name'] == crop_filter]
        logger.info(f"Filtered data for crop: {crop_filter}")

    # Convert date column
    df['date'] = pd.to_datetime(df['date'])

    # Sort by date
    df = df.sort_values('date')

    # Remove duplicates
    df = df.drop_duplicates(subset=['date'], keep='first')

    logger.info(f"Prepared {len(df)} records for training")
    logger.info(f"Date range: {df['date'].min()} to {df['date'].max()}")
    logger.info(f"Price range: ${df['price'].min():.2f} - ${df['price'].max():.2f}")

    return df

def main():
    parser = argparse.ArgumentParser(description='Train crop price forecasting models')

    parser.add_argument('--dataset', type=str, help='Kaggle dataset name (e.g., username/dataset-name)')
    parser.add_argument('--data-path', type=str, help='Path to local CSV file')
    parser.add_argument('--generate-sample', action='store_true', help='Generate sample training data')
    parser.add_argument('--crop', type=str, help='Filter by specific crop name')
    parser.add_argument('--model-type', type=str, default='both', choices=['lstm', 'prophet', 'both'],
                        help='Type of model to train')
    parser.add_argument('--output-dir', type=str, default='models', help='Directory to save trained models')

    args = parser.parse_args()

    try:
        # Determine data source
        data_path = None

        if args.generate_sample:
            logger.info("Generating sample data...")
            data_path = generate_sample_data()

        elif args.dataset:
            logger.info(f"Downloading Kaggle dataset: {args.dataset}")
            if download_kaggle_dataset(args.dataset):
                # Look for CSV files in data directory
                data_dir = 'data'
                csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
                if csv_files:
                    data_path = os.path.join(data_dir, csv_files[0])
                    logger.info(f"Using downloaded file: {data_path}")
                else:
                    logger.error("No CSV files found in downloaded data")
                    return
            else:
                logger.warning("Failed to download from Kaggle, using sample data instead")
                data_path = generate_sample_data()

        elif args.data_path:
            data_path = args.data_path

        else:
            logger.info("No data source specified. Use --generate-sample to create sample data")
            logger.info("Or use --dataset to download from Kaggle")
            logger.info("Or use --data-path to specify a local CSV file")
            return

        # Prepare data
        df = prepare_data(data_path, args.crop)

        # Initialize predictor
        predictor = CropPricePredictor(models_dir=args.output_dir)

        # Train models
        logger.info(f"Starting training with model type: {args.model_type}")
        results = predictor.train(data_path, args.model_type)

        logger.info("\n" + "="*50)
        logger.info("TRAINING COMPLETED SUCCESSFULLY")
        logger.info("="*50)

        for model_name, model_results in results.items():
            logger.info(f"\n{model_name.upper()} Model:")
            for key, value in model_results.items():
                logger.info(f"  {key}: {value}")

        logger.info(f"\nModels saved to: {args.output_dir}")
        logger.info("\nYou can now start the ML service with: python app.py")

    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
