# Academic Personal Site

一个可长期维护的双语个人学术主页。项目使用 Astro 静态生成，内容保存在仓库中的 Markdown/JSON 文件里，由 Pages CMS 可视化编辑；生产构建会生成 Pagefind 中文/英文搜索索引，并可直接部署到 GitHub Pages。

## 技术栈

- Astro + TypeScript（strict）
- Astro Content Collections（Content Layer `glob()` loader）
- Markdown / MDX、GFM、KaTeX 数学公式、Shiki 代码高亮
- 原生 CSS 与少量原生 JavaScript
- Pages CMS、Pagefind、Giscus、tawk.to
- GitHub Actions + GitHub Pages

## 目录结构

```text
.
├─ .github/workflows/deploy.yml   # GitHub Pages 自动部署
├─ .pages.yml                     # Pages CMS 内容后台配置
├─ public/
│  ├─ uploads/                    # CMS 图片
│  ├─ cv/                         # 把 CV 命名为 cv.pdf 放在这里
│  └─ favicon.svg
├─ src/
│  ├─ components/                 # 可复用 UI 与功能组件
│  ├─ content/                    # 所有可发布内容
│  │  ├─ blog/
│  │  ├─ news/
│  │  ├─ pages/
│  │  ├─ projects/
│  │  └─ publications/
│  ├─ data/site.json              # 集中个人信息与第三方配置
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/                      # 中英文路由、RSS、robots、404
│  ├─ styles/global.css           # Design Tokens 与全站样式
│  ├─ utils/                      # URL、日期、阅读时间、关联文章
│  └─ content.config.ts           # 集合 schema
├─ astro.config.ts
└─ package.json
```

## 安装与本地开发

需要 Node.js 22 LTS 和 npm。

```bash
npm install
npm run dev
```

访问终端显示的本地地址。开发模式没有 Pagefind 索引；要测试完整搜索，请先运行：

```bash
npm run build
npm run preview
```

质量检查：

```bash
npm run check
npm run build
```

## 修改个人信息

最常用的资料集中在 `src/data/site.json`：姓名、机构、简介、邮箱、社交链接、研究兴趣、头像、CV 路径和第三方功能开关都在这里。也可以在 Pages CMS 的 **Site Settings** 中修改，无需编辑 Astro 组件。

默认头像是 `public/uploads/profile-placeholder.svg`。上传新照片到 `public/uploads/`，然后把 `avatar` 改为 `/uploads/文件名.jpg`。建议使用清晰竖版照片，并压缩到合理体积。

把正式 CV 放到 `public/cv/cv.pdf`。文件存在时，中文和英文 CV 页面会自动显示下载按钮；不存在时不会产生死链接。

## 发布内容

### Blog

在 `src/content/blog/` 新建 `.md`。最安全的方式是在 Pages CMS 选择 **Blog → New**。新文章默认 `draft: true`，填写英文小写 slug（如 `reproducible-research`）；检查完毕后关闭 Draft 才会上线。未来日期在到达之前也不会发布。

正文支持标题锚点、目录、GFM 表格、代码高亮与复制、引用、图片、脚注和数学公式。行内公式用 `$...$`，块级公式用 `$$...$$`。

中英文文章使用相同 `translationKey` 关联；两篇文章的 `slug` 可以不同。标签页、分类页、上一篇/下一篇、相关文章、RSS、搜索和 sitemap 都从集合自动生成。

### Publication

在 Pages CMS 选择 **Publications → New**，准确填写作者、年份、期刊/会议和真实链接。作者名与 `site.json` 中的 `name` 或 `nameEn` 完全一致时会自动加粗。DOI/PDF/Code/Project/BibTeX 为空就不会显示。没有真实数据时请保持 Draft。

### Project

在 **Projects → New** 中填写摘要、日期、图片、角色、协作者、链接与 Markdown 正文。`featured: true` 的已发布项目会自动进入首页 Featured Research。

### News

在 **News → New** 中添加论文接收、会议、项目、访问或个人动态。关闭 Draft 后，条目会进入时间线；最近条目自动出现在首页。

### About / Research / CV

Pages CMS 的 **About / Research / CV** 中已有六个中英文页面。直接编辑正文即可，不要删除这些文件。

## Pages CMS

1. 打开 [Pages CMS](https://app.pagescms.org) 并用 GitHub 登录。
2. 给 Pages CMS GitHub App 授权此仓库。
3. 选择仓库；系统会自动读取根目录 `.pages.yml`。
4. 编辑并保存后，Pages CMS 会提交到 GitHub。
5. 对 `main` 的提交触发 GitHub Actions，构建完成后 GitHub Pages 自动更新。

内容和媒体始终保存在 Git 仓库；Pages CMS 停止服务也不会导致内容丢失。

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库，将本项目推送到 `main`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送后打开 **Actions** 查看 `Deploy to GitHub Pages`。

工作流自动识别两类地址：

- 仓库为 `<owner>.github.io`：`https://<owner>.github.io/`
- 普通仓库：`https://<owner>.github.io/<repository>/`

Astro、资源、导航、RSS 与 Pagefind 都使用统一 base path，不需要逐文件改路径。

### 自定义域名

在 GitHub Pages 设置中填写域名。然后在 Pages CMS 的 **Site Settings → Deployment overrides** 填入 `siteUrl`（完整域名）与 `/`（basePath）；也可以在仓库 **Settings → Secrets and variables → Actions → Variables** 添加：

- `SITE_URL=https://你的域名`
- `BASE_PATH=/`

DNS 按 GitHub Pages 提示配置。若要由仓库固定域名，也可增加 `public/CNAME`，一行写入域名。

## Giscus 评论与留言

1. 仓库设为公开并启用 **Discussions**。
2. 安装 [Giscus GitHub App](https://github.com/apps/giscus)。
3. 在 [giscus.app](https://giscus.app) 选择仓库和 Discussion 分类。
4. 把生成的 `repo`、`repoId`、`category`、`categoryId` 填入 `src/data/site.json` 的 `giscus`。
5. 将 `features.comments` 设为 `true`。

配置不完整时组件会自动隐藏，不会加载错误 iframe。评论主题会随站点明暗主题切换。文章使用 pathname 映射，Contact 页面复用组件并使用独立 `guestbook` term。

## tawk.to 在线聊天

在 tawk.to 创建 Property，复制 `propertyId` 与 `widgetId` 到 `site.json`，再把 `features.liveChat` 设为 `true`。默认关闭，因此网站默认不会向 tawk.to 发请求。开启后脚本在页面加载完成后异步加载。

## 中英文内容

中文位于 `/`，英文位于 `/en/`。页面内容是两套独立 Markdown，不使用浏览器自动翻译。新增中英文 Blog/Project 时，为两者填写相同 `translationKey`，语言切换会优先进入对应译文；缺少译文时回到目标语言首页。

## 常见问题

**文章保存后为什么没出现？** 检查 `draft` 是否为 `false`，发布日期是否晚于当前时间，`locale` 是否正确。

**搜索在 `npm run dev` 中提示不可用？** Pagefind 在生产构建后生成索引。运行 `npm run build && npm run preview`。

**CV 按钮为什么隐藏？** 确认文件精确位于 `public/cv/cv.pdf`，或在 Site Settings 中选择 PDF。

**项目站点图片或链接 404？** 内容字段中的站内图片应写 `/uploads/...`，不要手写仓库名。构建会统一添加 base path。

**需要保存 Secret 吗？** 不需要。Giscus 与 tawk.to 的 ID 都是公开前端配置。不要把 GitHub token、API key 或其他私密凭证提交到仓库。

更多非开发者操作说明见 [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md)。
