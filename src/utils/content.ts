import type { CollectionEntry } from 'astro:content';
import type { Locale } from '@/types';

type Dated = { data: { date: Date } };

export const isPublished = <T extends { data: { draft?: boolean; date?: Date } }>(entry: T): boolean => {
  if (entry.data.draft) return false;
  return !entry.data.date || entry.data.date.getTime() <= Date.now();
};

export const sortByDate = <T extends Dated>(items: T[]): T[] =>
  [...items].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(date);
}

export function getReadingTime(body = '', locale: Locale = 'en'): number {
  const han = (body.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = (body.replace(/[\u3400-\u9fff]/g, ' ').match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const minutes = han / 350 + words / (locale === 'zh' ? 220 : 200);
  return Math.max(1, Math.ceil(minutes));
}

export function getRelatedPosts(
  current: CollectionEntry<'blog'>,
  posts: CollectionEntry<'blog'>[],
  limit = 3
): CollectionEntry<'blog'>[] {
  const tags = new Set(current.data.tags);
  return posts
    .filter((post) => post.id !== current.id && post.data.locale === current.data.locale)
    .map((post) => ({ post, score: post.data.tags.filter((tag) => tags.has(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit)
    .map(({ post }) => post);
}

export const slugFromId = (id: string): string => id.replace(/\.(md|mdx)$/, '').split('/').pop() ?? id;
