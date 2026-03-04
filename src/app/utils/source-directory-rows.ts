import { SOURCE_DIRECTORY_ALTERNATING_ROW_PATTERN } from '../constants/source-directory.constants';

import type { SourceDirectoryItem } from '../interfaces/source-directory-item.interface';

export function buildFixedRows(
  items: readonly SourceDirectoryItem[],
  rowCount: number,
): readonly (readonly SourceDirectoryItem[])[] {
  if (items.length === 0 || rowCount <= 0) {
    return [];
  }

  const rows: SourceDirectoryItem[][] = Array.from({ length: rowCount }, () => []);
  const perRow = Math.ceil(items.length / rowCount);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const start = rowIndex * perRow;
    const end = start + perRow;
    rows[rowIndex] = items.slice(start, end);
  }

  return rows.filter((row) => row.length > 0);
}

export function buildAlternatingRows(
  items: readonly SourceDirectoryItem[],
): readonly (readonly SourceDirectoryItem[])[] {
  const rows: SourceDirectoryItem[][] = [];
  let index = 0;
  let patternIndex = 0;

  while (index < items.length) {
    const take = SOURCE_DIRECTORY_ALTERNATING_ROW_PATTERN[patternIndex] ?? SOURCE_DIRECTORY_ALTERNATING_ROW_PATTERN[0];
    rows.push(items.slice(index, index + take));
    index += take;
    patternIndex = (patternIndex + 1) % SOURCE_DIRECTORY_ALTERNATING_ROW_PATTERN.length;
  }

  return rows;
}
