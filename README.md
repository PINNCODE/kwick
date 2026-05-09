# Kwick - TV Simple. Sin Distracciones.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

**Kwick** es un reproductor de IPTV minimalista enfocado 100% en la reproducción de canales de TV en vivo. Sin VOD, sin menús complejos, sin distracciones. Solo TV.

## ✨ Características

- 🎯 **Enfoque Simple**: Solo canales de TV en vivo, nada más
- ⚡ **Inicio Rápido**: Comienza a ver en segundos
- 🎨 **Interfaz Limpia**: Diseño minimalista que pone el contenido primero
- 📺 **Calidad HD**: Streaming optimizado para tu conexión
- 📱 **Multi-Dispositivo**: Funciona en navegador, tablet o móvil
- 🔐 **Sin Registro**: Usa tus credenciales de IPTV existentes

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+
- Credenciales de Xtream Codes de tu proveedor de IPTV

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd kwick

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la landing page.

### Uso

1. **Ingresa tus credenciales** - Usa las credenciales de Xtream Codes de tu proveedor
2. **Explora tus canales** - Navega por categoría o busca directamente
3. **Disfruta** - Selecciona un canal y comienza a ver inmediatamente

## 📁 Estructura del Proyecto

```
kwick/
├── app/
│   ├── components/
│   │   ├── landing/          # Componentes de la landing page
│   │   │   ├── Hero.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── BenefitsSection.tsx
│   │   │   ├── AppPreviewSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── FinalCTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AuthRedirectBanner.tsx
│   │   ├── ui/               # Componentes UI reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Section.tsx
│   │   │   └── Toast.tsx
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── player/           # Componentes del reproductor
│   │   └── menu/             # Componentes del menú
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilidades y funciones
│   ├── api/                  # API routes
│   ├── (auth)/               # Rutas de autenticación
│   ├── player/               # Página del reproductor
│   ├── page.tsx              # Landing page
│   └── layout.tsx            # Layout principal
├── specs/                    # Documentación de características
│   └── 002-landing-page-tv-app/
│       ├── spec.md           # Especificación de la feature
│       ├── plan.md           # Plan de implementación
│       ├── research.md       # Investigación técnica
│       ├── tasks.md          # Lista de tareas
│       └── quickstart.md     # Guía de inicio rápido
└── package.json
```

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.2.6 | Framework React |
| React | 19.2.4 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Estilos |
| HLS.js | 1.6.16 | Reproducción HLS |
| Zustand | 5.0.13 | State management |
| SWR | 2.4.1 | Data fetching |

## 📊 Métricas de Performance

Objetivos de Lighthouse:

- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

Core Web Vitals:
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **INP**: < 200ms

## 🧪 Development

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 📝 Features Documentadas

Cada feature incluye documentación completa en el directorio `specs/`:

- **spec.md**: Especificación con user stories y criterios de aceptación
- **plan.md**: Plan de implementación con decisiones técnicas
- **research.md**: Investigación de mejores prácticas
- **tasks.md**: Lista de tareas con dependencias
- **quickstart.md**: Guía de inicio rápido para desarrolladores

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Construir imagen
docker build -t kwick .

# Ejecutar
docker run -p 3000:3000 kwick
```

## 🤝 Contribuir

1. Crear feature branch: `git checkout -b feature/nueva-feature`
2. Commit cambios: `git commit -m 'feat: agregar nueva feature'`
3. Push a branch: `git push origin feature/nueva-feature`
4. Abrir Pull Request

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin cambios de código)
- `refactor:` Refactorización
- `test:` Agregar tests
- `chore:` Cambios de mantenimiento

## 📄 Licencia

MIT - ver [LICENSE](LICENSE) para más detalles.

## 🔗 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React](https://react.dev/learn)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Hecho con ❤️ para amantes de la TV**
