const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

interface ScrollWindow {
  matchMedia: (query: string) => MediaQueryList;
  scrollTo: (options: ScrollToOptions) => void;
}

export function scrollToTopAfterNavigation(urlAfterRedirects: string, view: ScrollWindow): void {
  if (urlAfterRedirects.includes('#')) {
    return;
  }

  view.scrollTo({
    top: 0,
    left: 0,
    behavior: resolveTopScrollBehavior(view),
  });
}

export function resolveTopScrollBehavior(view: Pick<ScrollWindow, 'matchMedia'>): ScrollBehavior {
  return view.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches ? 'auto' : 'smooth';
}
