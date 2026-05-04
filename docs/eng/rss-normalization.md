# RSS and Atom Normalization

This document explains how external feeds are normalized into stable internal contracts.

## Goal

Publishers expose inconsistent feed structures. The normalization layer converts them into a predictable model for the API and the UI.

## Main normalized entities

- source
- section
- article
- warning
- aggregated response

## Important normalization rules

### Dates

- parsed from feed input
- converted to ISO strings when valid
- stored as `null` when invalid or missing

### Text and summaries

- strip dangerous or noisy HTML
- preserve readable paragraph boundaries when possible
- decode entities
- normalize whitespace

### Stable ids

- prefer canonicalized URL-based identity
- fall back to title plus publication date when needed

### Dedupe

When two feed entries represent the same story, the system merges them and preserves the richer combination of:

- better section
- richer image fields
- longer summary
- author data when available

## Why this layer matters

Without normalization, the rest of the application would have to understand every feed variation. This layer keeps the rest of the product much simpler.
