#!/bin/bash

# ThinUI Launcher Script
# Kills any existing processes and starts ThinUI on port 4687

echo "🚀 Starting ThinUI..."

# Kill any existing processes
for port in 1420 1430 4687 4688; do
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
done

# Kill any existing ThinUI processes
pkill -f "cargo tauri dev" 2>/dev/null || true
pkill -f "thinui@" 2>/dev/null || true

# Change to ThinUI directory
cd ~/Code/OkAgentDigital/ThinUI || { echo "❌ Failed to change directory"; exit 1; }

echo "🔧 Cleaning build artifacts..."
cargo clean > /dev/null 2>&1

echo "🚀 Starting ThinUI on port 4687..."
cargo tauri dev

echo "❌ ThinUI stopped unexpectedly"
