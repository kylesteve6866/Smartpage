import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from '@astrojs/markdown-remark';
import rehypeBaseAssets from './src/utils/rehype-base-assets';
import siteSettings from './src/data/site.json';

const [owner = '', repository = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserPage = repository === `${owner}.github.io`;
const inferredSite = owner ? `https://${owner}.github.io` : 'https://username.github.io';
const inferredBase = owner && repository && !isUserPage ? `/${repository}` : '/';

export default defineConfig({
  site: process.env.SITE_URL || siteSettings.deployment.siteUrl || inferredSite,
  base: process.env.BASE_PATH || siteSettings.deployment.basePath || inferredBase,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }], rehypeKatex, [rehypeBaseAssets, { base: inferredBase }]]
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: true }
  },
  vite: { build: { cssMinify: 'lightningcss' } }
});
