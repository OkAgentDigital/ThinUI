#!/bin/bash

# Simple ThinUI Launcher - Uses port 7846 to avoid conflicts

echo "🧹 Cleaning up any existing processes..."
killall node 2>/dev/null || true
killall cargo 2>/dev/null || true
sleep 1

echo "📂 Changing to ThinUI directory..."
cd ~/Code/OkAgentDigital/ThinUI || { echo "Failed to change directory"; exit 1; }

echo "🚀 Starting ThinUI on port 7846..."
echo "   Vite will serve on: http://localhost:7846"
echo "   Tauri window should appear shortly..."

echo ""
echo "If you see a blank window, wait 10-15 seconds for Vite to compile."
echo "If it still doesn't work, check the browser console for errors."
echo ""

# Run in foreground so we can see errors
cargo tauri dev
