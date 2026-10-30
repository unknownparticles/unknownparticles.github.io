# Alun / 开发笔记

个人技术博客与作品集，记录 Flutter、前端交互、图像处理、AI 工具链和工程自动化实践。

- 线上地址：<https://alunapp.cn>
- GitHub：<https://github.com/unknownparticles>
- CSDN：<https://blog.csdn.net/particles>

## 技术栈

- Astro 7
- TypeScript
- Markdown Content Collections
- GitHub Pages / GitHub Actions
- 原生 CSS 与少量原生 JavaScript

站点在构建阶段输出纯静态 HTML，不需要 Ruby、数据库或常驻服务端。

## 本地开发

需要 Node.js 22.23.4 或更高版本。

```bash
npm install
npm run dev
```

浏览器访问 <http://localhost:4321>。

## 检查与构建

```bash
npm run check
npm run build
npm run test:article
npm run preview
```

构建结果输出到 `dist/`。提交到 `master` 后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 目录

- `src/content/posts/`：Markdown 文章
- `src/components/`：导航、页脚和文章列表
- `src/layouts/`：页面公共布局与 SEO 元信息
- `src/pages/`：首页、文章、标签、作品和状态页面
- `src/styles/`：全站设计系统与响应式样式
- `src/data/portfolio.ts`：作品集数据
- `public/`：图片、PWA、Service Worker 和自定义域名文件

## 内容约定

文章文件名使用 `YYYY-MM-DD-title.md`，文章地址保持为：

```text
/YYYY/MM/DD/title/
```

每篇文章必须提供 `title`、`date`、`author`、`header-img` 和 `tags`，构建时会通过内容 schema 校验。

## 技术案例与规范

本轮改进使用 OpenSpec 管理，规范与提案保存在 `openspec/`。案例通过源码与相关笔记说明具体取舍，不以仓库数量代替技术证据。

性能文章示例可运行 `npm run test:article` 校验；需要支持 C++17 与 AddressSanitizer/UndefinedBehaviorSanitizer 的编译器，可用 `CXX` 指定。`npm run test:article -- --bench` 另以优化构建运行微基准，结果仅适用于本机本次运行。
