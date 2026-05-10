# Changelog

Todos los cambios notables en Kwick serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-10

### ✨ Agregado

#### Menú en Cascada (004-cascading-menu-epg)
- **Sistema de navegación por paneles** con distribución 25%/35%/40% del viewport
- **Panel de Categorías** (25%) - Lista de categorías disponibles
- **Panel de Canales** (35%) - Canales con logos y nombres
- **Panel de Guía EPG** (40%) - Programación con horarios y descripciones
- **Navegación por teclado completa**:
  - `M` - Abrir/cerrar menú
  - `←` `→` - Navegar entre paneles
  - `↑` `↓` - Navegar dentro del panel
  - `Enter` - Seleccionar item
  - `Esc` - Cerrar menú
- **Carga automática de EPG** al seleccionar un canal
- **Decodificación Base64 con UTF-8** para caracteres españoles (áéíóúüñ)
- **Cambio de canal instantáneo** al hacer clic en un canal
- **Preservación de estado** del menú sin afectar la reproducción de video

### 🔧 Técnico

#### Nuevos Archivos
- `app/types/menu.ts` - Tipos TypeScript para el menú
- `app/hooks/useCascadingMenu.ts` - Hook de gestión de estado del menú
- `app/components/menu/CategoriesPanel.tsx` - Componente de panel de categorías
- `app/components/menu/ChannelsPanel.tsx` - Componente de panel de canales
- `app/components/menu/EPGPanel.tsx` - Componente de panel EPG

#### Modificaciones
- `app/lib/xtream-api.ts` - Agregado método `getEPG()` para obtener guía de programas
- `app/hooks/useKeyboardNavigation.ts` - Soporte para navegación entre paneles
- `app/components/menu/MenuOverlay.tsx` - Layout para 3 paneles en cascada
- `app/player/page.tsx` - Integración completa del menú en cascada

## [1.0.0] - 2026-05-09

### ✨ Agregado

#### Landing Page
- **Landing page moderna** con diseño enfocado en simplicidad
- **Hero section** con propuesta de valor en español
- **Navbar sticky** con botón de login siempre visible
- **Sección de beneficios** con 6 tarjetas destacando:
  - Inicio rápido
  - Solo TV en vivo
  - Interfaz limpia
  - Calidad HD
  - Multi-dispositivo
  - Sin registro
- **Vista previa de la app** con mockup del reproductor
- **Sección "Cómo Funciona"** con proceso de 3 pasos
- **CTA final** para conversión
- **Footer** simple con copyright

#### Autenticación
- **Auto-redirect** para usuarios autenticados (3 segundos)
- **Banner de redirección** con cuenta regresiva
- **Opción "Quedarse"** para cancelar redirección
- **Navegación directa** al player desde navbar

#### Componentes UI
- **Button** con variantes (primary, secondary, ghost) y tamaños (sm, md, lg)
- **Section** wrapper con padding consistente y responsive
- **Toast** para notificaciones (success, error, info, warning)

#### Documentación
- **README.md** actualizado con branding de Kwick
- **DEPLOYMENT.md** con 3 opciones de despliegue:
  - Vercel (recomendado)
  - Docker
  - VPS (Ubuntu/Debian)
- **spec.md** con especificación completa de la feature
- **plan.md** con plan de implementación y decisiones técnicas
- **research.md** con investigación de mejores prácticas
- **tasks.md** con 69 tareas desglosadas
- **quickstart.md** con guía de inicio rápido
- **checklists/requirements.md** con validación de calidad

#### Especificaciones Técnicas
- **TypeScript** con strict mode habilitado
- **Next.js 16.2.6** con App Router
- **React 19.2.4** con componentes cliente
- **Tailwind CSS v4** con diseño mobile-first
- **Tipografía fluida** con clamp()
- **Optimizaciones de performance** para 90+ Lighthouse

### 🎨 Cambiado

- **Metadata SEO** actualizada a español
- **Página inicial** reemplaza redirect de auth con landing page
- **Título de la app**: "IPTV Player" → "Kwick - TV Simple. Sin Distracciones."
- **Descripción**: Enfocada en simplicidad y TV-only

### 🐛 Corregido

- **Error de renderizado** en AuthRedirectBanner (setState en effect)
- **TypeScript errors** en componentes nuevos
- **Lint warnings** en componentes de landing
- **CRITICAL: VideoPlayer recargaba canal constantemente** - Callbacks del padre (onError, onPlaying, etc.) cambiaban en cada render, causando que setupHls se recreara y destruyera la instancia de HLS.js. Solución: usar refs para callbacks, setupHls ahora solo depende de streamUrl y autoPlay
- **Menú interrumpía reproducción** - Al abrir/cerrar menú o navegar categorías, el video se recargaba. Solución: separar estado de navegación (refs) del estado de reproducción (useState)
- **Navegación de categorías cambiaba canal** - Flechas ←→ causaban cambio de canal. Solución: handlers actualizan solo refs de menú, currentChannel solo cambia con Enter/click

### 📊 Métricas

- **21 archivos** creados/modificados
- **1966 inserciones**, 39 eliminaciones
- **42/69 tareas** completadas (61%)
- **9 componentes** React nuevos
- **100% checklists** de requisitos aprobadas

### 🔧 Fix Crítico de Reproducción (Post-Landing)

**Problema**: Al abrir/cerrar menú o navegar categorías, el video se recargaba constantemente.

**Causa Raíz**: 
- VideoPlayer usaba callbacks como dependencias de setupHls
- Callbacks cambiaban en cada render del padre
- useEffect destruía y recreaba instancia HLS.js constantemente

**Solución**:
- Callbacks almacenados en refs (onErrorRef, onPlayingRef, etc.)
- setupHls ahora solo depende de [streamUrl, autoPlay, destroyHls]
- Estado de menú separado: refs para navegación, useState para reproducción
- VideoPlayer estable a menos que streamUrl cambie realmente

**Archivos Modificados**:
- `app/components/player/VideoPlayer.tsx` - Callbacks en refs
- `app/player/page.tsx` - Estado de menú con refs, debug logging

**Resultado**:
- ✅ Menú abrir/cerrar NO interrumpe video
- ✅ Navegación categorías NO interrumpe video
- ✅ Video solo cambia con selección explícita (Enter/click)
- ✅ HLS instance estable entre renders

---

## [0.1.0] - 2026-05-09

### Agregado

- Proyecto inicial con create-next-app
- Autenticación con Xtream Codes
- Reproductor de video con HLS.js
- Navegación por categorías de canales
- Grid de canales con selección

---

## Notas de Versión

### Versión 1.0.0

Esta es la primera versión mayor de Kwick, marcando el lanzamiento de la landing page oficial.

**Enfoque**: Simplificación máxima de la experiencia de usuario
**Idioma**: Contenido en español para el mercado objetivo
**Performance**: Objetivo 90+ en Lighthouse

### Próximas Versiones (Roadmap)

#### v1.1.0 (Próximamente)
- [ ] Agregar screenshot real de la app
- [ ] Optimizar Lighthouse score a 95+
- [ ] Agregar testimonios de usuarios
- [ ] Implementar analytics

#### v1.2.0
- [ ] Modo oscuro/claro toggle
- [ ] Soporte multi-idioma (i18n)
- [ ] PWA support
- [ ] Offline fallback

#### v2.0.0 (Futuro)
- [ ] Sistema de favoritos
- [ ] Historial de canales
- [ ] EPG (Electronic Program Guide)
- [ ] Grabación de programas

---

## Convenciones

### Tipos de Cambio

- **Added** (Agregado): Nuevas características
- **Changed** (Cambiado): Cambios en funcionalidad existente
- **Deprecated** (Obsoleto): Características que serán removidas
- **Removed** (Eliminado): Características removidas
- **Fixed** (Corregido): Corrección de bugs
- **Security** (Seguridad): Mejoras de seguridad

### Versionado

- **MAJOR**: Cambios incompatibles hacia atrás
- **MINOR**: Nuevas características (compatibles)
- **PATCH**: Corrección de bugs (compatibles)

---

**Mantenido por**: Equipo Kwick  
**Última actualización**: 2026-05-09
