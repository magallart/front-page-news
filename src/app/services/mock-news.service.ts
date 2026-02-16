import { Injectable } from '@angular/core';

import { FEATURED_STORIES_COUNT, MOCK_NEWS, pickRandomItems } from '../mocks/news.mock';
import { TICKER_HEADLINES } from '../mocks/ticker-headlines.mock';

import type { TickerHeadline } from '../../interfaces/ticker-headline.interface';
import type { NewsItem } from '../interfaces/news-item.interface';

@Injectable({ providedIn: 'root' })
export class MockNewsService {
  getNewsById(id: string): NewsItem | undefined {
    return MOCK_NEWS.find((item) => item.id === id);
  }

  getFeaturedNews(): readonly NewsItem[] {
    return pickRandomItems(MOCK_NEWS, FEATURED_STORIES_COUNT);
  }

  getCurrentAffairsNews(limit = 4): readonly NewsItem[] {
    return this.getNewsBySection('actualidad', limit);
  }

  getBreakingNews(limit = 6): readonly NewsItem[] {
    return this.getNewsBySection('actualidad', limit);
  }

  getEconomyNews(limit = 3): readonly NewsItem[] {
    return this.getNewsBySection('economia', limit);
  }

  getCultureNews(limit = 3): readonly NewsItem[] {
    return this.getNewsBySection('cultura', limit);
  }

  getMostReadNews(limit = 5): readonly NewsItem[] {
    return MOCK_NEWS.slice(0, limit);
  }

  getTickerHeadlines(): readonly TickerHeadline[] {
    return TICKER_HEADLINES;
  }

  getSectionNews(section: string, limit = 9): readonly NewsItem[] {
    return this.getNewsBySection(section, limit);
  }

  private getNewsBySection(section: string, limit: number): readonly NewsItem[] {
    return MOCK_NEWS.filter((item) => item.section === section.toLowerCase()).slice(0, limit);
  }
}
