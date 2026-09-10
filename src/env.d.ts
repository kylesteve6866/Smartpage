/// <reference types="astro/client" />

declare module 'virtual:pagefind' {
  export interface PagefindResultData {
    url: string;
    excerpt: string;
    meta: { title?: string };
  }
}
