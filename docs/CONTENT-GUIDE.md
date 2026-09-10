# 内容维护指南（无需写代码）

## 平时发布文章只需要五步

1. 登录 [Pages CMS](https://app.pagescms.org)。
2. 选择这个 GitHub 仓库，再选择 **Blog**。
3. 点击 **New**。
4. 填写标题、slug、摘要、日期、语言、标签和正文。先保持 **Draft** 开启，保存草稿。
5. 预览和校对后关闭 **Draft**，再次保存。GitHub Actions 构建完成后文章自动上线。

slug 是网址中的英文短名，只用小写字母、数字和连字符，例如 `how-i-organize-notes`。不要在发布后随意修改 slug，否则旧链接会失效。

## 保存草稿或隐藏内容

- 新建 Blog、Publication、Project、News 时，`Draft` 默认开启。
- Draft 内容仍保存在仓库中，但不会出现在列表、首页、RSS、搜索或 sitemap。
- 想临时下线内容，只需重新开启 Draft，不必删除文件。
- 发布日期设置在未来时，Blog 与带日期的内容在日期到来前不会公开。

## 添加论文

进入 **Publications → New**：

- Title：真实论文标题。
- Slug：稳定的英文短名。
- Authors：按论文顺序逐个添加；自己的名字要和 Site Settings 完全一致，网页才会自动加粗。
- Venue / Year / Volume / Issue / Pages：按正式出版信息填写。
- DOI、PDF、Code、Video、Project：没有就留空，页面不会显示空按钮。
- BibTeX：粘贴真实 BibTeX；页面会提供复制弹窗。
- Type：选择 journal、conference、preprint、book、chapter 或 other。
- Featured：希望出现在首页时开启。
- Draft：核对无误后再关闭。

不要为了让页面显得丰富而添加虚假论文、DOI、奖项或链接。

## 添加项目

进入 **Projects → New**，填写标题、slug、摘要、起止日期、角色、合作者、链接、标签和正文。图片要同时填写有意义的 alt text。开启 Featured 后，该项目会自动进入首页重点研究区。

## 添加动态

进入 **News → New**，选择 publication、conference、project、visit、personal 或 other 类型。简短说明发生了什么；有详情页面时再填写链接。

## 修改个人简介

- 姓名、机构、首页一句话、研究兴趣、头像、邮箱和学术平台链接：在 **Site Settings** 修改。
- 长篇简介：在 **About / Research / CV** 中编辑对应中文或英文页面。
- 中英文是独立内容，请分别维护。

## 上传与更换照片

在 Site Settings 的 Portrait 字段上传图片，文件会保存到 `public/uploads/`。建议：

- 使用竖版、光线清晰的照片；
- 上传前压缩文件；
- 尽量使用 JPG、PNG 或 WebP；
- 填写图片说明时描述画面，不要写“图片”。

博客和项目正文中插入的图片也会保存在同一媒体目录。

## 更换 CV

在 **Site Settings → CV PDF** 上传 PDF，或把文件放到 `public/cv/cv.pdf`。上传完成并构建后，CV 页面自动出现下载按钮。删除文件后按钮自动隐藏。

## 中英文关联

同一篇文章或项目的中英文版本使用相同的 `translationKey`，例如都填 `open-research-notes-2026`。slug 可以不同。若目标语言没有译文，语言按钮会回到该语言首页，不会产生 404。

## 保存后发生什么

Pages CMS 保存 → GitHub 产生一次 commit → GitHub Actions 检查并构建 Astro → Pagefind 生成搜索索引 → GitHub Pages 发布。

通常几分钟内完成。若没有更新，进入 GitHub 仓库的 **Actions** 页面查看最新一次 `Deploy to GitHub Pages` 是否成功。
