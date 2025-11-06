#!/bin/bash

# Script de deployment para NM Crypto App
# Uso: ./deploy.sh [opcion]
# Opciones: docker, vercel, railway, manual

set -e

echo "🚀 NM Crypto App - Deployment Script"
echo "======================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar variables de entorno
check_env() {
    echo -e "${YELLOW}📋 Verificando variables de entorno...${NC}"

    if [ ! -f .env ]; then
        echo -e "${RED}❌ Archivo .env no encontrado!${NC}"
        echo "Crea un archivo .env con las siguientes variables:"
        echo "DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, COINGECKO_API_KEY, OPENAI_API_KEY"
        exit 1
    fi

    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
}

# Opción 1: Docker Deployment
deploy_docker() {
    echo -e "${YELLOW}🐳 Iniciando deployment con Docker...${NC}"

    if ! command_exists docker; then
        echo -e "${RED}❌ Docker no está instalado!${NC}"
        echo "Instala Docker desde: https://docs.docker.com/get-docker/"
        exit 1
    fi

    echo "Construyendo imagen Docker..."
    docker build -t nm-crypto-app .

    echo "Iniciando contenedores con Docker Compose..."
    docker-compose up -d

    echo -e "${GREEN}✅ App desplegada con Docker!${NC}"
    echo "Accede a: http://localhost:3000"
}

# Opción 2: Vercel Deployment
deploy_vercel() {
    echo -e "${YELLOW}▲ Iniciando deployment con Vercel...${NC}"

    if ! command_exists vercel; then
        echo "Instalando Vercel CLI..."
        npm install -g vercel
    fi

    echo "Desplegando a Vercel..."
    vercel --prod

    echo -e "${GREEN}✅ App desplegada en Vercel!${NC}"
}

# Opción 3: Railway Deployment
deploy_railway() {
    echo -e "${YELLOW}🚂 Iniciando deployment con Railway...${NC}"

    if ! command_exists railway; then
        echo "Instalando Railway CLI..."
        npm install -g @railway/cli
    fi

    echo "Desplegando a Railway..."
    railway up

    echo -e "${GREEN}✅ App desplegada en Railway!${NC}"
}

# Opción 4: Build manual
deploy_manual() {
    echo -e "${YELLOW}🔨 Build manual para deployment...${NC}"

    echo "Instalando dependencias..."
    npm install --production

    echo "Construyendo aplicación..."
    npm run build

    echo -e "${GREEN}✅ Build completado!${NC}"
    echo "Archivos listos para subir vía FTP/SFTP:"
    echo "  - .next/"
    echo "  - public/"
    echo "  - node_modules/"
    echo "  - package.json"
    echo "  - next.config.js"
    echo "  - .env"
    echo ""
    echo "En el servidor, ejecuta: npm start"
}

# Menú principal
main() {
    check_env

    if [ -z "$1" ]; then
        echo ""
        echo "Selecciona una opción de deployment:"
        echo "1) Docker (local o VPS)"
        echo "2) Vercel (recomendado - gratis)"
        echo "3) Railway"
        echo "4) Manual (build para FTP)"
        echo ""
        read -p "Opción (1-4): " option
    else
        option=$1
    fi

    case $option in
        1|docker)
            deploy_docker
            ;;
        2|vercel)
            deploy_vercel
            ;;
        3|railway)
            deploy_railway
            ;;
        4|manual)
            deploy_manual
            ;;
        *)
            echo -e "${RED}❌ Opción inválida${NC}"
            exit 1
            ;;
    esac
}

main "$@"
