#!/bin/bash
echo "🔧 Corrigindo problemas do servidor de desenvolvimento..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null
ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
rm -rf .next/dev/lock 2>/dev/null
echo "✅ Correções aplicadas! Agora execute: npm run dev"
