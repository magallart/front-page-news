import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { clearLine, cursorTo, moveCursor } from 'node:readline';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_FILE = 'docs/rss-sources.md';
const OUTPUT_FILE = 'reports/rss-health.json';
const CONTENT_TYPE_HINTS = ['xml', 'rss', 'atom'];
const XML_DECLARATION = '<?xml';
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const PROGRESS_BAR_WIDTH = 24;

/**
 * @typedef {{
 *   name: string;
 *   url: string;
 *   section: string;
 *   block: string;
 *   line: number;
 * }} FeedRecord
 */

/**
 * @typedef {{
 *   status: 'ok' | 'warn' | 'fail';
 *   name: string;
 *   section: string;
 *   url: string;
 *   line: number;
 *   checks: {
 *     httpStatus: number | null;
 *     finalUrl: string | null;
 *     contentType: string | null;
 *     format: 'rss' | 'atom' | 'xml' | 'unknown' | 'none';
 *     itemCount: number | null;
 *   };
 *   issues: string[];
 * }} FeedCheckResult
 */

async function main() {
  const { filePath, timeoutMs } = parseArgs(process.argv.slice(2));
  const markdown = await readFile(resolve(filePath), 'utf8');
  const records = parseFeedRecords(markdown);
  const catalogIssues = validateCatalog(records);
  const checks = await runHealthChecks(records, timeoutMs);

  const report = buildReport(filePath, timeoutMs, records, catalogIssues, checks);
  await writeReport(report);
  printSummary(report);

  if (report.summary.failCount > 0) {
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  let filePath = DEFAULT_FILE;
  let timeoutMs = DEFAULT_TIMEOUT_MS;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--file') {
      const value = args[index + 1];
      if (value) {
        filePath = value;
      }
      index += 1;
      continue;
    }

    if (arg === '--timeout-ms') {
      const value = Number.parseInt(args[index + 1] ?? '', 10);
      if (Number.isFinite(value) && value > 0) {
        timeoutMs = value;
      }
      index += 1;
    }
  }

  return { filePath, timeoutMs };
}

/**
 * @param {string} markdown
 * @returns {FeedRecord[]}
 */
function parseFeedRecords(markdown) {
  const lines = markdown.split(/\r?\n/);
  /** @type {FeedRecord[]} */
  const records = [];
  let currentBlock = '';

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? '';
    const line = rawLine.trim();

    if (line.startsWith('# ')) {
      currentBlock = line.replace(/^#\s+/, '').trim();
      continue;
    }

    if (!line.startsWith('- Nombre')) {
      continue;
    }

    const name = valueAfterColon(line);
    let url = '';
    let section = '';

    for (let lookAhead = index + 1; lookAhead < Math.min(index + 10, lines.length); lookAhead += 1) {
      const candidate = (lines[lookAhead] ?? '').trim();
      if (!url && candidate.startsWith('- URL:')) {
        url = valueAfterColon(candidate);
      }
      if (!section && candidate.startsWith('- Secci')) {
        section = valueAfterColon(candidate);
      }
    }

    records.push({
      name,
      url,
      section,
      block: currentBlock,
      line: index + 1,
    });
  }

  return records;
}

/**
 * @param {FeedRecord[]} records
 * @returns {string[]}
 */
function validateCatalog(records) {
  /** @type {string[]} */
  const issues = [];
  /** @type {Map<string, FeedRecord[]>} */
  const byUrl = new Map();
  /** @type {Map<string, FeedRecord[]>} */
  const byNameUrl = new Map();

  for (const record of records) {
    if (!record.name.trim()) {
      issues.push(`[name-empty] line ${record.line} (${record.block})`);
    }

    if (!record.url.trim()) {
      issues.push(`[url-empty] line ${record.line} (${record.block})`);
    } else {
      if (!isValidAbsoluteHttpUrl(record.url)) {
        issues.push(`[url-invalid] line ${record.line}: ${record.url}`);
      }
      addToGroup(byUrl, normalizeKey(record.url), record);
      addToGroup(byNameUrl, normalizeKey(`${record.name}|${record.url}`), record);
    }

    if (!record.section.trim()) {
      issues.push(`[section-empty] line ${record.line} (${record.block})`);
    }
  }

  for (const group of byUrl.values()) {
    if (group.length > 1) {
      const lines = group.map((item) => item.line).join(', ');
      issues.push(`[duplicate-url] lines ${lines}: ${group[0]?.url ?? ''}`);
    }
  }

  for (const group of byNameUrl.values()) {
    if (group.length > 1) {
      const lines = group.map((item) => item.line).join(', ');
      const first = group[0];
      issues.push(`[duplicate-name-url] lines ${lines}: ${first?.name ?? ''} | ${first?.url ?? ''}`);
    }
  }

  return issues;
}

/**
 * @param {FeedRecord[]} records
 * @param {number} timeoutMs
 * @returns {Promise<FeedCheckResult[]>}
 */
async function runHealthChecks(records, timeoutMs) {
  /** @type {FeedCheckResult[]} */
  const results = [];
  const total = records.length;
  let okCount = 0;
  let warnCount = 0;
  let failCount = 0;
  const interactive = process.stdout.isTTY;
  const startedAt = Date.now();
  let ticker = 0;
  let currentProgress = 0;
  let currentStatusLine = 'Starting checks...';
  let renderTimer = null;

  if (interactive) {
    const render = () => {
      const spinnerFrame = SPINNER_FRAMES[ticker % SPINNER_FRAMES.length] ?? SPINNER_FRAMES[0];
      renderProgressLine(
        buildProgressLine({
          current: currentProgress,
          total,
          okCount,
          warnCount,
          failCount,
          startedAt,
          spinnerFrame,
        }),
        currentStatusLine
      );
    };

    render();
    renderTimer = setInterval(() => {
      ticker += 1;
      render();
    }, 120);
  } else {
    console.log(`Checking ${total} feeds...`);
  }

  try {
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      const current = index + 1;
      currentStatusLine = `Checking: ${record.name} | ${record.section}`;
      const result = await checkFeed(record, timeoutMs);
      results.push(result);

      if (result.status === 'ok') okCount += 1;
      if (result.status === 'warn') warnCount += 1;
      if (result.status === 'fail') failCount += 1;

      currentProgress = current;
      currentStatusLine = formatFeedStatusLine(record, result);

      if (!interactive) {
        console.log(`[${current}/${total}] ${currentStatusLine}`);
      }
    }
  } finally {
    if (renderTimer) {
      clearInterval(renderTimer);
    }
  }

  if (interactive) {
    const spinnerFrame = SPINNER_FRAMES[ticker % SPINNER_FRAMES.length] ?? SPINNER_FRAMES[0];
    renderProgressLine(
      buildProgressLine({
        current: currentProgress,
        total,
        okCount,
        warnCount,
        failCount,
        startedAt,
        spinnerFrame,
      }),
      currentStatusLine
    );
    process.stdout.write('\n');
  }

  return results;
}

/**
 * @param {FeedRecord} record
 * @param {number} timeoutMs
 * @returns {Promise<FeedCheckResult>}
 */
async function checkFeed(record, timeoutMs) {
  /** @type {FeedCheckResult['checks']} */
  const checks = {
    httpStatus: null,
    finalUrl: null,
    contentType: null,
    format: 'none',
    itemCount: null,
  };
  /** @type {string[]} */
  const issues = [];

  if (!isValidAbsoluteHttpUrl(record.url)) {
    issues.push('invalid-url');
    return createResult('fail', record, checks, issues);
  }

  let response;
  try {
    response = await requestWithFallback(record.url, timeoutMs);
    checks.httpStatus = response.status;
    checks.finalUrl = response.url;
    checks.contentType = response.headers.get('content-type');
  } catch (error) {
    issues.push(`network-error:${toErrorMessage(error)}`);
    return createResult('fail', record, checks, issues);
  }

  if (!response.ok) {
    issues.push(`http-status:${response.status}`);
    return createResult('fail', record, checks, issues);
  }

  let body = '';
  try {
    body = await response.text();
  } catch (error) {
    issues.push(`read-error:${toErrorMessage(error)}`);
    return createResult('fail', record, checks, issues);
  }

  const contentType = checks.contentType?.toLowerCase() ?? '';
  if (!CONTENT_TYPE_HINTS.some((hint) => contentType.includes(hint))) {
    issues.push(`content-type-unexpected:${checks.contentType ?? 'none'}`);
  }

  if (!body.trim()) {
    issues.push('empty-body');
    return createResult('fail', record, checks, issues);
  }

  checks.format = detectXmlFormat(body);
  if (checks.format === 'unknown') {
    issues.push('xml-format-unknown');
  }

  checks.itemCount = countEntries(body);
  if (checks.itemCount === 0) {
    issues.push('items-empty');
  }

  if (issues.length === 0) {
    return createResult('ok', record, checks, issues);
  }

  const hasHardFailure = issues.some((issue) =>
    issue.startsWith('network-error') ||
    issue.startsWith('http-status') ||
    issue === 'empty-body'
  );

  return createResult(hasHardFailure ? 'fail' : 'warn', record, checks, issues);
}

async function requestWithFallback(url, timeoutMs) {
  try {
    const headResponse = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' }, timeoutMs);
    if (headResponse.status === 405) {
      return fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, timeoutMs);
    }
    return fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, timeoutMs);
  } catch {
    return fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, timeoutMs);
  }
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function detectXmlFormat(body) {
  const trimmed = body.trim().toLowerCase();
  if (!trimmed.startsWith(XML_DECLARATION) && !trimmed.startsWith('<rss') && !trimmed.startsWith('<feed')) {
    return 'unknown';
  }
  if (trimmed.includes('<rss')) {
    return 'rss';
  }
  if (trimmed.includes('<feed')) {
    return 'atom';
  }
  return 'xml';
}

function countEntries(body) {
  const itemMatches = body.match(/<item\b/gi) ?? [];
  const entryMatches = body.match(/<entry\b/gi) ?? [];
  return itemMatches.length + entryMatches.length;
}

function createResult(status, record, checks, issues) {
  return {
    status,
    name: record.name,
    section: record.section,
    url: record.url,
    line: record.line,
    checks,
    issues,
  };
}

function buildReport(filePath, timeoutMs, records, catalogIssues, checks) {
  const okCount = checks.filter((item) => item.status === 'ok').length;
  const warnCount = checks.filter((item) => item.status === 'warn').length;
  const failCount = checks.filter((item) => item.status === 'fail').length;
  const totalItemsDetected = checks.reduce((accumulator, check) => {
    return accumulator + (check.checks.itemCount ?? 0);
  }, 0);
  const warnings = checks
    .filter((item) => item.status === 'warn')
    .map((item) => toIncidentRecord(item));
  const failures = checks
    .filter((item) => item.status === 'fail')
    .map((item) => toIncidentRecord(item));
  const okBySection = countBySection(checks.filter((item) => item.status === 'ok'));

  return {
    generatedAt: new Date().toISOString(),
    inputFile: filePath,
    timeoutMs,
    summary: {
      totalFeeds: records.length,
      okCount,
      warnCount,
      failCount,
      totalItemsDetected,
      catalogIssueCount: catalogIssues.length,
    },
    catalogIssues,
    ok: {
      total: okCount,
      bySection: okBySection,
    },
    warnings,
    failures,
    issueFrequency: countIssues(checks),
  };
}

async function writeReport(report) {
  await mkdir(resolve('reports'), { recursive: true });
  await writeFile(resolve(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function printSummary(report) {
  const { summary } = report;

  console.log('RSS health check complete');
  console.log(`- Input: ${report.inputFile}`);
  console.log(`- Total feeds: ${summary.totalFeeds}`);
  console.log(`- ${colorize('OK', 'green')}: ${summary.okCount}`);
  console.log(`- ${colorize('WARN', 'yellow')}: ${summary.warnCount}`);
  console.log(`- ${colorize('FAIL', 'red')}: ${summary.failCount}`);
  console.log(`- Total items detected: ${summary.totalItemsDetected}`);
  console.log(`- Catalog issues: ${summary.catalogIssueCount}`);
  printWarningPreview(report.warnings);
  printFailurePreview(report.failures);
  console.log(`- Report: ${OUTPUT_FILE}`);
}

function formatFeedStatusLine(record, result) {
  const base = `${record.name} | ${record.section} -> ${result.status.toUpperCase()}`;
  if (result.status === 'ok') {
    return `${base} (${result.checks.itemCount ?? 0} items)`;
  }
  return `${base} (${result.issues.join(', ')})`;
}

function renderProgressLine(firstLine, secondLine) {
  clearLine(process.stdout, 0);
  cursorTo(process.stdout, 0);
  process.stdout.write(firstLine);
  process.stdout.write('\n');
  clearLine(process.stdout, 0);
  cursorTo(process.stdout, 0);
  process.stdout.write(secondLine);
  moveCursor(process.stdout, 0, -1);
}

function buildProgressLine({ current, total, okCount, warnCount, failCount, startedAt, spinnerFrame }) {
  const ratio = total > 0 ? current / total : 0;
  const filled = Math.round(ratio * PROGRESS_BAR_WIDTH);
  const empty = Math.max(PROGRESS_BAR_WIDTH - filled, 0);
  const filledBar = colorize('█'.repeat(filled), 'green');
  const emptyBar = colorize('░'.repeat(empty), 'gray');
  const bar = `[${filledBar}${emptyBar}]`;
  const elapsedSeconds = Math.max(Math.floor((Date.now() - startedAt) / 1000), 0);

  return `${spinnerFrame} ${bar} ${current}/${total} | ${colorize('OK', 'green')}:${okCount} ${colorize('WARN', 'yellow')}:${warnCount} ${colorize('FAIL', 'red')}:${failCount} | ${elapsedSeconds}s`;
}

function colorize(value, color) {
  if (!process.stdout.isTTY) {
    return value;
  }

  const colorCode =
    color === 'green' ? 32 : color === 'yellow' ? 33 : color === 'red' ? 31 : color === 'gray' ? 90 : 0;
  return `\u001b[${colorCode}m${value}\u001b[0m`;
}

function toIncidentRecord(item) {
  return {
    name: item.name,
    section: item.section,
    url: item.url,
    line: item.line,
    issues: item.issues,
    checks: item.checks,
  };
}

function countBySection(items) {
  const counts = {};
  for (const item of items) {
    const key = item.section || 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function countIssues(items) {
  const frequency = {};
  for (const item of items) {
    for (const issue of item.issues) {
      frequency[issue] = (frequency[issue] ?? 0) + 1;
    }
  }
  return Object.entries(frequency)
    .sort((first, second) => second[1] - first[1])
    .map(([issue, count]) => ({ issue, count }));
}

function printFailurePreview(failures) {
  if (!failures.length) {
    return;
  }

  console.log('- Failure preview:');
  for (const failure of failures.slice(0, 8)) {
    const reason = failure.issues[0] ?? 'unknown';
    console.log(`  - ${failure.name} (${failure.section}) -> ${reason}`);
  }
}

function printWarningPreview(warnings) {
  if (!warnings.length) {
    return;
  }

  console.log('- Warning preview:');
  for (const warning of warnings.slice(0, 8)) {
    const reason = warning.issues[0] ?? 'unknown';
    console.log(`  - ${warning.name} (${warning.section}) -> ${reason}`);
  }
}

function valueAfterColon(line) {
  const index = line.indexOf(':');
  return index >= 0 ? line.slice(index + 1).trim() : '';
}

function isValidAbsoluteHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeKey(value) {
  return value.trim().toLowerCase();
}

function addToGroup(groupMap, key, value) {
  const current = groupMap.get(key) ?? [];
  current.push(value);
  groupMap.set(key, current);
}

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

main().catch((error) => {
  console.error(`rss-health-check failed: ${toErrorMessage(error)}`);
  process.exitCode = 1;
});
