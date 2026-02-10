# BACKLOG

Backlog principal del proyecto Front Page News.

## Tickets

| Ticket | Title | Description | Finalizado |
| ------ | ----- | ----------- | ---------- |
| [FPN-001](#fpn-001) | Fase 0 - Definicion de producto y alcance | Definir alcance, objetivos, restricciones y metricas. | ⬜ |
| [FPN-002](#fpn-002) | Fase 1 - UX/UI foundation | Definir layout, estados, tokens visuales y responsive baseline. | ⬜ |
| [FPN-003](#fpn-003) | Fase 2 - Branding | Definir naming, conceptos de logo y SVG final. | ⬜ |
| [FPN-004](#fpn-004) | Fase 3 - Arquitectura base repo | Estructurar Angular + Vercel Functions y base de rutas. | ⬜ |
| [FPN-005](#fpn-005) | Fase 4 - Modelo de datos y normalizacion RSS | Definir contratos y mapeo RSS/Atom a modelo unificado. | ⬜ |
| [FPN-006](#fpn-006) | Fase 5 - Backend Vercel Functions | Implementar `/api/sources` y `/api/news` con resiliencia. | ⬜ |
| [FPN-007](#fpn-007) | Fase 6 - Frontend Angular 21 | Implementar rutas, UI reutilizable y servicios de datos. | ⬜ |
| [FPN-008](#fpn-008) | Fase 7 - Estados y resiliencia | Cubrir loading/empty/error total/parcial con retry. | ⬜ |
| [FPN-009](#fpn-009) | Fase 8 - Testing | Implementar unit tests y e2e de flujos principales. | ⬜ |
| [FPN-010](#fpn-010) | Fase 9 - A11y, performance y SEO basico | Mejorar accesibilidad, rendimiento y metadata SEO. | ⬜ |
| [FPN-011](#fpn-011) | Fase 10 - Refactors planificados | Reducir deuda tecnica y ordenar capas internas. | ⬜ |
| [FPN-012](#fpn-012) | Fase 11 - Calidad y workflow | Consolidar linting, scripts, convenciones y reglas PR. | ⬜ |
| [FPN-013](#fpn-013) | Fase 12 - Documentacion final | Cerrar README, ADRs, guias de uso y despliegue. | ⬜ |
| [FPN-014](#fpn-014) | Fase 13 - Roadmap nice-to-have | Priorizar mejoras opcionales posteriores al MVP. | ⬜ |
| [FPN-015](#fpn-015) | Fase 14 - Gate final de done | Verificar cumplimiento integral de requisitos minimos. | ⬜ |
## Ticket Details

<a id="fpn-001"></a>

### [FPN-001] Fase 0 - Definicion de producto y alcance

- Description: Cerrar alcance funcional y no funcional del portfolio RSS.
- DoD:
  - Alcance incluye/excluye documentado.
  - Restricciones legales y tecnicas explicitadas.
  - Metricas de exito definidas.
- Tasks:
  - [ ] Definir propuesta de valor del producto.
  - [ ] Definir publico objetivo del portfolio.
  - [ ] Confirmar includes: portada, filtros, busqueda `q`, enlaces a fuente.
  - [ ] Confirmar excludes: scraping HTML, cuerpo completo de articulos, auth compleja.
  - [ ] Documentar limitaciones legales del agregador en `docs/product-scope.md`.
  - [ ] Definir metricas de exito (API, UX, resiliencia).
  - [ ] Registrar riesgos iniciales y mitigaciones.

<a id="fpn-002"></a>

### [FPN-002] Fase 1 - UX/UI foundation

- Description: Definir base visual y de experiencia de usuario mobile-first.
- DoD:
  - Layout principal definido.
  - Estados UI obligatorios definidos.
  - Tokens visuales reflejados en `DESIGN.md`.
- Tasks:
  - [ ] Definir layout con `Header`, `FiltersBar`, `NewsList`, `Footer`.
  - [ ] Definir estados: loading, empty, error parcial, error total.
  - [ ] Definir tokens de color tipografia y espaciado.
  - [ ] Definir iconografia con `@tabler/icons-angular` por imports explicitos.
  - [ ] Definir reglas responsive mobile-first por breakpoint.
  - [ ] Actualizar `DESIGN.md` con recipes de componentes.

<a id="fpn-003"></a>

### [FPN-003] Fase 2 - Branding

- Description: Seleccionar identidad de marca ligera y profesional.
- DoD:
  - Nombre del portal final decidido.
  - Concepto de logo elegido entre 3 opciones.
  - SVG final aplicado y favicon generado.
- Tasks:
  - [ ] Evaluar naming: `Pulso24`, `Titularia`, `Portada Sur`.
  - [ ] Diseñar 3 conceptos de logo (RSS+periodico, inicial titular, radar).
  - [ ] Seleccionar un concepto final.
  - [ ] Exportar `src/assets/brand/logo.svg`.
  - [ ] Exportar `public/favicon.svg`.
  - [ ] Integrar marca en header y metadatos.

<a id="fpn-004"></a>

### [FPN-004] Fase 3 - Arquitectura base repo

- Description: Montar estructura base del repo con frontend Angular y backend `/api`.
- DoD:
  - Arbol de carpetas acordado implementado.
  - Rewrites SPA configurados.
  - `vercel dev` funciona en local para frontend y API.
- Tasks:
  - [ ] Crear estructura `api/_lib` con modulos de soporte.
  - [ ] Crear estructura `src/app/core`, `features`, `shared/ui`.
  - [ ] Configurar `vercel.json` con fallback SPA y functions.
  - [ ] Verificar llamadas relativas `/api/*` en local.
  - [ ] Documentar estructura en README.

<a id="fpn-005"></a>

### [FPN-005] Fase 4 - Modelo de datos y normalizacion RSS

- Description: Definir contratos de datos y pipeline de normalizacion RSS/Atom.
- DoD:
  - Interfaces tipadas sin `any` para source/article/response.
  - Reglas de mapeo RSS/Atom implementadas y testeables.
  - Deduplicacion y orden temporal definidos.
- Tasks:
  - [ ] Definir `Source`, `Category`, `Article`, `Warning`, `NewsResponse`.
  - [ ] Implementar conversion de fechas a ISO.
  - [ ] Implementar mapeo de summary con sanitizacion a texto plano.
  - [ ] Definir estrategia de ID estable por hash.
  - [ ] Implementar dedupe por link canonical y fallback por titulo+fecha.
  - [ ] Definir orden por fecha descendente.

<a id="fpn-006"></a>

### [FPN-006] Fase 5 - Backend Vercel Functions

- Description: Implementar API serverless robusta con parciales, cache y timeout.
- DoD:
  - `GET /api/sources` operativo.
  - `GET /api/news` operativo con filtros y validaciones.
  - Cache headers correctos + warnings parciales en fallos.
  - Timeouts y dedupe aplicados.
- Tasks:
  - [ ] Implementar `api/sources.ts` con listado de fuentes y categorias.
  - [ ] Implementar `api/news.ts` con query params `source`, `category`, `q`, `page`, `limit`.
  - [ ] Validar params y limitar valores invalidos.
  - [ ] Fetch concurrente a feeds con `AbortController`.
  - [ ] Parsear XML y normalizar a `Article`.
  - [ ] Sanitizar summary a texto plano seguro.
  - [ ] Devolver resultados parciales con `warnings[]`.
  - [ ] Implementar cache de function + `Cache-Control: public, s-maxage=600, stale-while-revalidate=300`.
  - [ ] Implementar rate limit best-effort.

<a id="fpn-007"></a>

### [FPN-007] Fase 6 - Frontend Angular 21

- Description: Construir UI en Angular 21 con rutas lazy y componentes reutilizables.
- DoD:
  - Rutas principales funcionales.
  - Servicios de datos conectados a `/api/*`.
  - Estado UI consistente y responsive.
- Tasks:
  - [ ] Configurar routing + lazy loading.
  - [ ] Implementar rutas `/`, `/fuente/:id`, `/about`.
  - [ ] Crear `HeaderComponent`, `FiltersBarComponent`, `ArticleCardComponent`, `NewsListComponent`, `StatePanelsComponent`.
  - [ ] Implementar `NewsService` y `SourcesService`.
  - [ ] Implementar estado con signals + RxJS para I/O.
  - [ ] Añadir interceptor de errores HTTP.
  - [ ] Implementar cache cliente TTL por query key.

<a id="fpn-008"></a>

### [FPN-008] Fase 7 - Estados y resiliencia

- Description: Cubrir UX resiliente ante errores parciales y fallos totales.
- DoD:
  - Estados de carga, vacio y error implementados.
  - Warning de parciales visible sin romper listado.
  - Retry funcional.
- Tasks:
  - [ ] Mostrar banner de warnings por fuente caida.
  - [ ] Mostrar `meta.generatedAt` en UI.
  - [ ] Implementar retry manual en error total.
  - [ ] Implementar retry automatico acotado.
  - [ ] Mantener render parcial cuando existan articulos validos.
  - [ ] Definir CTA para reset en empty state.

<a id="fpn-009"></a>

### [FPN-009] Fase 8 - Testing

- Description: Garantizar calidad funcional con unit tests y e2e basicos.
- DoD:
  - Cobertura de funciones criticas de transformacion.
  - Flujos principales cubiertos en e2e.
  - Suite estable y repetible.
- Tasks:
  - [ ] Unit backend para `normalize.ts`, `dedupe.ts`, `sanitize.ts`, `news.ts`.
  - [ ] Unit frontend para `news.service`, home page y filtros.
  - [ ] E2E smoke: carga inicial, filtros, warning parcial, busqueda.
  - [ ] Aislar pruebas de feeds externos con mocks/fixtures.

<a id="fpn-010"></a>

### [FPN-010] Fase 9 - A11y, performance y SEO basico

- Description: Mejorar calidad de experiencia y descubribilidad sin sobre-ingenieria.
- DoD:
  - Landmarks y navegacion teclado correctos.
  - Lighthouse documentado con objetivos alcanzables.
  - Metadatos SEO basicos por ruta.
- Tasks:
  - [ ] Aplicar HTML semantico y foco visible.
  - [ ] Revisar contraste y `aria-live` en cambios dinamicos.
  - [ ] Optimizar render de listas (`trackBy`) y carga por rutas.
  - [ ] Configurar title/meta description y OpenGraph minimo.
  - [ ] Documentar resultados en `docs/performance.md`.

<a id="fpn-011"></a>

### [FPN-011] Fase 10 - Refactors planificados

- Description: Consolidar arquitectura interna y reducir deuda tecnica.
- DoD:
  - Utilidades compartidas extraidas.
  - Mappers y cliente de feed desacoplados.
  - Estado UI mas claro y mantenible.
- Tasks:
  - [ ] Extraer parser/validator de query params compartido.
  - [ ] Introducir `FeedClient` centralizado con timeout/retry.
  - [ ] Separar mappers RSS vs Atom.
  - [ ] Unificar `NewsViewState` en frontend.
  - [ ] Consolidar clases Tailwind repetidas.
  - [ ] Revisar si conviene unificar tipos compartidos.

<a id="fpn-012"></a>

### [FPN-012] Fase 11 - Calidad y workflow

- Description: Cerrar herramientas y convenciones de calidad del repo.
- DoD:
  - Lint/test/build configurados y estables.
  - Convencion de commits acordada y usable.
  - Checklist de calidad documentada.
- Tasks:
  - [ ] Confirmar TypeScript strict.
  - [ ] Configurar ESLint + Prettier.
  - [ ] Verificar scripts `pnpm run lint`, `pnpm test`, `pnpm run build`.
  - [ ] Definir ejemplos de Conventional Commits con ticket.
  - [ ] Configurar hook pre-commit opcional si aporta.
  - [ ] Crear `docs/quality-checklist.md`.

<a id="fpn-013"></a>

### [FPN-013] Fase 12 - Documentacion final

- Description: Dejar documentacion de nivel portfolio lista para evaluacion tecnica.
- DoD:
  - README completo de setup, arquitectura y deploy.
  - Contrato API documentado con ejemplos.
  - Sesion registrada en `SESSION.md`.
- Tasks:
  - [ ] Redactar README con setup local (`pnpm install`, `vercel dev`).
  - [ ] Documentar despliegue y estructura del proyecto.
  - [ ] Documentar decisiones tecnicas y tradeoffs.
  - [ ] Incluir limitaciones legales del agregador.
  - [ ] Anadir capturas desktop/mobile.
  - [ ] Crear/actualizar `docs/adr/`.
  - [ ] Actualizar `SESSION.md`.

<a id="fpn-014"></a>

### [FPN-014] Fase 13 - Roadmap nice-to-have

- Description: Priorizacion de mejoras posteriores al MVP.
- DoD:
  - Lista priorizada de mejoras opcionales.
  - Criterios de entrada para siguientes iteraciones.
- Tasks:
  - [ ] Definir busqueda avanzada con debounce.
  - [ ] Definir filtros persistidos por fuente/categoria.
  - [ ] Definir favoritos locales.
  - [ ] Definir modo oscuro por tokens.
  - [ ] Definir tendencias por terminos.
  - [ ] Definir compartir articulo (Web Share API).
  - [ ] Definir i18n ES/EN.

<a id="fpn-015"></a>

### [FPN-015] Fase 14 - Gate final de done

- Description: Validacion final integral de requerimientos minimos del proyecto.
- DoD:
  - Todos los criterios tecnicos minimos validados.
  - Calidad y documentacion en estado publicable.
- Tasks:
  - [ ] Verificar Angular 21 + routing + lazy loading.
  - [ ] Verificar componentes reutilizables en produccion.
  - [ ] Verificar `NewsService` con `/api/news` relativo.
  - [ ] Verificar endpoints `/api/sources` y `/api/news`.
  - [ ] Verificar cache de function y headers.
  - [ ] Verificar errores parciales con warnings.
  - [ ] Verificar dedupe por link/titulo.
  - [ ] Verificar normalizacion y orden de fechas.
  - [ ] Verificar sanitizacion de description.
  - [ ] Verificar timeouts en fetch de feeds.
  - [ ] Ejecutar lint/test/build y registrar resultado.
  - [ ] Verificar README, capturas y deploy en Vercel.




