import type { Locale } from '@/types';

export const ui = {
  zh: {
    viewResearch: '查看研究', aboutMe: '关于我', latestWriting: '最近写作', latestNews: '最新动态',
    featuredResearch: '重点研究', selectedPublications: '代表论文', researchInterests: '研究兴趣',
    all: '全部', readMore: '阅读全文', minutes: '分钟阅读', search: '搜索', noResults: '没有找到匹配内容',
    previous: '上一篇', next: '下一篇', related: '相关文章', share: '分享', copy: '复制', copied: '已复制',
    contents: '目录', contact: '联系', empty: '内容正在整理中。', backHome: '返回首页'
  },
  en: {
    viewResearch: 'View research', aboutMe: 'About me', latestWriting: 'Latest writing', latestNews: 'Latest news',
    featuredResearch: 'Featured research', selectedPublications: 'Selected publications', researchInterests: 'Research interests',
    all: 'All', readMore: 'Read article', minutes: 'min read', search: 'Search', noResults: 'No matching content found',
    previous: 'Previous', next: 'Next', related: 'Related writing', share: 'Share', copy: 'Copy', copied: 'Copied',
    contents: 'On this page', contact: 'Contact', empty: 'Content is being prepared.', backHome: 'Back home'
  }
} as const;

export const t = (locale: Locale) => ui[locale];
