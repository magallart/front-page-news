import { inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';

import { SourcesService } from '../services/sources.service';

import type { SourcesResponse } from '../../interfaces/sources-response.interface';

@Injectable({ providedIn: 'root' })
export class SourcesStore {
  private readonly sourcesService = inject(SourcesService);
  private readonly hasLoadedSuccessfullySignal = signal(false);

  private readonly loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly dataSignal = signal<SourcesResponse | null>(null);
  readonly data = this.dataSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  loadInitial(): void {
    if (this.loading() || this.hasLoadedSuccessfullySignal()) {
      return;
    }

    this.load(false);
  }

  refresh(): void {
    this.load(true);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private load(forceRefresh: boolean): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.sourcesService
      .getSources({ forceRefresh })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.dataSignal.set(response);
          this.hasLoadedSuccessfullySignal.set(true);
          this.loadingSignal.set(false);
        },
        error: (error: unknown) => {
          this.errorSignal.set(toErrorMessage(error));
          this.loadingSignal.set(false);
        },
      });
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'No se pudo cargar el catalogo de fuentes.';
}
