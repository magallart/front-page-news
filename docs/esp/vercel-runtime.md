# Runtime en Vercel y pipeline de datos

Este documento explica como funciona Front Page News en Vercel y como viajan los datos desde los medios hasta la interfaz.

## Modelo de despliegue

El proyecto es un unico despliegue de Vercel que sirve:

- el frontend Angular
- rutas API serverless
- regeneracion programada de snapshots

## Endpoints principales de Vercel

| Ruta | Responsabilidad |
| --- | --- |
| `/api/news` | Devuelve payloads de noticias agregadas o hidratadas |
| `/api/sources` | Devuelve el catalogo de fuentes y secciones |
| `/api/image` | Hace proxy seguro de imagenes externas |
| `/api/cron/regenerate-snapshots` | Regenera snapshots base |

## Camino completo de datos

```mermaid
flowchart TD
    FE[Pagina Angular] --> API[/api/news]
    API --> SNAP[Snapshot en Vercel Blob]
    API --> LIVE[Feeds RSS y Atom en vivo]
    LIVE --> PARSE[Normalizacion y dedupe]
    PARSE --> RESP[Respuesta de noticias]
    RESP --> FE
```

## Como obtiene datos `/api/news`

### 1. Intento de entrega via snapshot

Para rutas comunes, la API puede servir primero un snapshot persistido cuando sigue siendo utilizable.

### 2. Fallback a agregacion live

Si no existe un snapshot valido, la API consulta los feeds del catalogo configurado y los agrega.

### 3. Normalizacion y dedupe

Los items live se normalizan a un contrato estable y despues se desduplican y ordenan.

### 4. Filtrado y paginacion

La respuesta puede acotarse por:

- id de articulo
- seccion
- ids de medio
- query de busqueda
- pagina
- limite

Esto evita que cada pagina tenga que trabajar con mas datos de los necesarios.

## Como funciona `/api/sources`

`/api/sources` expone el catalogo de medios usado por el frontend:

- identidad del medio
- URL base del publisher
- URL del feed
- secciones soportadas

Este endpoint alimenta navegacion por medio, directorio de fuentes y filtros conscientes del source.

## Rol del proxy de imagenes

El proxy existe porque las imagenes de los publishers son externas y no siempre son comodas de consumir directamente desde navegador.

El proxy aporta:

- un fetch mas seguro
- control centralizado
- consumo mas consistente desde frontend

## Modelo de cron

`vercel.json` programa una regeneracion diaria:

```json
{
  "crons": [
    {
      "path": "/api/cron/regenerate-snapshots",
      "schedule": "0 5 * * *"
    }
  ]
}
```

El cron se centra en rutas base como:

- portada
- secciones base
- catalogo de medios

No intenta precalcular cualquier combinacion arbitraria de filtros o queries.

## Por que importa Vercel Blob

Los snapshots reducen trabajo en frio para vistas comunes. Esto importa porque:

- agregar feeds en vivo es mas lento que servir un payload persistido
- las fuentes aguas arriba pueden ser irregulares
- en serverless interesa evitar recomputacion innecesaria

## Restricciones operativas

El runtime de Vercel tiene que equilibrar:

- cold starts
- limites de tiempo
- latencia de feeds externos
- tolerancia a fallos parciales

El producto acepta que la frescura perfecta no siempre compensa empeorar el primer render.

## Documentos relacionados

- [architecture.md](./architecture.md)
- [cache-and-ui-states.md](./cache-and-ui-states.md)
- [snapshot-operations-runbook.md](./snapshot-operations-runbook.md)
