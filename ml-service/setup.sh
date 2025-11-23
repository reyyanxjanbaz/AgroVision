#!/bin/bash

# AgroVision ML Service Setup Script

set -e  # Exit on error

echo "=================================================="
echo "  AgroVision ML Service Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.9 or higher.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}Found Python $PYTHON_VERSION${NC}"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}Virtual environment activated${NC}"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null
echo -e "${GREEN}pip upgraded${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
pip install -r requirements.txt
echo -e "${GREEN}Dependencies installed successfully${NC}"
echo ""

# Create directories
echo "Creating required directories..."
mkdir -p models data
echo -e "${GREEN}Directories created${NC}"
echo ""

# Setup environment file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}.env file created${NC}"
else
    echo -e "${YELLOW}.env file already exists${NC}"
fi
echo ""

# Ask about training data
echo "=================================================="
echo "  Training Data Setup"
echo "=================================================="
echo ""
echo "Would you like to:"
echo "1) Generate sample data (recommended for testing)"
echo "2) Use Kaggle dataset (requires Kaggle API setup)"
echo "3) Skip for now (train later manually)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Generating sample training data..."
        python train_model.py --generate-sample --model-type both
        echo -e "${GREEN}Training completed!${NC}"
        ;;
    2)
        echo ""
        echo "Kaggle API Setup:"
        echo "1. Go to https://www.kaggle.com/account"
        echo "2. Create API token (downloads kaggle.json)"
        echo "3. Place it in ~/.kaggle/"
        echo ""
        read -p "Have you set up Kaggle API? (y/n): " kaggle_setup
        if [ "$kaggle_setup" = "y" ]; then
            echo ""
            echo "Popular agricultural datasets:"
            echo "- pateljay731/indian-cereals-production"
            echo "- kianwee/agricultural-raw-material-prices-19902020"
            echo "- prasad22/commodity-prices-data-set"
            echo ""
            read -p "Enter Kaggle dataset name: " dataset_name
            python train_model.py --dataset "$dataset_name" --model-type both
            echo -e "${GREEN}Training completed!${NC}"
        else
            echo -e "${YELLOW}Skipping Kaggle dataset download${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}Skipping training. You can train later with:${NC}"
        echo "  python train_model.py --generate-sample --model-type both"
        ;;
    *)
        echo -e "${RED}Invalid choice. Skipping training.${NC}"
        ;;
esac

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo ""
echo "To start the ML service:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Start the service: python app.py"
echo ""
echo "The service will be available at: http://localhost:5001"
echo ""
echo "API Endpoints:"
echo "  - GET  /health              Health check"
echo "  - POST /predict             Make predictions"
echo "  - POST /train               Train models"
echo "  - GET  /model/info          Model information"
echo ""
echo "For more information, see README.md"
echo ""
