# Comandos para Gerenciar o Servidor de Desenvolvimento

## 🚀 Como Reiniciar o Servidor

### Método 1: Usando o script (Recomendado)
```bash
./scripts/dev-server.sh
```

### Método 2: Manual
```bash
# 1. Parar o servidor atual (Ctrl + C no terminal onde está rodando)
# 2. Iniciar novamente
npm run dev
```

## 🛑 Como Cancelar Processos em Portas

### Verificar qual processo está usando uma porta
```bash
# Porta 3000 (padrão Next.js)
lsof -i:3000

# Outra porta (substitua 3000 pela porta desejada)
lsof -i:PORTA
```

### Encerrar processo em uma porta específica
```bash
# Porta 3000
kill -9 $(lsof -ti:3000)

# Outra porta
kill -9 $(lsof -ti:PORTA)
```

### Encerrar todos os processos Node.js
```bash
killall node
```

### Encerrar processo específico pelo PID
```bash
# Primeiro encontre o PID
lsof -i:3000

# Depois encerre (substitua PID pelo número)
kill -9 PID
```

## 📋 Comandos Úteis

### Verificar todas as portas em uso
```bash
lsof -i -P -n | grep LISTEN
```

### Verificar processos Node.js
```bash
ps aux | grep node
```

### Limpar cache do Next.js e reiniciar
```bash
# Limpar cache
rm -rf .next

# Reiniciar servidor
npm run dev
```

## ⚡ Atalhos Rápidos

### Reiniciar servidor rapidamente
```bash
# Encerrar e iniciar em um comando
kill -9 $(lsof -ti:3000) 2>/dev/null; npm run dev
```

### Verificar se porta está livre
```bash
lsof -ti:3000 && echo "Porta em uso" || echo "Porta livre"
```

