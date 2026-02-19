import { inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';

import { NewsService } from '../services/news.service';
import { getUserErrorMessage } from '../utils/app-http-error.utils';

import type { NewsResponse } from '../../interfaces/news-response.interface';
import type { Warning } from '../../interfaces/warning.interface';
import type { NewsRequestQuery } from '../services/news.service';

@Injectable({ providedIn: 'root' })
export class NewsStore {
  private readonly newsService = inject(NewsService);
  private readonly lastQuerySignal = signal<NewsRequestQuery | null>(null);
  private activeRequestId = 0;

  private readonly loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly dataSignal = signal<NewsResponse['articles']>([]);
  readonly data = this.dataSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly warningsSignal = signal<readonly Warning[]>([]);
  readonly warnings = this.warningsSignal.asReadonly();

  private readonly lastUpdatedSignal = signal<number | null>(null);
  readonly lastUpdated = this.lastUpdatedSignal.asReadonly();

  load(query: NewsRequestQuery = {}): void {
    this.lastQuerySignal.set({ ...query });
    this.fetchNews(query, false);
  }

  refresh(): void {
    const query = this.lastQuerySignal();
    if (!query) {
      return;
    }

    this.fetchNews(query, true);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private fetchNews(query: NewsRequestQuery, forceRefresh: boolean): void {
    const requestId = this.activeRequestId + 1;
    this.activeRequestId = requestId;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.newsService
      .getNews(query, { forceRefresh })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (requestId !== this.activeRequestId) {
            return;
          }

          this.dataSignal.set(response.articles);
          this.warningsSignal.set(response.warnings);
          this.lastUpdatedSignal.set(Date.now());
          this.loadingSignal.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.activeRequestId) {
            return;
          }

          this.errorSignal.set(getUserErrorMessage(error, 'No se pudieron cargar las noticias.'));
          this.loadingSignal.set(false);
        },
      });
  }
}
