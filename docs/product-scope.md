# Product Scope - Front Page News (FPN-001)

## Goal

Build a personal learning project that aggregates RSS/Atom news from multiple newspapers into one portal so users can scan current headlines quickly and open the original article in each publisher site.

## MVP Includes

- Home page with digital-newspaper style blocks:
  - featured carousel
  - latest/current affairs block
  - 2-3 stories per section block
  - "most read" block (proxy logic for MVP)
- Section page: `/seccion/:slug`
  - list of stories filtered by section
  - secondary editorial block (latest or most read)
- Article detail page: `/noticia/:id`
  - partial article info only
  - clear CTA to open original publisher URL
- Shared layout:
  - navbar
  - footer
  - responsive page container

## MVP Excludes

- Full article content replication.
- HTML scraping of publisher pages.
- User accounts/authentication.
- Comments, reactions, or social features.
- Paid-content bypass.

## Minimum Article Fields

These are the minimum fields expected by UI and API contracts:

- `id`: stable identifier generated from URL/title+date fallback
- `title`: headline text
- `summary`: short plain-text extract from feed content
- `image`: main image URL if available
- `author`: feed author/creator if available
- `source`: publisher id/name
- `section`: normalized section slug
- `publishedAt`: ISO-8601 datetime
- `url`: canonical URL to original article

## Initial Section Taxonomy

- `actualidad`
- `economia`
- `cultura`
- `justicia`
- `deportes`
- `internacional`
- `tecnologia`

Notes:
- Not all sources expose all sections via RSS.
- Final mapping to each source feed will be normalized in RSS model tickets.

## Candidate RSS Source List (5-8 initial)

Status legend:
- `candidate`: proposed, pending technical validation
- `validated`: verified and approved for API integration

| Source | Country | Candidate RSS/Atom URL | Status |
| ------ | ------- | ---------------------- | ------ |
| El Pais | ES | `https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada` | candidate |
| El Mundo | ES | `https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml` | candidate |
| ABC | ES | `https://www.abc.es/rss/feeds/abcPortada.xml` | candidate |
| La Vanguardia | ES | `https://www.lavanguardia.com/rss/home.xml` | candidate |
| 20 Minutos | ES | `https://www.20minutos.es/rss/` | candidate |
| elDiario.es | ES | `https://www.eldiario.es/rss/` | candidate |
| Expansion | ES | `https://e00-expansion.uecdn.es/rss/portada.xml` | candidate |
| Cinco Dias | ES | `https://cincodias.elpais.com/seccion/rss/` | candidate |

## Legal and Policy Constraints (basic)

- Show only metadata available in RSS/Atom feeds (headline, summary, media, author, dates, source).
- Always provide clear link to original publisher article.
- Do not reproduce full copyrighted article body.
- Respect publisher terms of service and robots/publishing policies.
- Keep attribution visible (source name and link).

## MVP Acceptance Criteria

- User can scan headlines from multiple sources in one place.
- User can navigate to section pages and detail pages.
- User can open the original article in publisher site from detail page.
- UI handles missing RSS fields gracefully (image/author/summary).
