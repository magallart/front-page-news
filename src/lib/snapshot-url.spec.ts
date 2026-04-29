import { describe, expect, it } from 'vitest';

import { buildSnapshotBlobPath, buildSnapshotBlobUrl, normalizeSnapshotBaseUrl } from '../../shared/lib/snapshot-url';

describe('shared/lib/snapshot-url', () => {
  it('normalizes configured base urls', () => {
    expect(normalizeSnapshotBaseUrl(undefined)).toBeNull();
    expect(normalizeSnapshotBaseUrl('   ')).toBeNull();
    expect(normalizeSnapshotBaseUrl(' https://blob.example.com/base/ ')).toBe('https://blob.example.com/base/');
  });

  it('builds a stable encoded blob path for snapshot keys', () => {
    expect(buildSnapshotBlobPath('news:id=-:section=actualidad:source=-:q=-:page=1:limit=300')).toBe(
      'snapshots/news%3Aid%3D-%3Asection%3Dactualidad%3Asource%3D-%3Aq%3D-%3Apage%3D1%3Alimit%3D300.json',
    );
  });

  it('builds public snapshot urls without duplicating trailing slashes', () => {
    expect(buildSnapshotBlobUrl('https://blob.example.com/base/', 'sources:default')).toBe(
      'https://blob.example.com/base/snapshots/sources%3Adefault.json',
    );
  });
});
