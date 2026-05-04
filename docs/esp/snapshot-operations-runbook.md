# Runbook operativo de snapshots

Esta guia es la referencia operativa rapida del sistema de snapshots.

## Que cubre el sistema

- lecturas publicas de snapshots desde Vercel Blob
- regeneracion protegida por cron
- hidratacion del navegador desde IndexedDB y payloads persistidos

## Variables sensibles principales

- `SNAPSHOT_BLOB_BASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `CRON_SECRET`
- `NEWS_PERF_LOGS`

## Comprobaciones rapidas

### Salud de API

```bash
curl -i https://<app>/api/sources
curl -i "https://<app>/api/news?page=1&limit=20"
```

### Lanzar cron manualmente

```bash
curl -i \
  -H "Authorization: Bearer <CRON_SECRET>" \
  https://<app>/api/cron/regenerate-snapshots
```

### Validar snapshot directo

```bash
curl -i "https://<blob-base-url>/snapshots/<encoded-key>.json"
```

## Significado de fallos comunes

- un snapshot ausente no implica por si mismo una app rota
- un fallo de lectura en Blob debe caer al comportamiento live
- un secreto de cron incorrecto debe responder `401`
- la falta del token de escritura debe bloquear la regeneracion

## Regla operativa

Los snapshots son una capa de optimizacion. Si la API live funciona, el producto debe seguir funcionando aunque la hidratacion desde snapshots falle.
