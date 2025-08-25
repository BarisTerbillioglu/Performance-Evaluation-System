#!/bin/bash
# Server Management Script

case "$1" in
    "start")
        echo "Starting server..."
        npx serve -s dist -l 8080 > logs/server.log 2>&1 &
        echo $! > server.pid
        echo "Server started with PID: $(cat server.pid)"
        ;;
    "stop")
        if [ -f server.pid ]; then
            echo "Stopping server..."
            kill $(cat server.pid) 2>/dev/null || true
            rm server.pid
            echo "Server stopped"
        else
            echo "No server PID file found"
        fi
        ;;
    "restart")
        $0 stop
        sleep 2
        $0 start
        ;;
    "status")
        if [ -f server.pid ] && kill -0 $(cat server.pid) 2>/dev/null; then
            echo "Server is running (PID: $(cat server.pid))"
        else
            echo "Server is not running"
        fi
        ;;
    "logs")
        tail -f logs/server.log
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
