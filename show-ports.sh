#!/bin/bash

# Script to display Codespace port access information
# This helps users access the services in GitHub Codespaces

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║          🌐 CODESPACE PORT FORWARDING GUIDE 🌐               ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Get codespace name from environment
CODESPACE_NAME="${CODESPACE_NAME:-unknown}"
GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

echo "📍 Your Codespace: $CODESPACE_NAME"
echo ""

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  SERVICE URLs                                                ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""

if [ "$CODESPACE_NAME" != "unknown" ]; then
    echo "✅ Frontend (React):    https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo "✅ Backend API:         https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo "✅ Backend Health:      https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/health"
    echo "✅ API Products:        https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/api/products"
else
    echo "⚠️  Codespace name not detected. Use manual method below."
fi

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  HOW TO ACCESS IN VS CODE                                    ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""
echo "1. 📋 Look at the BOTTOM PANEL of VS Code"
echo "2. 🔍 Click on the 'PORTS' tab"
echo "3. ➕ If ports are missing, click '+' and add: 3000, 5000"
echo "4. 🌐 Click the GLOBE ICON (🌐) next to port 3000"
echo "5. 🎉 Your app will open in a new browser tab!"
echo ""

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  PORT VISIBILITY                                             ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""
echo "Make sure ports are set to 'Public':"
echo "  • Right-click on port 3000 → Port Visibility → Public"
echo "  • Right-click on port 5000 → Port Visibility → Public"
echo ""

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  CURRENT SERVICE STATUS                                      ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""

# Check services
check_port() {
    local port=$1
    local service=$2
    if nc -z localhost $port 2>/dev/null || timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/$port" 2>/dev/null; then
        echo "✅ $service (Port $port): Running"
        return 0
    else
        echo "❌ $service (Port $port): Not Running"
        return 1
    fi
}

check_port 3000 "Frontend (React)"
check_port 5000 "Backend (Node.js)"
check_port 27017 "MongoDB"
check_port 6379 "Redis"

echo ""
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃  QUICK TESTS (Run these commands)                           ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo ""
echo "# Test backend health"
echo "curl http://localhost:5000/health"
echo ""
echo "# Test products API"
echo "curl http://localhost:5000/api/products | jq '.total'"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🎯 GO TO PORTS TAB → CLICK 🌐 ON PORT 3000 → ENJOY! 🎉     ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
