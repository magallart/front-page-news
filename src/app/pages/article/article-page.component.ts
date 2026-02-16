import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ArticleContentComponent } from '../../components/news/article-content.component';
import { ArticleNotFoundComponent } from '../../components/news/article-not-found.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-article-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ArticleContentComponent,
    ArticleNotFoundComponent,
    BreakingNewsComponent,
    MostReadNewsComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
          <div>
            @if (article(); as item) {
              <app-article-content [article]="item" />
            } @else {
              <app-article-not-found />
            }
          </div>

          <aside class="hidden lg:block lg:pl-5">
            <app-breaking-news [items]="breakingNews" />
            <div class="mt-8">
              <app-most-read-news [items]="mostReadNews" />
            </div>
          </aside>
        </div>
      </section>
    </app-page-container>
  `,
})
export class ArticlePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly mockNewsService = inject(MockNewsService);

  protected readonly articleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'sin-id')),
    { initialValue: 'sin-id' },
  );

  protected readonly article = computed(() => this.mockNewsService.getNewsById(this.articleId()));
  protected readonly breakingNews = this.mockNewsService.getBreakingNews();
  protected readonly mostReadNews = this.mockNewsService.getMostReadNews(10);
}
