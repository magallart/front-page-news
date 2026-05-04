# RSS Sources Catalog

This document explains how source configuration is organized.

## Where the source catalog lives

Runtime source definitions are maintained in the project catalog under `data/`.

Each source entry maps:

- source identity
- publisher base URL
- feed URL
- section coverage

## What the catalog is used for

- `/api/sources` response generation
- live feed aggregation
- source directory rendering
- source-page resolution
- section and source filtering metadata

## Practical notes

- not every publisher exposes all sections
- some sources are section-specific
- some sources are general or unfiltered feeds
- source quality can vary over time and may require maintenance

## Maintenance guidance

When adjusting the catalog:

- preserve stable source ids when possible
- keep section mapping explicit
- validate feed health before relying on a new source
- remember that poor-quality feeds can degrade product quality quickly
