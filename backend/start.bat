@echo off
REM Startup script for Strategy backend (Windows)

echo Starting Strategy Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python -c "from app.models.database import init_db; init_db()"

REM Start server
echo Starting FastAPI server...
python -m app.main

