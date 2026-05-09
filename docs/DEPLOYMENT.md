# Guía de Despliegue - Kwick

Esta guía cubre el despliegue de la landing page y aplicación de Kwick en diferentes entornos.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta en Vercel (recomendado) o acceso a servidor
- Variables de entorno configuradas (si aplica)
- Acceso al repositorio Git

## 🚀 Opción 1: Vercel (Recomendado)

### Por qué Vercel

- Optimizado para Next.js
- Deploy automático desde Git
- CDN global incluido
- HTTPS automático
- Preview deployments para cada PR

### Pasos

#### 1. Conectar Repositorio

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Login
vercel login
```

#### 2. Deploy desde Dashboard

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar repositorio desde GitHub/GitLab/Bitbucket
3. Configurar proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Variables de Entorno (si aplica)

Configurar en Vercel Dashboard → Settings → Environment Variables:

```bash
# Ejemplo (si hay variables necesarias)
NEXT_PUBLIC_API_URL=https://api.example.com
```

#### 4. Deploy

```bash
# Desde CLI
vercel --prod

# O hacer push a main (auto-deploy)
git push origin main
```

### URLs Generadas

- **Production**: `https://kwick.vercel.app`
- **Preview**: `https://kwick-{branch}.vercel.app`

---

## 🐳 Opción 2: Docker

### Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build y Ejecutar

```bash
# Construir imagen
docker build -t kwick .

# Ejecutar contenedor
docker run -p 3000:3000 kwick

# O con Docker Compose
docker-compose up -d
```

### Docker Compose

```yaml
version: '3.8'
services:
  kwick:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## 🖥️ Opción 3: Servidor VPS (Ubuntu/Debian)

### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm i -g pm2

# Clonar repositorio
cd /var/www
git clone <repo-url> kwick
cd kwick
```

### 2. Configurar Aplicación

```bash
# Instalar dependencias
npm ci --production

# Build
npm run build
```

### 3. Configurar PM2

```bash
# Crear ecosystem.config.js
cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'kwick',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
ECOSYSTEM

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Setup startup
pm2 startup
```

### 4. Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Configurar reverse proxy
sudo nano /etc/nginx/sites-available/kwick
```

```nginx
server {
    listen 80;
    server_name kwick.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/kwick /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kwick.tudominio.com
```

### 5. Deploy Automatizado

```bash
# Script de deploy
cat > deploy.sh << 'DEPLOY'
#!/bin/bash
cd /var/www/kwick
git pull origin main
npm ci --production
npm run build
pm2 restart kwick
echo "Deploy completado: $(date)"
DEPLOY

chmod +x deploy.sh
```

---

## 📊 Monitoreo y Logs

### PM2 Logs

```bash
# Ver logs en tiempo real
pm2 logs kwick

# Ver información de la app
pm2 show kwick

# Estadísticas
pm2 monit
```

### Vercel Analytics

1. Ir a Vercel Dashboard → Project → Analytics
2. Habilitar Web Analytics
3. Ver métricas en tiempo real

---

## 🔒 Seguridad

### Headers de Seguridad (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:;" always;
```

### Rate Limiting (Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location / {
        limit_req zone=one burst=20 nodelay;
        # ... resto de configuración
    }
}
```

---

## 📈 Performance Optimization

### Next.js Config

```javascript
// next.config.ts
const config = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'clsx'],
  },
};
```

### Compresión Gzip/Brotli

```nginx
# Brotli (mejor que gzip)
sudo apt install libbrotli-dev nginx-module-brotli -y

# Configurar Nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Limpiar caché
rm -rf .next node_modules
npm install
npm run build
```

### App No Responde

```bash
# Verificar PM2
pm2 status
pm2 restart kwick

# Verificar puertos
sudo netstat -tulpn | grep :3000

# Verificar logs
pm2 logs kwick --lines 100
```

### SSL Issues

```bash
# Renovar certificado
sudo certbot renew

# Verificar configuración
sudo nginx -t
```

---

## 📞 Soporte

Para issues de despliegue:

1. Revisar logs: `pm2 logs` o Vercel Dashboard
2. Verificar variables de entorno
3. Chequear configuración de Nginx: `sudo nginx -t`
4. Revisar recursos del servidor: `htop`, `df -h`

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0.0
