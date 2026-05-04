# Front Page News - Documentacion en español

## Indice

- [1. Vision general](#1-vision-general)
- [2. Objetivos del producto](#2-objetivos-del-producto)
- [3. Flujos principales de usuario](#3-flujos-principales-de-usuario)
- [4. Paginas y navegacion](#4-paginas-y-navegacion)
- [5. Bloques principales de UI](#5-bloques-principales-de-ui)
- [6. Modelo de datos y filtrado](#6-modelo-de-datos-y-filtrado)
- [7. Comportamiento responsive](#7-comportamiento-responsive)
- [8. Arquitectura](#8-arquitectura)
- [9. Estructura del proyecto](#9-estructura-del-proyecto)
- [10. Flujo de obtencion de datos](#10-flujo-de-obtencion-de-datos)
- [11. Cache y persistencia](#11-cache-y-persistencia)
- [12. Runtime en Vercel](#12-runtime-en-vercel)
- [13. Librerias y herramientas comunes](#13-librerias-y-herramientas-comunes)
- [14. Calidad y testing](#14-calidad-y-testing)
- [15. Lecturas adicionales](#15-lecturas-adicionales)

## 1. Vision general

Front Page News es una aplicacion Angular que agrega feeds RSS y Atom de medios españoles y los transforma en una experiencia de lectura de estilo editorial. La app esta pensada para escanear titulares rapidamente, navegar por secciones y medios, y mantener tiempos de respuesta razonables incluso cuando las fuentes externas son lentas o irregulares.

El producto no intenta extraer ni reproducir articulos completos. Utiliza metadatos de los feeds, muestra una vista previa contextual y dirige la lectura final a la web del medio original.

## 2. Objetivos del producto

- Reunir noticias actuales de multiples medios en un unico lugar.
- Permitir navegacion por seccion, medio y termino de busqueda.
- Mantener la interfaz util incluso cuando la red tarda en responder.
- Ocultar la complejidad de feeds, cache y snapshots tras una experiencia simple.
- Conservar siempre la atribucion al medio y la salida al articulo original.

## 3. Flujos principales de usuario

### Flujo de portada

1. El usuario entra en `/`.
2. La app hidrata contenido desde la capa valida mas rapida.
3. La portada muestra noticias destacadas, ultima hora, mas leidas, bloques editoriales mixtos y el directorio de medios.
4. El usuario puede abrir la vista rapida o navegar a un nivel mas profundo.

### Flujo por seccion

1. El usuario entra en `/seccion/:slug`.
2. La pagina carga noticias de esa seccion.
3. El usuario puede filtrar por medio y cambiar la ordenacion.
4. Las preferencias se guardan localmente para la siguiente visita.

### Flujo por medio

1. El usuario pulsa en el nombre de un medio.
2. La app navega a `/fuente/:slug`.
3. La pagina resuelve el medio, carga sus noticias y expone filtros por seccion dentro de ese ambito.

### Flujo de busqueda

1. El usuario pulsa el icono de buscar del navbar.
2. Se abre un modal responsive en lugar de navegar directamente.
3. La consulta se valida antes de cambiar de ruta.
4. Si hay resultados, la app navega a `/buscar?q=...`.
5. Si no hay resultados, el modal muestra el aviso y el usuario permanece en la pagina actual.

## 4. Paginas y navegacion

| Ruta | Funcion |
| --- | --- |
| `/` | Portada editorial |
| `/seccion/:slug` | Pagina de seccion |
| `/fuente/:slug` | Pagina de medio |
| `/buscar?q=...` | Resultados de busqueda |
| `/aviso-legal` | Aviso legal |
| `/privacidad` | Privacidad |
| `/cookies` | Cookies |

La navegacion tiene tres ejes principales:

- por seccion
- por medio
- por busqueda

## 5. Bloques principales de UI

- `app-navbar`
  - cabecera principal, cabecera sticky, enlaces de seccion, disparador de busqueda y ticker
- `app-news-carousel`
  - superficie hero de la portada
- `app-breaking-news`
  - lista rapida de titulares de actualidad
- `app-most-read-news`
  - bloque de descubrimiento por ranking
- `app-news-card`
  - tarjeta reutilizable de noticia
- `app-news-quick-view-modal`
  - vista previa contextual antes de salir al medio
- `app-section-filters`
  - filtros por medio en paginas de seccion
- `app-source-section-filters`
  - filtros por seccion en paginas de medio
- `app-news-refresh-indicator`
  - feedback no bloqueante para contenido stale y refrescos en segundo plano

## 6. Modelo de datos y filtrado

La app trabaja con contenido normalizado, no con payloads crudos de los feeds.

### Dimensiones principales de filtrado

- `section`
- `source`
- `search query`
- `sort direction`

### Donde se filtra

- Las paginas de seccion filtran por medio.
- Las paginas de medio filtran por seccion.
- Las paginas de busqueda filtran por medio.
- La API puede limitar el conjunto por seccion, ids de medio, id de articulo, consulta, pagina y limite.

### Por que importa

Este reparto mantiene cada filtro en la capa correcta:

- la API reduce el volumen cuando puede
- el frontend aplica refinamiento de vista y persistencia de preferencias

## 7. Comportamiento responsive

El responsive forma parte del producto:

- el navbar tiene version desktop y variante sticky/mobile
- la busqueda se resuelve en un modal centrado y usable en desktop y movil
- las rejillas de noticias colapsan progresivamente segun el breakpoint
- modales, filtros y CTAs siguen siendo operables en pantallas pequenas
- los bloques editoriales grandes mantienen jerarquia visual sin romper la lectura

## 8. Arquitectura

```mermaid
flowchart LR
    U[Usuario] --> A[Aplicacion Angular]
    A --> NS[NewsStore]
    A --> SS[SourcesStore]
    NS --> API[/api/news]
    SS --> SRC[/api/sources]
    API --> B[(Vercel Blob)]
    API --> F[Feeds RSS y Atom]
    A --> IDB[(IndexedDB)]
```

### Frontend

- Angular con componentes standalone
- estado basado en signals
- Tailwind CSS
- paginas guiadas por rutas

### Backend

- Vercel Functions
- parseo y agregacion en `server/`
- lectura y escritura de snapshots en Vercel Blob

### Modelo compartido

- contratos tipados reutilizados entre navegador y servidor
- claves normalizadas para cache y snapshots

## 9. Estructura del proyecto

```text
api/                  entradas serverless de Vercel
data/                 catalogo de fuentes en runtime
docs/                 documentacion por idioma
public/               assets estaticos
server/               parseo de feeds, agregacion, snapshots y cron
shared/               contratos y utilidades compartidas
src/app/components/   bloques de UI
src/app/pages/        paginas por ruta
src/app/services/     acceso a datos y persistencia en navegador
src/app/stores/       estado basado en signals
src/app/utils/        helpers de formato, rutas y filtrado
src/lib/              utilidades compartidas del lado cliente
```

### Carpetas frontend importantes

| Carpeta | Funcion |
| --- | --- |
| `src/app/components` | Unidades reutilizables de UI |
| `src/app/pages` | Pantallas de nivel ruta |
| `src/app/services` | Orquestacion hacia API y persistencia local |
| `src/app/stores` | Estado de vista y estado de frescura |
| `src/app/lib` | Claves de peticion, adapters y helpers de snapshots |
| `src/app/utils` | Helpers de rutas, etiquetas, filtrado y formato |

## 10. Flujo de obtencion de datos

La obtencion de datos esta organizada en capas:

1. Una pagina pide contenido a un store.
2. El store delega en un servicio frontend.
3. El servicio intenta primero las capas rapidas de hidratacion.
4. Si hace falta, llama a `/api/news` o `/api/sources`.
5. La API intenta primero leer un snapshot persistido.
6. Si no existe un snapshot valido, agrega feeds en vivo.
7. El payload se normaliza y vuelve al frontend.

Este diseno permite que la interfaz siga siendo estable mientras converte hacia datos mas frescos.

## 11. Cache y persistencia

### Memoria del navegador

- reutilizacion rapida de corta duracion dentro de la sesion

### IndexedDB

- hidratacion persistida en el navegador
- util para visitas repetidas
- optimizacion no critica: un fallo no debe romper el render

### Snapshots en Vercel Blob

- payloads persistidos y pregenerados
- mejoran el primer render de rutas comunes

### Stale-while-revalidate

- si el contenido es stale pero aun es renderizable, se mantiene visible
- los datos frescos pueden llegar en segundo plano
- la UI usa feedback no bloqueante en lugar de resets destructivos

## 12. Runtime en Vercel

La aplicacion se despliega como frontend y backend serverless sobre Vercel.

### Endpoints principales

- `/api/news`
- `/api/sources`
- `/api/image`
- `/api/cron/regenerate-snapshots`

### Que hace Vercel aqui

- sirve la aplicacion Angular
- ejecuta rutas API serverless
- ejecuta el cron protegido de snapshots
- almacena snapshots persistidos en Vercel Blob

Para mas detalle, ver [esp/vercel-runtime.md](./esp/vercel-runtime.md).

## 13. Librerias y herramientas comunes

- `@angular/*`
  - framework y router
- `rxjs`
  - flujos asincronos en servicios e integracion con servidor
- `@vercel/blob`
  - almacenamiento persistido de snapshots
- `tailwindcss`
  - estilo de la interfaz
- `vitest` y runner de tests de Angular
  - testing unitario e integracion
- `@playwright/test`
  - flujos end-to-end

## 14. Calidad y testing

El repositorio trata la validacion como parte del ciclo de desarrollo.

Comandos principales:

```bash
pnpm run lint
pnpm test
pnpm test:e2e
```

La suite cubre:

- componentes y rutas frontend
- stores y services
- handlers de API
- parseo y normalizacion RSS
- comportamiento de snapshots
- flujos e2e como busqueda, paginas de medio, filtros y modales

## 15. Lecturas adicionales

- [Guia de arquitectura en español](./esp/architecture.md)
- [Guia de runtime en Vercel en español](./esp/vercel-runtime.md)
- [Guia de cache y estados UI en español](./esp/cache-and-ui-states.md)
- [Alcance del producto en español](./esp/product-scope.md)
- [Normalizacion RSS en español](./esp/rss-normalization.md)
- [Notas del catalogo de fuentes en español](./esp/rss-sources.md)
- [Runbook de snapshots en español](./esp/snapshot-operations-runbook.md)
