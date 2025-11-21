#!/bin/bash
PORT=${1:-3000}
echo "🔍 Verificando porta $PORT..."
PIDS=$(lsof -ti:$PORT 2>/dev/null)
if [ -z "$PIDS" ]; then
    echo "✅ Porta $PORT livre"
else
    echo "🛑 Encerrando processos na porta $PORT..."
    kill -9 $PIDS 2>/dev/null
    sleep 1
    echo "✅ Processos encerrados!"
fi
echo "🚀 Iniciando servidor..."
npm run dev
