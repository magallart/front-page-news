const ES_LOCALE = 'es-ES';

export function formatDateLabelUppercase(date: Date): string {
  return new Intl.DateTimeFormat(ES_LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase();
}

export function formatTime24(date: Date, fallback = '--:--'): string {
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(ES_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateNumericWithDots(date: Date, fallback = '--.--.----'): string {
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(ES_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replaceAll('/', '.');
}

export function formatDateLong(date: Date, fallback = 'Fecha no disponible'): string {
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(ES_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date, fallback = '-- -- --'): string {
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(ES_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
    .format(date)
    .replace(/\//g, '-');
}
