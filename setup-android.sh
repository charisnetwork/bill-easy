#!/bin/bash
# ============================================================
# Bill Easy — Capacitor Android Setup Script
# Run this ONCE from the project root:  bash setup-android.sh
# ============================================================

set -e  # Exit on any error

FRONTEND_DIR="$(cd "$(dirname "$0")" && pwd)/frontend"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Bill Easy — Capacitor Android Setup   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$FRONTEND_DIR"

# ── Step 1: Install Capacitor packages ──────────────────────
echo "📦 Step 1/5 — Installing Capacitor packages..."
npm install \
  @capacitor/core \
  @capacitor/cli \
  @capacitor/android \
  @capacitor/filesystem \
  @capacitor/share \
  @capacitor/browser \
  @capacitor/toast \
  @capacitor/haptics \
  @capacitor/status-bar \
  @capacitor/splash-screen \
  --save --legacy-peer-deps

echo "✅ Capacitor packages installed"
echo ""

# ── Step 2: Build web app ────────────────────────────────────
echo "🔨 Step 2/5 — Building web app (npm run build)..."
npm run build
echo "✅ Web build complete (dist/ folder ready)"
echo ""

# ── Step 3: Add Android platform ────────────────────────────
echo "🤖 Step 3/5 — Adding Android platform..."
npx cap add android
echo "✅ Android platform added"
echo ""

# ── Step 4: Sync web assets to Android ──────────────────────
echo "🔄 Step 4/5 — Syncing web assets to Android..."
npx cap sync android
echo "✅ Sync complete"
echo ""

# ── Step 5: Done ─────────────────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║             Setup Complete! 🎉           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Open Android Studio:"
echo "     npx cap open android"
echo ""
echo "  2. In Android Studio → Build → Generate Signed APK"
echo "     (or Build → Build Bundle for Play Store)"
echo ""
echo "  3. After future code changes, run:"
echo "     cd frontend && npm run build && npx cap sync android"
echo ""
echo "  ⚠️  Set your backend URL in the build:"
echo "     VITE_BACKEND_URL=https://billeasy-production.up.railway.app npm run build"
echo ""
