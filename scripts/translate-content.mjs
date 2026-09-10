import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { extname, join, relative, basename } from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const MODEL = 'deepseek-v4-flash';
const TRANSLATOR_VERSION = 1;
const STATE_PATH = join(ROOT, '.i18n-cache.json');
const API_URL = 'https://api.deepseek.com/chat/completions';
const skipIfUnconfigured = process.argv.includes('--skip-if-unconfigured');
const translateDrafts = process.env.TRANSLATE_DRAFTS === 'true';
const force = process.env.FORCE_TRANSLATION === 'true';

if (MODEL.includes('pro')) throw new Error('安全检查失败：翻译模型不得使用 Pro。');

const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
if (!apiKey) {
  if (skipIfUnconfigured) {
    process.stdout.write('DEEPSEEK_API_KEY 未配置，跳过自动翻译；网站构建继续。\n');
    process.exit(0);
  }
  throw new Error('请设置 DEEPSEEK_API_KEY 后再运行自动翻译。');
}

const output = (message) => process.stdout.write(`${message}\n`);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const relativePath = (file) => relative(ROOT, file).replaceAll('\\', '/');
const filesIn = (directory) => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  }).filter((file) => /\.(md|mdx)$/i.test(file));
};

const parseDocument = (file) => {
  const raw = readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw, raw };
  return { data: YAML.parse(match[1]) ?? {}, body: match[2] ?? '', raw };
};

const serializeDocument = (data, body) => `---\n${YAML.stringify(data, { lineWidth: 0 })}---\n${body.replace(/^\n+/, '')}`;
const writeIfChanged = (file, content) => {
  const old = existsSync(file) ? readFileSync(file, 'utf8') : '';
  if (old === content) return false;
  writeFileSync(file, content, 'utf8');
  return true;
};

const readState = () => {
  if (!existsSync(STATE_PATH)) return { version: TRANSLATOR_VERSION, model: MODEL, entries: {} };
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
    return state && typeof state === 'object' ? state : { version: TRANSLATOR_VERSION, model: MODEL, entries: {} };
  } catch {
    return { version: TRANSLATOR_VERSION, model: MODEL, entries: {} };
  }
};
const state = readState();
state.version = TRANSLATOR_VERSION;
state.model = MODEL;
state.entries ??= {};
const saveState = () => writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

const requestTranslation = async (purpose, payload, maxTokens = 32768) => {
  const messages = [
    {
      role: 'system',
      content: 'You are a careful academic translator from Simplified Chinese to natural, publication-quality English. Return only valid JSON. Translate only human language; preserve names, URLs, identifiers, dates, code, citations, Markdown structure, HTML/MDX tags, LaTeX math, and code fences. Never invent facts, references, credentials, or links.'
    },
    {
      role: 'user',
      content: `Translate this ${purpose}. The response must be a JSON object with exactly the same keys and array shapes as the input. Do not wrap JSON in Markdown fences.\n\n${JSON.stringify(payload)}`
    }
  ];
  let lastError = 'unknown error';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages,
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          max_tokens: maxTokens,
          stream: false,
          signal: AbortSignal.timeout(120000)
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(`DeepSeek API ${response.status}: ${result?.error?.message ?? 'request failed'}`);
      const content = result?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) throw new Error('DeepSeek returned empty content');
      const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);
      if (result.model && String(result.model).toLowerCase().includes('pro')) throw new Error('安全检查失败：API 返回了 Pro 模型');
      const usage = result.usage?.total_tokens ? ` (${result.usage.total_tokens} tokens)` : '';
      output(`DeepSeek Flash translated ${purpose}${usage}`);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
  throw new Error(`${purpose} 翻译失败：${lastError}`);
};

const asString = (value, key) => {
  if (typeof value !== 'string') throw new Error(`翻译结果字段 ${key} 不是字符串`);
  return value;
};
const asStringArray = (value, key) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`翻译结果字段 ${key} 不是字符串数组`);
  return value;
};

const siteFile = join(ROOT, 'src/data/site.json');
const site = JSON.parse(readFileSync(siteFile, 'utf8'));
const siteInput = {
  preferredEnglishName: site.nameEn ?? '',
  siteNameEn: site.siteName,
  titleEn: site.title,
  bioEn: site.bio,
  descriptionEn: site.description,
  institutionEn: site.institution,
  researchInterestsEn: site.researchInterests ?? [],
  otherLinkLabelsEn: (site.otherLinks ?? []).map((link) => link.label)
};
const siteHash = hash(JSON.stringify({ version: TRANSLATOR_VERSION, model: MODEL, siteInput, preferredEnglishName: site.nameEn ?? '' }));
const siteEntry = state.entries['site-settings'];
if (force || siteEntry?.hash !== siteHash) {
  const translated = await requestTranslation('the site settings JSON', siteInput, 4096);
  site.siteNameEn = asString(translated.siteNameEn, 'siteNameEn');
  site.titleEn = asString(translated.titleEn, 'titleEn');
  site.bioEn = asString(translated.bioEn, 'bioEn');
  site.descriptionEn = asString(translated.descriptionEn, 'descriptionEn');
  site.institutionEn = asString(translated.institutionEn, 'institutionEn');
  site.researchInterestsEn = asStringArray(translated.researchInterestsEn, 'researchInterestsEn');
  if (Array.isArray(site.otherLinks) && Array.isArray(translated.otherLinkLabelsEn)) {
    site.otherLinks = site.otherLinks.map((link, index) => ({ ...link, labelEn: typeof translated.otherLinkLabelsEn[index] === 'string' ? translated.otherLinkLabelsEn[index] : link.label }));
  }
  writeIfChanged(siteFile, `${JSON.stringify(site, null, 2)}\n`);
  state.entries['site-settings'] = { hash: siteHash, generated: true };
  saveState();
} else output('Site settings unchanged; translation cache hit.');

const configs = {
  pages: { fields: ['title', 'description'], target: (data) => `en-${data.page}.md`, key: 'page', translateDrafts: true },
  blog: { fields: ['title', 'description', 'coverAlt', 'tags', 'category'], target: (_, stem, extension) => `auto-en-${stem.replace(/^zh-/, '')}${extension}`, key: 'translationKey' },
  projects: { fields: ['title', 'description', 'imageAlt', 'role', 'tags'], target: (_, stem, extension) => `auto-en-${stem.replace(/^zh-/, '')}${extension}`, key: 'translationKey' },
  publications: { fields: ['title', 'award', 'abstract'], target: (_, stem) => `auto-en-${stem.replace(/^zh-/, '')}.md`, key: 'translationKey' },
  news: { fields: ['title', 'description'], target: (_, stem) => `auto-en-${stem.replace(/^zh-/, '')}.md` }
};

const sourcePaths = new Set();
for (const [collection, config] of Object.entries(configs)) {
  const directory = join(ROOT, 'src/content', collection);
  const documents = filesIn(directory).map((file) => ({ file, ...parseDocument(file), path: relativePath(file) }));
  const english = documents.filter((document) => document.data.locale === 'en');
  for (const source of documents.filter((document) => document.data.locale === 'zh')) {
    sourcePaths.add(source.path);
    if (config.key && !source.data[config.key]) {
      source.data[config.key] = source.data.slug ?? source.data.page ?? basename(source.file, extname(source.file));
      writeIfChanged(source.file, serializeDocument(source.data, source.body));
    }
    const keyValue = config.key ? source.data[config.key] : source.data.slug;
    const existing = english.find((document) => (config.key ? document.data[config.key] === keyValue : document.data.slug === keyValue));
    const stem = basename(source.file, extname(source.file));
    const targetFile = existing?.file ?? join(directory, config.target(source.data, stem, extname(source.file)));
    const targetPath = relativePath(targetFile);
    const entryKey = source.path;
    const input = Object.fromEntries(config.fields.filter((field) => source.data[field] !== undefined).map((field) => [field, source.data[field]]));
    input.body = source.body;
    if (collection === 'projects' && Array.isArray(source.data.links)) input.linkLabels = source.data.links.map((link) => link.label);
    const sourceHash = hash(JSON.stringify({ version: TRANSLATOR_VERSION, model: MODEL, input }));
    const cached = state.entries[entryKey];
    if (!translateDrafts && source.data.draft === true && cached?.targetPath) {
      if (existsSync(join(ROOT, cached.targetPath))) {
        const target = parseDocument(join(ROOT, cached.targetPath));
        if (target.data.translationGenerated) writeIfChanged(join(ROOT, cached.targetPath), serializeDocument({ ...target.data, draft: true }, target.body));
      }
      output(`Skipped draft ${source.path}.`);
      continue;
    }
    if (!force && cached?.hash === sourceHash && cached.targetPath === targetPath && existsSync(targetFile)) {
      output(`Translation cache hit: ${source.path}`);
      continue;
    }
    const translated = await requestTranslation(`${collection} entry`, input);
    if (!translated || typeof translated !== 'object' || typeof translated.body !== 'string' || !translated.frontmatter || typeof translated.frontmatter !== 'object') throw new Error(`翻译结果格式错误：${source.path}`);
    const targetData = { ...source.data, ...translated.frontmatter, locale: 'en', draft: Boolean(source.data.draft), translationGenerated: true, translationModel: MODEL, translationSource: source.path };
    if (config.key) targetData[config.key] = keyValue;
    if (collection === 'projects' && Array.isArray(source.data.links)) {
      const labels = Array.isArray(translated.frontmatter.linkLabels) ? translated.frontmatter.linkLabels : [];
      targetData.links = source.data.links.map((link, index) => ({ ...link, label: typeof labels[index] === 'string' ? labels[index] : link.label }));
      delete targetData.linkLabels;
    }
    writeIfChanged(targetFile, serializeDocument(targetData, translated.body));
    state.entries[entryKey] = { hash: sourceHash, targetPath, generated: true };
    saveState();
  }
}

for (const [entryKey, entry] of Object.entries(state.entries)) {
  if (entryKey === 'site-settings' || sourcePaths.has(entryKey) || !entry.generated || !entry.targetPath) continue;
  const target = join(ROOT, entry.targetPath);
  if (existsSync(target)) {
    const parsed = parseDocument(target);
    if (parsed.data.translationGenerated) unlinkSync(target);
  }
  delete state.entries[entryKey];
}
saveState();
output('Automatic English translation sync complete.');
