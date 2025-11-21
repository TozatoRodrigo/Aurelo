#!/bin/bash

echo "🔧 Corrigindo problemas do servidor de desenvolvimento..."

# 1. Encerrar processos nas portas 3000 e 3001
echo "🛑 Encerrando processos nas portas 3000 e 3001..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# 2. Encerrar todos os processos Next.js
echo "🛑 Encerrando processos Next.js..."
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 1

# 3. Remover lock file
echo "🗑️  Removendo lock file..."
rm -rf .next/dev/lock 2>/dev/null

# 4. Limpar cache do Next.js (opcional - descomente se necessário)
# echo "🗑️  Limpando cache do Next.js..."
# rm -rf .next 2>/dev/null

echo "✅ Correções aplicadas!"
echo ""
echo "🚀 Agora você pode iniciar o servidor com:"
echo "   npm run dev"

