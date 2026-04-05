#!/bin/bash

echo ""
echo "============================================"
echo "  Smart Agriculture - Startup Script"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if MongoDB is running
echo -e "${YELLOW}[1/3] Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo "      MongoDB is already running ✅"
else
    echo "      Attempting to start MongoDB..."
    if command -v brew &>/dev/null; then
        brew services start mongodb-community 2>/dev/null && echo "      MongoDB started via Homebrew ✅"
    elif command -v systemctl &>/dev/null; then
        sudo systemctl start mongod 2>/dev/null && echo "      MongoDB started via systemctl ✅"
    else
        echo "      ⚠️  Could not auto-start MongoDB."
        echo "      Please start it manually: mongod --dbpath /data/db"
        read -p "Press Enter once MongoDB is running..."
    fi
fi

# Install & start backend
echo ""
echo -e "${YELLOW}[2/3] Starting Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "      Installing backend dependencies..."
    npm install
fi
npm run dev &
BACKEND_PID=$!
echo -e "      Backend started (PID $BACKEND_PID) → ${GREEN}http://localhost:5000${NC} ✅"
cd ..

# Wait for backend
sleep 2

# Install & start frontend
echo ""
echo -e "${YELLOW}[3/3] Starting Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "      Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
echo -e "      Frontend started (PID $FRONTEND_PID) → ${GREEN}http://localhost:5173${NC} ✅"
cd ..

echo ""
echo "============================================"
echo -e "  ${GREEN}App running at http://localhost:5173${NC}"
echo "============================================"
echo ""
echo "  Admin:  admin@agri.com  / admin123"
echo "  Farmer: farmer@agri.com / farmer123"
echo "  Expert: expert@agri.com / expert123"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo ""

# Keep running and handle Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
