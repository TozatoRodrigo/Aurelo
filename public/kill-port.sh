#!/bin/bash
# Script rápido para encerrar processo em uma porta
PORT=${1:-3000}
PIDS=$(lsof -ti:$PORT 2>/dev/null)
if [ -z "$PIDS" ]; then
    echo "✅ Nenhum processo na porta $PORT"
else
    echo "🛑 Encerrando processos na porta $PORT..."
    kill -9 $PIDS
    echo "✅ Processos encerrados!"
fi
