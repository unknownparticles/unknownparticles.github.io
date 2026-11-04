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

性能文章包含三个浏览器单步／播放演示，以及 `public/examples/` 下的两份独立 C++17 用例（多方法套件、矩阵与字符串对照）。可运行 `npm run test:article` 校验文章提取代码、下载文件一致性和正确性；需要支持 C++17 与 AddressSanitizer/UndefinedBehaviorSanitizer 的编译器，可用 `CXX` 指定。`npm run test:article -- --bench` 另以优化构建运行微基准，结果仅适用于本机本次运行。

## 文章内容与配图回归

正文图片存放在 `public/img/posts/`，使用本站路径与具体的替代文本。算法示意图、受控合成样本和真实应用截图应明确区分，不把示意图描述成实测结果。

```bash
npm run build
npm run check:content
npm run test:post-examples
npx playwright test tests/articles.spec.ts
```

`check:content` 检查所有文章的代码围栏、JSON/YAML、JavaScript/Python 语法、封面、正文图片和构建后的本站链接，并测试 Fetch 示例的错误路径。`test:post-examples` 直接提取正文代码验证 EAR、清晰度和二十种混合模式，包含图层偏移回归；需要 Python 3、NumPy、OpenCV，以及 C++17、UndefinedBehaviorSanitizer 和可通过 `pkg-config opencv4` 发现的 OpenCV Core 开发库。浏览器测试需先安装 Playwright Chromium。

修改矢量图解后运行 `python3 scripts/generate-article-figures.py`；重建模糊检测合成图运行 `python3 scripts/generate-blur-samples.py`。后者也会打印样本分数。两项生成命令会更新对应文章资源，应在修改配图时显式执行。

本轮逐篇记录见 [文章校订记录](docs/content-audit-2026-11-03.md)。

性能文章的交互回归：`npx playwright test tests/performance-lab.spec.ts`。覆盖窗口计数、边界结果、地址步长、暂停／重置、键盘调整窗口、减少动画偏好与窄屏。修改正文 C++ 片段时，需同步更新可下载文件；校验脚本会拒绝两者不一致的修改。
