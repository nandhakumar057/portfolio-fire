#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing processes on these ports
kill $(lsof -t -i:5001) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1

echo "Starting server..."
cd server && node server.js &
SERVER_PID=$!
cd ..

sleep 3

echo "Starting client..."
cd client && npx vite --host &
CLIENT_PID=$!
cd ..

sleep 3

echo ""
echo "========================================="
echo "  Portfolio Dev Servers Running!"
echo "========================================="
echo "  Site:  http://localhost:5173"
echo "  Admin: http://localhost:5173/admin/login"
echo "  Code:  2006"
echo "========================================="

# Keep script alive
wait $SERVER_PID $CLIENT_PID
