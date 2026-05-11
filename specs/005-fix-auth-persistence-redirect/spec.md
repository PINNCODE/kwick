# Feature Specification: Fix Auth Persistence Redirect on Page Refresh

**Feature Branch**: `005-fix-auth-persistence-redirect`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: Bug report — al refrescar /player redirige a /login perdiendo credenciales de localStorage

## Clarifications

### Session 2026-05-10

- Q: ¿Qué constituye "credenciales válidas" — solo presencia en localStorage o verificación API? → A: Verificar contra la API con un health/auth check antes de permitir acceso.
- Q: ¿Cuál es el timeout máximo para la verificación de API? → A: 5 segundos de timeout.
- Q: Si la verificación de API falla (timeout o error de red), ¿redirigir a /login o permitir acceso? → A: Mostrar mensaje de error con botón de reintentar, mantener credenciales locales.

## User Scenarios & Testing

### User Story 1 - Mantener sesión activa al refrescar página (Priority: P1)

Como usuario que ya inició sesión correctamente, al refrescar la página en el reproductor (/player), espero que la aplicación reconozca mis credenciales almacenadas y me mantenga en la página del reproductor, sin pedirme que vuelva a iniciar sesión.

**Why this priority**: Este es el bug central — afecta la experiencia de uso diario. Cada refresh obliga a re-login innecesario, frustrando al usuario y rompiendo el flujo de visualización.

**Independent Test**: Iniciar sesión, navegar a /player, refrescar la página (F5), y verificar que el usuario permanece en /player sin redirección a /login.

**Acceptance Scenarios**:

1. **Given** el usuario tiene credenciales válidas almacenadas en localStorage, **When** refresca la página en /player, **Then** la aplicación restaura la sesión y permanece en /player
2. **Given** el usuario tiene credenciales válidas almacenadas, **When** abre una nueva pestaña y navega directamente a /player, **Then** la aplicación restaura la sesión y muestra el reproductor
3. **Given** el usuario no tiene credenciales almacenadas (primera visita o logout), **When** navega a /player, **Then** es redirigido a /login para autenticarse

### Edge Cases

- **Credenciales expiradas o inválidas en localStorage**: El sistema debe detectar credenciales inválidas y redirigir a /login limpiamente, sin mostrar errores técnicos
- **localStorage deshabilitado o corrupto**: El sistema debe manejar gracefully la imposibilidad de leer/escribir localStorage, redirigiendo a /login con un mensaje amigable
- **Refresh durante carga inicial**: Si el usuario refresca mientras la página aún está cargando, la restauración de sesión debe completarse antes de decidir redirigir
- **Múltiples pestañas abiertas**: Si el usuario cierra sesión en una pestaña, las demás pestañas deben reflejar el estado actualizado
- **API no disponible durante verificación**: Si el health check contra la API falla (servidor caído, timeout superior a 5 segundos), el sistema debe mostrar un mensaje de error amigable con botón de reintentar, manteniendo las credenciales locales intactas, sin redirigir a /login

## Requirements

### Functional Requirements

- **FR-001**: El sistema MUST restaurar las credenciales desde localStorage y verificarlas contra la API antes de evaluar si redirigir a /login
- **FR-002**: El sistema MUST mostrar un estado de carga ("Verificando sesión...") mientras se restaura la autenticación persistida y se verifica contra la API, sin redirigir prematuramente
- **FR-003**: El sistema MUST redirigir a /login únicamente cuando no existan credenciales en localStorage o cuando la verificación contra la API falle explícitamente
- **FR-004**: El sistema MUST limpiar las credenciales de localStorage cuando el usuario cierre sesión explícitamente
- **FR-005**: El sistema MUST manejar errores de lectura de localStorage sin crashear, redirigiendo a /login como fallback seguro

### Key Entities

- **Sesión autenticada**: Estado que indica que el usuario tiene credenciales válidas (host, username, password) almacenadas y verificadas
- **Estado de hidratación**: Indicador de si el sistema de persistencia terminó de leer localStorage y restauró el estado de autenticación

## Success Criteria

### Measurable Outcomes

- **SC-001**: Al refrescar /player con credenciales válidas en localStorage, el usuario permanece en /player en el 100% de los casos
- **SC-002**: El tiempo de restauración de sesión tras un refresh es inferior a 500ms (percepción de carga instantánea)
- **SC-003**: Usuarios sin credenciales almacenadas son redirigidos a /login correctamente en el 100% de los casos
- **SC-004**: Cero redirecciones innecesarias a /login cuando las credenciales persistidas son válidas

## Assumptions

- El sistema de autenticación existente (Zustand + persist middleware) ya guarda correctamente las credenciales en localStorage
- El problema es de timing: la verificación de autenticación ocurre antes de que Zustand complete la hidratación desde localStorage
- Las credenciales almacenadas no expiran automáticamente — la validación se hace al momento de uso (llamada a API)
- No se requiere cambio en el flujo de login/logout existente, solo en la restauración de sesión al cargar la página
