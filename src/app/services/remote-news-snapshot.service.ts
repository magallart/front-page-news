import { Injectable } from '@angular/core';

import { buildSnapshotBlobUrl, normalizeSnapshotBaseUrl } from '../../../shared/lib/snapshot-url';
import { environment } from '../../environments/environment';
import { toNewsRequestSnapshotKey } from '../lib/news-request';
import { adaptNewsSnapshot } from '../lib/news-snapshot-adapter';

import type { NewsRequestQuery } from './news.service';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';

@Injectable({ providedIn: 'root' })
export class RemoteNewsSnapshotService {
  async getNewsSnapshot(query: NewsRequestQuery = {}): Promise<NewsSnapshot | null> {
    const baseUrl = normalizeSnapshotBaseUrl(environment.snapshotBlobBaseUrl);
    if (!baseUrl || typeof globalThis.fetch !== 'function') {
      return null;
    }

    const snapshotKey = toNewsRequestSnapshotKey(query);
    const response = await this.fetchSnapshot(buildSnapshotBlobUrl(baseUrl, snapshotKey));
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
