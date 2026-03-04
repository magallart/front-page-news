import { FEED_FETCH_TIMEOUT_MS } from '../constants/news.constants.js';

import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';
import type { Source } from '../../shared/interfaces/source.interface';

const HOME_MAX_FEEDS = 24;
const HOME_MAX_FEEDS_PER_SOURCE = 2;
const HOME_MAX_FEEDS_PER_SECTION = 3;
const HOME_FETCH_TIMEOUT_MS = 3500;
const HOME_QUERY_MIN_LIMIT = 200;
const HOME_SECTION_PRIORITY_ORDER = [
  'actualidad',
  'economia',
  'espana',
  'internacional',
  'cultura',
  'deportes',
  'ciencia',
  'tecnologia',
  'sociedad',
  'opinion',
  'ultima-hora',
];

export function selectFeedTargetsForFetch(
  sources: readonly SourceFeedTarget[],
  sectionSlug: string | null,
  sourceIds: readonly string[],
): readonly SourceFeedTarget[] {
  return sources.filter((source) => {
    if (sourceIds.length > 0 && !sourceIds.includes(source.sourceId)) {
      return false;
    }

    if (sectionSlug && source.sectionSlug !== sectionSlug) {
      return false;
    }

    return true;
  });
}

export function optimizeFeedTargetsForQuery(
  targets: readonly SourceFeedTarget[],
  query: NewsQuery,
): readonly SourceFeedTarget[] {
  if (!isHomepageQuery(query)) {
    return targets;
  }

  return selectHomepageFeedTargets(targets);
}

export function buildTargetsLookup(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, readonly SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const key = toFeedTargetKey(target.sourceId, target.feedUrl);
    const current = grouped.get(key) ?? [];
    current.push(target);
    grouped.set(key, current);
  }

  return grouped;
}

export function buildUniqueFetchSources(targets: readonly SourceFeedTarget[]): readonly Source[] {
  const unique = new Map<string, Source>();

  for (const target of targets) {
    const key = toFeedTargetKey(target.sourceId, target.feedUrl);
    if (unique.has(key)) {
      continue;
    }

    unique.set(key, toSource(target));
  }

  return Array.from(unique.values());
}

export function resolveFetchTimeoutMs(query: NewsQuery): number {
  return isHomepageQuery(query) ? HOME_FETCH_TIMEOUT_MS : FEED_FETCH_TIMEOUT_MS;
}

export function toFeedTargetKey(sourceId: string, feedUrl: string): string {
  return `${sourceId}|${feedUrl}`;
}

function selectHomepageFeedTargets(targets: readonly SourceFeedTarget[]): readonly SourceFeedTarget[] {
  if (targets.length <= HOME_MAX_FEEDS) {
    return targets;
  }

  const sectionOrder = buildHomepageSectionOrder(targets);
  const groupedBySection = groupTargetsBySection(targets);
  const groupedBySource = groupTargetsBySource(targets);
  const selected: SourceFeedTarget[] = [];
  const selectedKeys = new Set<string>();
  const selectedBySource = new Map<string, number>();
  const selectedBySection = new Map<string, number>();

  for (const sectionSlug of sectionOrder) {
    if (selected.length >= HOME_MAX_FEEDS) {
      break;
    }

    const sectionQueue = groupedBySection.get(sectionSlug);
    if (!sectionQueue || sectionQueue.length === 0) {
      continue;
    }

    const nextTarget = takeNextSelectableTarget(sectionQueue, selectedBySource, selectedBySection, selectedKeys);
    if (!nextTarget) {
      continue;
    }

    selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  const sourceOrder = Array.from(groupedBySource.keys());
  for (const sourceId of sourceOrder) {
    if (selected.length >= HOME_MAX_FEEDS) {
      break;
    }

    const sourceQueue = groupedBySource.get(sourceId);
    if (!sourceQueue || sourceQueue.length === 0) {
      continue;
    }

    while (sourceQueue.length > 0 && selected.length < HOME_MAX_FEEDS) {
      const nextTarget = sourceQueue[0];
      if (!nextTarget) {
        break;
      }

      if (isAlreadySelected(nextTarget, selectedKeys)) {
        sourceQueue.shift();
        continue;
      }

      if (!canSelectFeedTarget(nextTarget, selectedBySource, selectedBySection)) {
        break;
      }

      sourceQueue.shift();
      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      break;
    }
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  const sectionQueues = sectionOrder
    .map((sectionSlug) => groupedBySection.get(sectionSlug))
    .filter((queue): queue is SourceFeedTarget[] => Array.isArray(queue));
  let hasRemainingTargets = true;
  while (selected.length < HOME_MAX_FEEDS && hasRemainingTargets) {
    hasRemainingTargets = false;

    for (const queue of sectionQueues) {
      if (selected.length >= HOME_MAX_FEEDS) {
        break;
      }

      if (queue.length === 0) {
        continue;
      }

      const nextTarget = takeNextSelectableTarget(queue, selectedBySource, selectedBySection, selectedKeys);
      if (!nextTarget) {
        continue;
      }

      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      hasRemainingTargets = true;
    }
  }

  if (selected.length >= HOME_MAX_FEEDS) {
    return selected;
  }

  let hasRemainingBySource = true;
  while (selected.length < HOME_MAX_FEEDS && hasRemainingBySource) {
    hasRemainingBySource = false;

    for (const sourceId of sourceOrder) {
      if (selected.length >= HOME_MAX_FEEDS) {
        break;
      }

      const sourceQueue = groupedBySource.get(sourceId);
      if (!sourceQueue || sourceQueue.length === 0) {
        continue;
      }

      const nextTarget = sourceQueue.shift();
      if (!nextTarget) {
        continue;
      }

      const key = toFeedTargetKey(nextTarget.sourceId, nextTarget.feedUrl);
      if (selectedKeys.has(key)) {
        hasRemainingBySource = true;
        continue;
      }

      selectFeedTarget(nextTarget, selected, selectedKeys, selectedBySource, selectedBySection);
      hasRemainingBySource = true;
    }
  }

  return selected;
}

function groupTargetsBySource(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const current = grouped.get(target.sourceId);
    if (current) {
      current.push(target);
      continue;
    }

    grouped.set(target.sourceId, [target]);
  }

  return grouped;
}

function groupTargetsBySection(targets: readonly SourceFeedTarget[]): ReadonlyMap<string, SourceFeedTarget[]> {
  const grouped = new Map<string, SourceFeedTarget[]>();

  for (const target of targets) {
    const current = grouped.get(target.sectionSlug);
    if (current) {
      current.push(target);
      continue;
    }

    grouped.set(target.sectionSlug, [target]);
  }

  return grouped;
}

function buildHomepageSectionOrder(targets: readonly SourceFeedTarget[]): readonly string[] {
  const availableSections = new Set(targets.map((target) => target.sectionSlug));
  const ordered = HOME_SECTION_PRIORITY_ORDER.filter((sectionSlug) => availableSections.has(sectionSlug));
  const remaining = Array.from(availableSections).filter((sectionSlug) => !ordered.includes(sectionSlug));

  return [...ordered, ...remaining];
}

function takeNextSelectableTarget(
  queue: SourceFeedTarget[],
  selectedBySource: Map<string, number>,
  selectedBySection: Map<string, number>,
  selectedKeys: ReadonlySet<string> = new Set<string>(),
): SourceFeedTarget | null {
  while (queue.length > 0) {
    const candidate = queue[0];
    if (!candidate) {
      return null;
    }

    if (isAlreadySelected(candidate, selectedKeys)) {
      queue.shift();
      continue;
    }

    if (!canSelectFeedTarget(candidate, selectedBySource, selectedBySection)) {
      return null;
    }

    queue.shift();
    return candidate;
  }

  return null;
}

function canSelectFeedTarget(
  target: SourceFeedTarget,
  selectedBySource: ReadonlyMap<string, number>,
  selectedBySection: ReadonlyMap<string, number>,
): boolean {
  if ((selectedBySource.get(target.sourceId) ?? 0) >= HOME_MAX_FEEDS_PER_SOURCE) {
    return false;
  }

  if ((selectedBySection.get(target.sectionSlug) ?? 0) >= HOME_MAX_FEEDS_PER_SECTION) {
    return false;
  }

  return true;
}

function isAlreadySelected(target: SourceFeedTarget, selectedKeys: ReadonlySet<string>): boolean {
  const key = toFeedTargetKey(target.sourceId, target.feedUrl);
  return selectedKeys.has(key);
}

function selectFeedTarget(
  target: SourceFeedTarget,
  selected: SourceFeedTarget[],
  selectedKeys: Set<string>,
  selectedBySource: Map<string, number>,
  selectedBySection: Map<string, number>,
): void {
  const key = toFeedTargetKey(target.sourceId, target.feedUrl);
  selected.push(target);
  selectedKeys.add(key);
  selectedBySource.set(target.sourceId, (selectedBySource.get(target.sourceId) ?? 0) + 1);
  selectedBySection.set(target.sectionSlug, (selectedBySection.get(target.sectionSlug) ?? 0) + 1);
}

function isHomepageQuery(query: NewsQuery): boolean {
  return (
    query.id === null &&
    query.section === null &&
    query.sourceIds.length === 0 &&
    query.searchQuery === null &&
    query.page === 1 &&
    query.limit >= HOME_QUERY_MIN_LIMIT
  );
}

export function toSource(target: SourceFeedTarget): Source {
  return {
    id: target.sourceId,
    name: target.sourceName,
    baseUrl: target.sourceBaseUrl,
    feedUrl: target.feedUrl,
    sectionSlugs: [target.sectionSlug],
  };
}

