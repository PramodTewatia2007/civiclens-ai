#!/usr/bin/env bash
# ==============================================================================
# Build script for Render / Linux deployments
# ==============================================================================
set -o errexit

echo "==> [1/3] Installing frontend dependencies & building React production bundle..."
cd frontend
npm ci || npm install
npm run build
cd ..

echo "==> [2/3] Installing backend Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> [3/3] Preparing static assets..."
mkdir -p backend/uploads backend/static
cp -r frontend/dist backend/static/dist || true

echo "==> Build finished successfully!"
