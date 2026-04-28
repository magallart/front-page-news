import { Injectable } from '@angular/core';

import { toNewsSnapshotKey } from '../../../shared/lib/snapshot-key';
import { environment } from '../../environments/environment';
import { toNewsSnapshotQuery } from '../lib/news-request';
import { adaptNewsSnapshot } from '../lib/news-snapshot-adapter';

import type { NewsRequestQuery } from './news.service';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';

@Injectable({ providedIn: 'root' })
export class RemoteNewsSnapshotService {
  async getNewsSnapshot(query: NewsRequestQuery = {}): Promise<NewsSnapshot | null> {
    const baseUrl = normalizeBaseUrl(environment.snapshotBlobBaseUrl);
    if (!baseUrl || typeof globalThis.fetch !== 'function') {
      return null;
    }

    const snapshotKey = toNewsSnapshotKey(toNewsSnapshotQuery(query));
    const response = await this.fetchSnapshot(buildSnapshotUrl(baseUrl, snapshotKey));
    if (!response) {
      return null;
    }

    try {
      return adaptNewsSnapshot((await response.json()) as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  private async fetchSnapshot(url: string): Promise<Response | null> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return response;
    } catch {
      return null;
    }
  }
}

function normalizeBaseUrl(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function buildSnapshotUrl(baseUrl: string, snapshotKey: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/snapshots/${encodeURIComponent(snapshotKey)}.json`;
}
