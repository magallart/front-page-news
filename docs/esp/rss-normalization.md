# Normalizacion de RSS y Atom

Este documento explica como los feeds externos se transforman en contratos internos estables.

## Objetivo

Los publishers exponen estructuras heterogeneas. La capa de normalizacion las convierte en un modelo predecible para la API y la UI.

## Entidades principales normalizadas

- source
- section
- article
- warning
- aggregated response

## Reglas importantes de normalizacion

### Fechas

- se parsean desde la entrada del feed
- se convierten a ISO cuando son validas
- se guardan como `null` cuando faltan o no son validas

### Texto y resumenes

- se elimina HTML peligroso o ruidoso
- se preservan saltos y parrafos legibles cuando es posible
- se decodifican entidades
- se normalizan espacios

### Identidad estable

- se prioriza una identidad basada en URL canonica
- si no es posible, se usa un fallback basado en titulo y fecha

### Dedupe

Cuando dos entradas representan la misma noticia, el sistema intenta conservar la combinacion mas rica de:

- mejor seccion
- mejores campos de imagen
- resumen mas largo
- autor cuando existe

## Por que importa esta capa

Sin esta normalizacion, el resto de la aplicacion tendria que entender demasiadas variaciones de feeds.
