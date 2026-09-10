import type { Locale } from '@/types';

export const normalizeBase = (base = import.meta.env.BASE_URL): string =>
  base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;

export function withBase(path = '/'): string {
  const base = normalizeBase();
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`.replace(/\/{2,}/g, '/');
}

export function getLocalizedPath(locale: Locale, path = '/'): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const localized = locale === 'en' ? `/en/${clean}` : `/${clean}`;
  return withBase(localized.endsWith('/') ? localized : `${localized}/`);
}

export function stripBase(pathname: string): string {
  const base = normalizeBase();
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const clean = stripBase(pathname).replace(/^\/en(?=\/|$)/, '') || '/';
  return locale === 'en' ? getLocalizedPath('en', clean) : getLocalizedPath('zh', clean);
}

export function assetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|mailto:|tel:)/.test(path)) return path;
  return withBase(path);
}
