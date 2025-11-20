#!/bin/bash

# Script para gerenciar o servidor de desenvolvimento

PORT=${1:-3000}

echo "🔍 Verificando processos na porta $PORT..."

# Encontrar processos na porta
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Nenhum processo rodando na porta $PORT"
else
    echo "⚠️  Processos encontrados na porta $PORT:"
    lsof -i:$PORT
    
    read -p "Deseja encerrar esses processos? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🛑 Encerrando processos..."
        kill -9 $PIDS 2>/dev/null
        sleep 1
        echo "✅ Processos encerrados!"
    else
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev

