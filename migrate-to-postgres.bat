@echo off
echo ========================================
echo Migracion de SQLite a PostgreSQL
echo ========================================
echo.

echo [1/4] Generando Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Fallo al generar Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generado
echo.

echo [2/4] Creando migracion inicial...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [ERROR] Fallo al crear migracion
    pause
    exit /b 1
)
echo [OK] Migracion creada
echo.

echo [3/4] Aplicando migracion a PostgreSQL...
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERROR] Fallo al aplicar migracion
    pause
    exit /b 1
)
echo [OK] Migracion aplicada
echo.

echo [4/4] Verificando conexion...
call npx prisma db push
if errorlevel 1 (
    echo [ERROR] Fallo al verificar conexion
    pause
    exit /b 1
)
echo [OK] Conexion verificada
echo.

echo ========================================
echo MIGRACION COMPLETADA CON EXITO!
echo ========================================
echo.
echo Tu base de datos PostgreSQL en Neon esta lista.
echo Ahora puedes iniciar tu app con: npm run dev
echo.
pause
