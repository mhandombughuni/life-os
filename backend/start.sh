#!/bin/bash
# Startup script for Strategy backend

echo "Starting Strategy Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python3 -c "from app.models.database import init_db; init_db()"

# Start server
echo "Starting FastAPI server..."
python3 -m app.main

