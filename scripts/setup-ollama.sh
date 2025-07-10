#!/bin/bash

# 🦙 OLLAMA SETUP FOR AI VISUAL TESTING
# This script installs Ollama and downloads the LLaVA vision model

echo "🚀 Setting up Ollama for local AI vision testing..."
echo "=================================================="

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
else
    echo "📦 Installing Ollama..."
    
    # Install Ollama (macOS/Linux)
    curl -fsSL https://ollama.ai/install.sh | sh
    
    if [ $? -eq 0 ]; then
        echo "✅ Ollama installed successfully"
    else
        echo "❌ Ollama installation failed"
        exit 1
    fi
fi

echo ""
echo "🔄 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "⏳ Waiting for Ollama to start..."
sleep 5

echo ""
echo "📥 Downloading LLaVA vision model..."
echo "   (This may take several minutes - ~4GB download)"
ollama pull llava:latest

if [ $? -eq 0 ]; then
    echo "✅ LLaVA model downloaded successfully"
else
    echo "❌ Failed to download LLaVA model"
    kill $OLLAMA_PID
    exit 1
fi

echo ""
echo "🧪 Testing LLaVA model..."
echo "Describe this image" | ollama run llava:latest - --verbose

echo ""
echo "✅ Ollama setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Keep Ollama running in the background"
echo "   2. Run: npm run test-open-source"
echo "   3. Check results for local LLaVA performance"
echo ""
echo "📝 To stop Ollama later: kill $OLLAMA_PID"
echo "📝 To restart Ollama: ollama serve" 