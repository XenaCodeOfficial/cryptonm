# 🚀 Guía de Deployment - Infomaniak

## Opción 1: Infomaniak Web Hosting (Node.js)

### Requisitos:
- Plan de hosting Infomaniak con soporte Node.js
- Acceso SSH o FTP
- Node.js 18+ en el servidor

### Pasos:

1. **Preparar el proyecto localmente:**
```bash
# Crear build de producción
npm run build

# Probar que funciona
npm start
```

2. **Subir archivos vía SFTP/SSH:**
```bash
# Archivos necesarios:
- .next/
- public/
- node_modules/ (o instalar en servidor)
- package.json
- package-lock.json
- next.config.mjs
- .env (con tus variables de entorno)
```

3. **En el servidor (vía SSH):**
```bash
# Instalar dependencias
npm install --production

# Iniciar aplicación
npm start
```

4. **Configurar PM2 para mantener la app corriendo:**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
pm2 start npm --name "nm-crypto" -- start

# Guardar configuración
pm2 save

# Auto-start al reiniciar servidor
pm2 startup
```

---

## Opción 2: Docker (Recomendado) ⭐

### Ventajas:
- Fácil deployment
- Portable entre servidores
- Aislado del sistema

### Pasos:

1. **Build Docker image:**
```bash
docker build -t nm-crypto-app .
```

2. **Subir a Docker Hub o registry privado:**
```bash
docker tag nm-crypto-app tu-usuario/nm-crypto-app
docker push tu-usuario/nm-crypto-app
```

3. **En servidor Infomaniak (con Docker):**
```bash
docker pull tu-usuario/nm-crypto-app
docker run -d -p 3000:3000 --env-file .env --name nm-crypto nm-crypto-app
```

---

## Opción 3: Exportar como sitio estático (Solo frontend)

⚠️ **Limitación:** No funcionará para rutas API o autenticación server-side.

```bash
# Configurar next.config.mjs para export estático
npm run build
npx next export
```

---

## Opción 4: Vercel (Más fácil - GRATIS) 🎉

### La opción MÁS FÁCIL y RECOMENDADA:

1. **Subir código a GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/nm-crypto-app.git
git push -u origin main
```

2. **Conectar con Vercel:**
- Ve a [vercel.com](https://vercel.com)
- Crea cuenta gratis
- Click "Import Project"
- Selecciona tu repo de GitHub
- Añade variables de entorno:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `COINGECKO_API_KEY`
  - `OPENAI_API_KEY`

3. **Deploy automático:**
- Vercel hace deploy automáticamente
- Cada push a GitHub = nuevo deploy
- HTTPS gratis
- CDN global

---

## Opción 5: Railway.app (Fácil + Base de datos)

1. Ve a [railway.app](https://railway.app)
2. Conecta GitHub
3. Selecciona tu proyecto
4. Railway detecta Next.js automáticamente
5. Añade PostgreSQL desde el dashboard
6. Configura variables de entorno

**Precio:** ~$5/mes

---

## Variables de Entorno necesarias (.env)

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="https://tu-dominio.com"

# APIs
COINGECKO_API_KEY="CG-xV8VHneERzBVcdHaDoRn76VH"
OPENAI_API_KEY="sk-proj-..."
COINMARKETCAP_API_KEY="ee52ae1948b14a68bfb1a174436250da"
COINAPI_API_KEY="d49ccf2f-06a2-44ff-a854-c978a260d0c8"
```

---

## ⚡ Mi Recomendación:

### Para desarrollo/prueba:
**Vercel** - Gratis, fácil, perfecto para Next.js

### Para producción con dominio propio:
1. **Vercel** + dominio personalizado (gratis)
2. O **Railway** si necesitas más control ($5/mes)
3. O **VPS Infomaniak** + Docker si ya tienes el plan

---

## 🔧 Configuración específica para Infomaniak VPS

Si tienes un VPS de Infomaniak:

### 1. Conectar vía SSH:
```bash
ssh tu-usuario@tu-servidor.infomaniak.com
```

### 2. Instalar requisitos:
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx (opcional para reverse proxy)
sudo apt install nginx -y
```

### 3. Configurar PostgreSQL:
```bash
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE nmcrypto;
CREATE USER nmuser WITH PASSWORD 'tu-password-seguro';
GRANT ALL PRIVILEGES ON DATABASE nmcrypto TO nmuser;
\q
```

### 4. Clonar y configurar proyecto:
```bash
# Crear directorio
mkdir -p /var/www/nm-crypto
cd /var/www/nm-crypto

# Subir archivos (vía git o SFTP)
git clone tu-repo.git .

# O subir vía SFTP y luego:
npm install --production
npm run build
```

### 5. Configurar variables de entorno:
```bash
nano .env
# Pega tus variables de entorno
# Ctrl+O para guardar, Ctrl+X para salir
```

### 6. Iniciar con PM2:
```bash
pm2 start npm --name "nm-crypto" -- start
pm2 save
pm2 startup
```

### 7. Configurar Nginx (reverse proxy):
```bash
sudo nano /etc/nginx/sites-available/nm-crypto
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/nm-crypto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL con Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com
```

---

## 📊 Comparación rápida:

| Opción | Dificultad | Precio | Control | Velocidad |
|--------|-----------|--------|---------|-----------|
| **Vercel** | ⭐ Muy fácil | Gratis | Medio | ⚡⚡⚡ |
| **Railway** | ⭐⭐ Fácil | $5/mes | Alto | ⚡⚡ |
| **Infomaniak VPS** | ⭐⭐⭐⭐ Difícil | €10-30/mes | Total | ⚡⚡ |
| **Docker** | ⭐⭐⭐ Medio | Varía | Alto | ⚡⚡ |

---

## ❓ ¿Qué opción elegir?

- **¿Quieres lo más fácil?** → Vercel
- **¿Ya tienes VPS Infomaniak?** → Sigue guía VPS arriba
- **¿Necesitas base de datos incluida?** → Railway
- **¿Múltiples apps?** → Docker en VPS

---

## 🆘 Problemas comunes:

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en package.json
"start": "next start -p 8080"
```

### Error: "Database connection failed"
- Verifica DATABASE_URL en .env
- Asegúrate que PostgreSQL está corriendo
- Verifica permisos de firewall

### Error: "API key invalid"
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate que no hay espacios extra en .env
