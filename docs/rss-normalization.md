# RSS/Atom Normalization Rules (FPN-006)

This document defines the shared data contract and normalization strategy used by frontend and API.

## Unified Model

- `Source`: feed source metadata (`id`, `name`, `baseUrl`, `feedUrl`, `sectionSlugs`).
- `Section`: section metadata (`id`, `slug`, `name`).
- `Article`: normalized content item for UI/API consumption.
- `Warning`: non-fatal feed processing issue.
- `NewsResponse`: response envelope for aggregated news results.

## Date Normalization

- Input date values from RSS/Atom are parsed with `new Date(...)`.
- If parsing succeeds, output is always ISO UTC (`toISOString()`).
- If parsing fails or input is empty, output is `null`.

## Summary Normalization

- Remove `<script>` and `<style>` blocks.
- Strip all remaining HTML tags.
- Decode common entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&nbsp;`) and numeric entities.
- Collapse duplicated whitespace and trim.

## Stable Id Strategy

- Primary strategy: canonicalize article URL and hash it (`url-${hash}`).
- Canonicalization keeps protocol + lowercase host + cleaned path, drops query/fragment/trailing slash.
- Fallback strategy when URL is not usable: hash of `title + publishedAt` (`fallback-${hash}`).
- External feed id (`guid` or Atom `id`) is stored as `externalId` for traceability, but not used as the stable primary id.

## Dedupe Strategy

- Primary dedupe key: canonical URL.
- Fallback dedupe key: `title + publishedAt`.
- If two items share dedupe key, keep the most recent one.

## Temporal Ordering

- After dedupe, sort articles by `publishedAt` descending (newest first).
- Items without date (`publishedAt = null`) are ordered at the end.
