import { normalizeBase } from '@/utils/urls';
export function GET({site}:{site:URL}){const base=normalizeBase();return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(`${base}/sitemap-index.xml`,site).href}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
