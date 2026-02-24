#!/bin/bash

# WhatsApp Bot Startup Script

echo "🚀 Starting WhatsApp Bot with Groq AI..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. Please edit it and add your GROQ_API_KEY"
        exit 1
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Check if GROQ_API_KEY is set
if ! grep -q "GROQ_API_KEY=.*[^your_groq_api_key_here]" .env; then
    echo "⚠️  GROQ_API_KEY not configured in .env file"
    echo "Please edit .env and add your Groq API key"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Create necessary directories
mkdir -p logs sessions

# Start the bot
echo "✅ Starting bot server..."
echo "📍 Server will be available at http://localhost:5000"
echo "📡 Webhook endpoint: http://localhost:5000/webhook"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python whatsapp_bot.py

