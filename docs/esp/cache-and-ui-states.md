# Estrategia de cache, hidratacion y estados de UI

Este documento describe como Front Page News mantiene la interfaz rapida y estable aunque los feeds externos sean lentos o irregulares.

## Capas de cache

El flujo de noticias resuelve contenido en este orden:

1. cache en memoria del navegador
2. cache persistida en IndexedDB
3. snapshot persistido en Vercel Blob
4. peticion fresca al servidor

## Por que existen varias capas

- memoria para reutilizacion rapida
- IndexedDB para visitas repetidas en el mismo dispositivo
- Blob para mejorar el primer render de rutas comunes
- peticiones live para converger a datos frescos

## Modelo de frescura

- el contenido cacheado puede estar fresco
- puede estar stale pero seguir siendo renderizable
- si falta o expira, se cae a la siguiente capa

La regla principal es mantener visible el contenido renderizable mientras se revalida en segundo plano.

## Implicaciones en la UI

La UI no trata los datos stale como un error duro.

Puede mostrar:

- contenido stale visible
- indicadores de refresh en segundo plano
- avisos de frescura no bloqueantes

Los skeletons quedan reservados para los casos donde no existe ningun dato renderizable.

## Rol de IndexedDB

IndexedDB es una capa de resiliencia, no una dependencia dura.

- un fallo de lectura no debe romper la app
- un fallo de escritura no debe bloquear el render
- los registros expirados deben ignorarse

## Rol de los snapshots

Los snapshots en Blob son utiles sobre todo para:

- portada
- secciones base
- catalogo de medios

## Documentos relacionados

- [architecture.md](./architecture.md)
- [vercel-runtime.md](./vercel-runtime.md)
- [snapshot-operations-runbook.md](./snapshot-operations-runbook.md)
