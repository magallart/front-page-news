import { Injectable } from '@angular/core';

import { FEATURED_STORIES_COUNT, MOCK_NEWS, pickRandomItems } from '../mocks/news.mock';
import { SECTION_MOCK_STORIES } from '../mocks/section-stories.mock';
import { TICKER_HEADLINES } from '../mocks/ticker-headlines.mock';

import type { TickerHeadline } from '../../interfaces/ticker-headline.interface';
import type { NewsItem } from '../interfaces/news-item.interface';
import type { SectionMockStory } from '../mocks/section-stories.mock';

@Injectable({ providedIn: 'root' })
export class MockNewsService {
  getFeaturedNews(): readonly NewsItem[] {
    return pickRandomItems(MOCK_NEWS, FEATURED_STORIES_COUNT);
  }

  getCurrentAffairsNews(limit = 4): readonly NewsItem[] {
    return MOCK_NEWS.filter((item) => item.section === 'actualidad').slice(0, limit);
  }

  getBreakingNews(limit = 6): readonly NewsItem[] {
    return MOCK_NEWS.filter((item) => item.section === 'actualidad').slice(0, limit);
  }

  getEconomyNews(limit = 3): readonly NewsItem[] {
    return MOCK_NEWS.filter((item) => item.section === 'economia').slice(0, limit);
  }

  getMostReadNews(limit = 5): readonly NewsItem[] {
    return MOCK_NEWS.slice(0, limit);
  }

  getTickerHeadlines(): readonly TickerHeadline[] {
    return TICKER_HEADLINES;
  }

  getSectionStories(): readonly SectionMockStory[] {
    return SECTION_MOCK_STORIES;
  }
}
