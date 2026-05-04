# Catalogo de fuentes RSS

Este documento explica como se organiza la configuracion de medios y feeds.

## Donde vive el catalogo

Las fuentes en runtime se mantienen en el catalogo del proyecto dentro de `data/`.

Cada entrada mapea:

- identidad del medio
- URL base del publisher
- URL del feed
- cobertura por secciones

## Para que se usa

- generacion de `/api/sources`
- agregacion live de feeds
- directorio de medios
- resolucion de paginas por medio
- metadatos para filtros por medio y seccion

## Notas practicas

- no todos los medios exponen todas las secciones
- algunas fuentes son especificas por seccion
- otras son feeds generales o sin filtrar
- la calidad del feed puede variar con el tiempo

## Guia de mantenimiento

- mantener ids estables cuando sea posible
- dejar explicito el mapeo de secciones
- validar la salud del feed antes de confiar en una nueva fuente
- recordar que un feed pobre degrada rapido la calidad del producto
