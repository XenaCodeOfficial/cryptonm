@echo off
REM Script de deployment para Windows
REM Uso: deploy.bat [opcion]

echo ================================
echo NM Crypto App - Deployment Script
echo ================================
echo.

REM Verificar .env
if not exist .env (
    echo [ERROR] Archivo .env no encontrado!
    echo Crea un archivo .env con tus variables de entorno
    exit /b 1
)

echo [OK] Archivo .env encontrado
echo.

if "%1"=="" (
    echo Selecciona una opcion:
    echo 1. Docker local
    echo 2. Vercel
    echo 3. Railway
    echo 4. Build manual
    echo.
    set /p option="Opcion (1-4): "
) else (
    set option=%1
)

if "%option%"=="1" goto docker
if "%option%"=="2" goto vercel
if "%option%"=="3" goto railway
if "%option%"=="4" goto manual

echo [ERROR] Opcion invalida
exit /b 1

:docker
echo.
echo [DOCKER] Iniciando deployment con Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta instalado!
    echo Descarga Docker Desktop: https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo Construyendo imagen Docker...
docker build -t nm-crypto-app .

echo Iniciando contenedores...
docker-compose up -d

echo.
echo [OK] App desplegada con Docker!
echo Accede a: http://localhost:3000
goto end

:vercel
echo.
echo [VERCEL] Iniciando deployment con Vercel...

where vercel >nul 2>&1
if errorlevel 1 (
    echo Instalando Vercel CLI...
    npm install -g vercel
)

echo Desplegando a Vercel...
vercel --prod

echo.
echo [OK] App desplegada en Vercel!
goto end

:railway
echo.
echo [RAILWAY] Iniciando deployment con Railway...

where railway >nul 2>&1
if errorlevel 1 (
    echo Instalando Railway CLI...
    npm install -g @railway/cli
)

echo Desplegando a Railway...
railway up

echo.
echo [OK] App desplegada en Railway!
goto end

:manual
echo.
echo [MANUAL] Build manual para deployment...

echo Instalando dependencias...
call npm install --production

echo Construyendo aplicacion...
call npm run build

echo.
echo [OK] Build completado!
echo.
echo Archivos listos para subir via FTP/SFTP:
echo   - .next/
echo   - public/
echo   - node_modules/
echo   - package.json
echo   - next.config.js
echo   - .env
echo.
echo En el servidor, ejecuta: npm start
goto end

:end
echo.
pause
