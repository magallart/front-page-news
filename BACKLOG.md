# BACKLOG

Backlog principal del proyecto Front Page News, enfocado en empezar a construir pantallas y componentes cuanto antes.

## Contexto de producto (resumen)

- Objetivo: portal unico para ver titulares/fotos/resumenes RSS de varios periodicos y abrir la noticia original.
- Stack principal: Angular 21 + Vercel Functions + RSS/Atom.
- Alcance MVP:
  - Pagina principal tipo diario digital.
  - Pagina de seccion (economia, cultura, justicia, actualidad, etc.).
  - Pagina de detalle de noticia (contenido parcial + enlace al medio).
- Fuentes: 5-8 periodicos por definir.
- Nota UX: usar boceto visual existente como orientacion de layout de portada.

## Tickets

| Ticket | Title | Description | Finalizado |
| ------ | ----- | ----------- | ---------- |
| [FPN-001](#fpn-001) | MVP y fuentes iniciales | Cerrar alcance real del MVP y lista corta de periodicos RSS. | [✔️] |
| [FPN-002](#fpn-002) | Shell de aplicacion y rutas | Montar navbar/footer/layout y rutas base de las 3 paginas. | [✔️] |
| [FPN-003](#fpn-003) | Portada (mock first) | Implementar portada tipo portal con bloques y componentes reutilizables con datos mock. | [✔️] |
| [FPN-004](#fpn-004) | Pagina de seccion (mock first) | Implementar pagina por seccion y navegacion desde portada. | [✔️] |
| [FPN-005](#fpn-005) | Pagina de noticia (mock first) | Implementar detalle parcial de noticia con CTA a fuente original. | [✔️] |
| [FPN-006](#fpn-006) | Modelo RSS unificado | Definir tipos y normalizacion RSS/Atom para frontend y API. | [ ] |
| [FPN-007](#fpn-007) | Vercel Functions RSS | Implementar `/api/sources` y `/api/news` con agregacion y resiliencia. | [ ] |
| [FPN-008](#fpn-008) | Integracion Angular + API | Sustituir mocks por datos reales y manejar estados de carga/error/parcial. | [✔️] |
| [FPN-009](#fpn-009) | Bloques editoriales de portada | Completar carousel, actualidad, secciones y "lo mas leido" del portal. | [ ] |
| [FPN-010](#fpn-010) | Revision de la aplicacion para la 1.0 | Ticket contenedor para bugs/cambios pre-release detectados en esta sesion. | [ ] |
| [FPN-011](#fpn-011) | Documentacion y cierre MVP | Documentar decisiones, limites y siguiente iteracion. | [ ] |
| [FPN-012](#fpn-012) | Roadmap post-1.0 | Definir y priorizar mejoras para una segunda fase del producto. | [ ] |

## Ticket Details

<a id="fpn-001"></a>

### [FPN-001] MVP y fuentes iniciales

- Description: Alinear alcance practico para no bloquear el desarrollo de UI.
- DoD:
  - Alcance MVP cerrado y documentado.
  - Lista inicial de 5-8 feeds RSS definida (aunque luego pueda cambiar).
  - Secciones editoriales iniciales definidas.
- Tasks:
  - [✔️] Documentar propuesta de valor y limite del agregador (sin mostrar articulo completo).
  - [✔️] Confirmar campos minimos por noticia: `title`, `summary`, `image`, `author`, `source`, `publishedAt`, `url`.
  - [✔️] Definir secciones iniciales: `actualidad`, `economia`, `cultura`, `justicia` (ajustables).
  - [✔️] Definir lista inicial de periodicos objetivo y URL RSS candidata.
  - [✔️] Documentar restricciones legales basicas en `docs/product-scope.md`.

<a id="fpn-002"></a>

### [FPN-002] Shell de aplicacion y rutas

- Description: Dejar navegable la app desde el inicio para iterar UI rapido.
- DoD:
  - Layout base con `Navbar`, `Main`, `Footer`.
  - Rutas funcionales para portada, seccion y detalle.
  - Base visual alineada con `DESIGN.md`.
- Tasks:
  - [✔️] Configurar rutas: `/`, `/seccion/:slug`, `/noticia/:id`.
  - [✔️] Crear componentes base: `navbar`, `footer`, `page-container`.
  - [✔️] Definir placeholders de contenido por ruta.
  - [✔️] Revisar responsive base (mobile-first).

<a id="fpn-003"></a>

### [FPN-003] Portada (mock first)

- Description: Construir primero la portada con datos mock para validar estructura visual.
- DoD:
  - Portada renderiza bloques principales del boceto.
  - Componentes reutilizables listos para conectar a API.
  - Navegacion a seccion/detalle operativa.
- Tasks:
  - [✔️] Crear componentes de UI: `news-card`, `news-carousel`, `section-block`, `most-read-list`.
  - [✔️] Implementar bloque "carousel de destacadas" (noticias aleatorias del mock).
  - [✔️] Redisenar el carousel como hero editorial con layout de dos columnas en portada.
  - [✔️] Integrar panel lateral de "en directo" dentro del bloque principal del hero.
  - [✔️] Ajustar alturas y comportamiento responsive del hero y bloque lateral para mantener alineacion visual.
  - [✔️] Refinar controles del carousel con iconos SVG dedicados (chevron-left/chevron-right).
  - [✔️] Incorporar icono SVG de apoyo en CTA de bloque editorial ("news").
  - [✔️] Mejorar legibilidad del hero (overlay oscuro, label de seccion, limites de lineas y truncado en textos largos).
  - [✔️] Ajustar bloque de "en directo" sin scroll interno, 4 noticias visibles y espaciado uniforme.
  - [✔️] Refinar separadores y marcadores visuales del bloque lateral para una jerarquia mas clara.
  - [✔️] Ajustar estilo y contraste del CTA del bloque lateral con hover accesible.
  - [✔️] Separar `breaking-news` como componente independiente manteniendo el mismo layout visual junto al hero.
  - [✔️] Redisenar `news-card` con estilo editorial (badge, imagen prioritaria, resumen acotado y metadatos compactos).
  - [✔️] Unificar tipografia editorial en bloques de noticias (titulos con `DM Serif Text` y cuerpos con `Commissioner`).
  - [✔️] Ajustar tipografia de `breaking-news` y jerarquia visual de titulares para mejorar legibilidad.
  - [✔️] Reestructurar la portada inferior en dos columnas (izquierda: secciones por genero; derecha: "lo mas leido").
  - [✔️] Reemplazar enlaces "Ver seccion" por CTA "Ver más" con estilo tipografico y microinteraccion de subrayado.
  - [✔️] Anadir icono dedicado `arrow-right` para reforzar visualmente los CTA de seccion.
  - [✔️] Renombrar y redisenar el bloque "lo mas leido" como componente `most-read-news` con estilo editorial coherente.
  - [✔️] Sustituir fecha por hora de publicacion en "lo mas leido" y adaptar mocks para soportar formato con hora.
  - [✔️] Explorar variantes visuales para "lo mas leido" (fondo oscuro y fondo dorado) y seleccionar variante final.
  - [✔️] Integrar icono `trending-up` en el titulo de "Lo más leído" para reforzar jerarquia visual.
  - [✔️] Ajustar anchura y separacion lateral de la columna derecha para alinear visualmente "breaking-news" y "lo mas leido".
  - [✔️] Ampliar listado mock de "lo mas leido" a 10 elementos para validar densidad del bloque.
  - [✔️] Implementar bloque "actualidad".
  - [✔️] Implementar bloque "2-3 noticias por seccion".
  - [✔️] Implementar bloque "lo mas leido" con criterio temporal mock.
  - [✔️] Redisenar footer editorial con columnas, logo e identidad visual.
  - [✔️] Implementar enlaces de interes y columna de periodicos en footer.
  - [✔️] Crear paginas legales mock (`/aviso-legal`, `/privacidad`, `/cookies`) y conectarlas desde footer.
  - [✔️] Extraer iconos sociales a componente reusable (`social-icon`).
  - [✔️] Ajustar footer responsive (columna unica centrada en movil).
  - [✔️] Redisenar header/navbar editorial con topbar, secciones centradas, buscador placeholder y ticker rotativo.
  - [✔️] Implementar ticker de "ultima hora" con rotacion continua, pausa en hover y enlaces a detalle.
  - [✔️] Implementar variante sticky del header con menu hamburguesa y drawer lateral.
  - [✔️] Aplicar responsive del header: sticky como variante principal en movil.
  - [✔️] Mostrar metadata compacta en movil (`DD-MM-YY · CIUDAD · TEMPERATURA`).
  - [✔️] Refactorizar `app-navbar` en subcomponentes (`main-header`, `sticky-header`, `ticker`, `side-menu`).
  - [✔️] Migrar interfaces compartidas a archivos individuales en carpeta `interfaces`.
  - [✔️] Extraer iconos SVG a componentes dedicados en `src/app/components/icons`.
  - [✔️] Implementar bateria de tests unitarios para header/navbar y subcomponentes clave.
  - [✔️] Implementar tests e2e para flujos desktop/mobile del header y guardas de branding (textos, colores e imagenes).
  - [✔️] Implementar snapshots visuales del header para desktop/tablet/mobile con estados cerrado/abierto en responsive.
  - [✔️] Centralizar mocks editoriales en `src/app/mocks` para reducir ruido en componentes.
  - [✔️] Crear `mock-news.service.ts` para encapsular acceso a datos mock y facilitar futura sustitucion por API real.
  - [✔️] Refactorizar footer para consumir datos mock centralizados (`footer.mock.ts`).
  - [✔️] Implementar bateria de tests unitarios para footer (contenido, enlaces legales, enlaces externos).
  - [✔️] Implementar tests e2e y snapshots visuales del footer (desktop y mobile).

<a id="fpn-004"></a>

### [FPN-004] Pagina de seccion (mock first)

- Description: Permitir al usuario abrir una seccion y explorar sus noticias.
- DoD:
  - Pagina `/seccion/:slug` funcional con listado filtrado.
  - Estados vacio/error definidos aunque sean mock.
- Tasks:
  - [✔️] Implementar encabezado de seccion con metadatos.
  - [✔️] Renderizar grid/lista de noticias de la seccion.
  - [✔️] Diseñar estado vacio con imagen y copy editorial para secciones sin noticias.
  - [✔️] Añadir filtros por periodico y orden por fecha en la pagina de seccion.
  - [✔️] Conectar clics a pagina de detalle.

<a id="fpn-005"></a>

### [FPN-005] Pagina de noticia (mock first)

- Description: Mostrar ficha ampliada de noticia sin replicar el contenido completo.
- DoD:
  - Pagina de detalle con campos informativos clave.
  - Boton visible para abrir noticia original.
  - Manejo de faltantes (sin imagen/sin autor).
- Tasks:
  - [✔️] Mostrar `title`, `summary`, `image`, `author`, `source`, `publishedAt`.
  - [✔️] Mostrar enlace/CTA "Leer en el medio original".
  - [✔️] Definir fallback de imagen y texto para datos ausentes.
  - [✔️] Añadir navegacion de retorno a portada o seccion.
  - [✔️] Reestructurar pagina de noticia con layout editorial de dos columnas (`articulo` + `sidebar`).
  - [✔️] Reutilizar componentes existentes en sidebar (`breaking-news`, `most-read-news`) y ocultarlos en movil.
  - [✔️] Crear componente `article-metadata` con formato de fecha responsive (`DD-MM-YY` en movil).
  - [✔️] Crear componente `article-preview-cta` con icono externo y estilos editoriales coherentes.
  - [✔️] Crear componente `article-locked-preview` para simular continuidad de contenido bloqueado.
  - [✔️] Crear componente `article-not-found` con imagen de error y CTA de retorno a portada.
  - [✔️] Refactorizar detalle en componentes pequenos (`article-content`, `article-not-found`) para simplificar mantenimiento.
  - [✔️] Añadir fallback de imagen local `/images/no-image.jpg` para feeds sin imagen.
  - [✔️] Anadir tests unitarios para pagina de noticia y nuevos componentes (`article-content`, `article-metadata`, `article-not-found`, `article-locked-preview`).

<a id="fpn-006"></a>

### [FPN-006] Modelo RSS unificado

- Description: Pasar de mocks a contrato real de datos para RSS/Atom.
- DoD:
  - Tipos TypeScript estrictos definidos sin `any`.
  - Normalizacion RSS/Atom documentada y testeable.
  - Estrategia de dedupe y orden temporal definida.
- Tasks:
  - [✔️] Definir tipos `Source`, `Section`, `Article`, `NewsResponse`, `Warning`.
  - [✔️] Definir reglas de normalizacion de fecha a ISO.
  - [✔️] Definir extraccion de `summary` a texto seguro.
  - [✔️] Definir id estable (`hash(url)` + fallback).
  - [✔️] Definir dedupe por URL canonica y fallback por `title + publishedAt`.
  - [✔️] Añadir `externalId` (`guid` RSS / `id` Atom) al modelo `Article` para trazabilidad.
  - [✔️] Crear script `pnpm rss:check` con validacion de catalogo y health-check real de feeds.
  - [✔️] Generar reporte JSON en `reports/rss-health.json` con resumen de `ok/warn/fail`.

<a id="fpn-007"></a>

### [FPN-007] Vercel Functions RSS

- Description: Implementar agregacion RSS y exponer endpoints para frontend.
- DoD:
  - `GET /api/sources` devuelve fuentes y secciones.
  - `GET /api/news` devuelve noticias agregadas/normalizadas.
  - Soporta fallos parciales sin romper respuesta.
- Tasks:
  - [✔️] Crear `api/sources.ts` con catalogo de fuentes inicial.
  - [✔️] Crear `api/news.ts` con filtros: `section`, `source`, `q`, `page`, `limit`.
  - [✔️] Hacer fetch concurrente con timeout (`AbortController`).
  - [✔️] Parsear RSS/Atom y mapear al modelo comun.
  - [✔️] Devolver `warnings[]` cuando una fuente falle.
  - [✔️] Añadir cache headers (`s-maxage` + `stale-while-revalidate`).
  - [✔️] Separar catalogo operativo de API en `data/rss-sources.json` y mantener `docs/rss-sources.md` para validacion/manual.
  - [✔️] Migrar `api/sources` y `api/news` para consumir catalogo tipado desde `data/rss-sources.json`.
  - [✔️] Añadir interfaz tipada de registros RSS (`RssSourceRecord`) y adaptar utilidades de catalogo a registros JSON.

<a id="fpn-008"></a>

### [FPN-008] Integracion Angular + API

- Description: Conectar UI ya construida a endpoints reales y retirar mocks.
- DoD:
  - Portada, seccion y detalle consumen API real.
  - Estados `loading`, `empty`, `error total`, `error parcial` implementados.
  - Reintento manual disponible.
- Tasks:
  - [✔️] Implementar `SourcesService` para `/api/sources` con tipos estrictos y adaptadores de respuesta.
  - [✔️] Implementar `NewsService` para `/api/news` con constructor de query params tipado.
  - [✔️] Implementar adaptadores tipados API->UI (`Article`/`Source` -> modelos de componentes) con fallback seguro para campos nulos.
  - [✔️] Implementar cache/deduplicacion en servicios HTTP con `shareReplay` por query (`section/source/q/page/limit`).
  - [✔️] Definir TTL de cache en cliente y API de invalidacion (`clear`, `invalidateBySection`, `forceRefresh`) con valores y comportamiento por defecto.
  - [✔️] Crear store de fuentes con `signals` (`loading`, `data`, `error`) y carga inicial reutilizable.
  - [✔️] Crear store de noticias con `signals` (`loading`, `data`, `error`, `warnings`, `lastUpdated`) y refresco manual.
  - [✔️] Definir matriz de estados UI (`loading`, `empty`, `error total`, `error parcial`) por portada, seccion y detalle.
    - [✔️] Conectar portada a datos reales desde `/api/news` manteniendo estructura editorial actual.
    - [✔️] Conectar pagina de seccion por `slug` con filtros (`source`, `q`, `page`, `limit`) y estado vacio.
    - [✔️] Eliminar limite duro en API y ampliar limite cliente para capturar el maximo de noticias por feed.
    - [✔️] Implementar revelado progresivo en seccion (`24` iniciales + `12` por clic) con CTA `Ver más noticias`.
    - [✔️] Conectar pagina de detalle por `id` sobre dataset agregado y definir fallback si no existe.
    - [✔️] Mejorar robustez de imagenes: fallback local, thumbnails de YouTube y proxy de imagen remota por API.
    - [✔️] Corregir copy en castellano (tildes y textos visibles clave) tras la integracion.
    - [✔️] Añadir interceptor HTTP para errores transversales, trazabilidad y mensajes de usuario coherentes.
    - [✔️] Retirar dependencias de `MockNewsService` en paginas y layout afectados por la integracion (incluyendo navbar/ticker si aplica).
    - [✔️] Eliminar mocks legacy restantes (`footer/mock-news/section/ticker`) e inyectar datos estaticos directamente en layout.
    - [✔️] Añadir tests unitarios para servicios/store (cache hit, cache miss, invalidacion, estados `loading/error/success`).
  - [✔️] Añadir tests de integracion de paginas clave (portada, seccion, detalle) con respuestas de API mockeadas.
  - [✔️] Documentar estrategia de cache cliente (TTL + invalidacion) y criterios de estados de error/parcial para mantenimiento futuro.
  - [✔️] Corregir respuesta inconsistente del proxy de imagen cuando `content-length` excede limite: devolver `413` antes de emitir headers `200`.
  - [✔️] Añadir timeout/cancelacion explicita en fetch de proxy de imagen (incluyendo redirects) con `AbortController` y respuesta `504` en timeout.
  - [✔️] Extraer utilidades compartidas de API para reducir duplicacion:
    - parse/validacion de catalogo RSS en `api/lib/rss-catalog.ts`
    - helper de respuesta JSON/cache en `api/lib/send-json.ts`
    - reutilizacion desde `api/news.ts` y `api/sources.ts`

<a id="fpn-009"></a>

### [FPN-009] Bloques editoriales de portada

- Description: Refinar experiencia tipo periodico digital ya con datos reales.
- DoD:
  - Carousel con seleccion estable y usable.
  - Bloques de portada coherentes en jerarquia visual.
  - "Lo mas leido" definido con criterio implementable.
- Tasks:
  - [✔️] Definir criterio MVP de "lo mas leido" (proxy por recencia/repeticion de fuente).
  - [✔️] Ajustar algoritmo de seleccion para destacadas.
  - [✔️] Reestructurar bloques de portada con una seleccion mixta (5 filas x 3 noticias), eliminando titulos de seccion y CTA "Ver más", y aplicando balance por seccion y fuente.
  - [✔️] Revisar equilibrio de noticias por seccion en portada.
  - [✔️] Añadir bloque de periodicos en portada.
  - [✔️] Corregir ortografia y tildes en textos visibles de portada/filtros para alinear el copy con español de España.

<a id="fpn-010"></a>

### [FPN-010] Revisión de la aplicación para la 1.0

- Description: Consolidar en un solo ticket los bugs y cambios de ultima hora antes de publicar la version 1.0.
- DoD:
  - Todas las correcciones acordadas en la sesion quedarán funcionalmente operativas y validadas.
  - Mantener funcionalidades actuales de la aplicación.
- Tasks:
  - [✔️] Eliminar por completo El Economista del catalogo de feeds y del directorio de fuentes (sources, homepage mapping y referencias en documentacion/tests).
  - [✔️] Forzar que cada navegacion entre paginas empiece en el top de la vista (sin mantener el scroll previo del navegador).
  - [✔️] Suavizar el scroll al top tras navegar entre paginas para evitar saltos bruscos y respetar `prefers-reduced-motion`.
  - [✔️] Corregir etiqueta de seccion en detalle para que no quede fijada en `ultima-hora` al deduplicar noticias compartidas entre feeds.
  - [✔️] Evitar perdida de imagen en noticias duplicadas entre feeds, fusionando variantes para conservar `imageUrl` y seccion editorial.
  - [✔️] Priorizar en parser la imagen principal de `media:content` (mayor tamano) frente a `media:thumbnail` para evitar fotos pixeladas.
  - [✔️] Seleccionar imagen segun contexto: miniatura en `news-card` y principal en detalle, con fallback a unica imagen disponible.
  - [✔️] En detalle de noticia, ocultar por completo el bloque de imagen cuando no exista foto valida o falle su carga, manteniendo el texto justo bajo la metadata.
  - [✔️] Normalizar artefactos comunes de codificacion (mojibake) en texto de feed (`title`, `summary`, `sourceName`, `author`) para mejorar legibilidad en detalle y listados.
  - [✔️] Ajustar metadatos del slider de portada: incluir `autor | periodico | hora-fecha` y en movil usar 3 columnas con truncado (`...`) para evitar roturas por autores largos.
  - [✔️] Retirar geolocalizacion temporalmente: eliminar solicitud de permisos del navegador y suprimir ciudad/temperatura del header hasta implementar la funcionalidad completa.
  - [✔️] Añadir boton global "volver arriba" visible tras cierto scroll, con animacion de entrada/salida y desplazamiento suave al top.
  - [✔️] Restringir el slider de portada para mostrar solo noticias con imagen real (excluyendo placeholders sin foto).
  - [✔️] Alinear a la derecha el nombre del periodico en `news-card` y forzar una sola linea con truncado para fuentes largas.
  - [✔️] Limitar autores en `news-card` a una sola linea con truncado (`...`) para evitar variaciones de altura entre tarjetas.
  - [✔️] Reordenar y actualizar secciones del header principal en orden alfabético, excluyendo `Todas` y distribuyendolas en dos líneas para mejorar legibilidad.
  - [✔️] Mantener `Última hora` solo en el menú lateral responsive, excluyendola de la navegación principal desktop.
  - [✔️] Decodificar entidades HTML numéricas del feed (p. ej. `&#8211;`, `&#124;`) en `title`, `summary`, `sourceName` y `author` para mostrar caracteres legibles.
  - [✔️] Hacer clicable la etiqueta `Última hora` del ticker del header para navegar a la sección `/seccion/ultima-hora`.
  - [✔️] Ajustar la sección "Visita las webs oficiales..." para que en tablet muestre logos en 2 líneas horizontales, simplificando el componente y eliminando la variante de 1 línea.
  - [✔️] Simplificar el footer para dejar un layout limpio con logo y redes en una sola fila, eliminando las columnas editoriales y el texto central.


<a id="fpn-011"></a>

### [FPN-011] Documentacion y cierre MVP

- Description: Cerrar primera entrega con documentacion clara y siguiente paso definido.
- DoD:
  - README actualizado con setup, arquitectura y despliegue.
  - Limitaciones y decisiones registradas.
  - Siguiente iteracion priorizada.
- Tasks:
  - [ ] Actualizar `README.md` con flujo local (`pnpm install`, `vercel dev`).
  - [ ] Documentar contrato de `/api/sources` y `/api/news`.
  - [ ] Documentar limitaciones del RSS agregador y campos no garantizados.
  - [ ] Registrar pendientes post-MVP en una seccion roadmap.
  - [ ] Actualizar `SESSION.md`.

<a id="fpn-012"></a>

### [FPN-012] Roadmap post-1.0

- Description: Definir y priorizar mejoras para una segunda fase del producto tras el release 1.0.
- DoD:
  - Lista de iniciativas post-1.0 priorizada por impacto/esfuerzo.
  - Dependencias y riesgos principales identificados.
  - Alcance recomendado para la siguiente iteracion documentado.
- Tasks:
  - [ ] Consolidar mejoras candidatas detectadas durante el cierre MVP.
  - [ ] Clasificar iniciativas por tipo (producto, UX, performance, plataforma).
  - [ ] Priorizar backlog post-1.0 con criterios de impacto y coste.
  - [ ] Identificar prerequisitos tecnicos para las 3 prioridades principales.
  - [ ] Definir propuesta de alcance para la siguiente iteracion.
