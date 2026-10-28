export interface Dict {
  meta: { title: string; description: string };
  nav: Record<'home'|'work'|'writing'|'about'|'skip'|'menu', string>;
  theme: Record<'label'|'toLight'|'toDark'|'system', string>;
  lang: Record<'label'|'switch'|'current', string>;
  home: Record<string, string>;
  work: Record<string, string>;
  demos: Record<string, string>;
  about: Record<string, string>;
  archive: Record<string, string>;
  article: Record<string, string>;
  footer: Record<string, string>;
  error: Record<string, string>;
}

export const zh: Dict = {
  meta: {
    title: 'Alun / 开发笔记',
    description: '记录 Flutter、图形与图像处理、前端交互和工程自动化的实践过程。',
  },
  nav: {
    home: '首页',
    work: '作品',
    writing: '文章',
    about: '关于',
    skip: '跳到主要内容',
    menu: '导航',
  },
  theme: {
    label: '主题',
    toLight: '切换到亮色',
    toDark: '切换到暗色',
    system: '跟随系统',
  },
  lang: {
    label: '语言',
    switch: 'Switch to English',
    current: '中文',
  },
  home: {
    status: '可接洽有趣的项目',
    titleLead: 'Alun',
    titleEm: 'builds',
    titleTail: 'things.',
    lede: '开发者、导演、摄影师。把图像、交互和自动化里复杂的问题，做成能直接使用的产品。',
    ctaWork: '查看作品',
    ctaGithub: 'GitHub',
    ctaMail: '联系我',
    repos: '仓库',
    live: '在线',
    writing: '文章',
    workTitle: '可以直接打开的作品',
    workMore: '浏览全部项目',
    pagesNote: '个仓库已发布在线页面。',
    capabilityTitle: '从底层图像到可用产品',
    capabilityLede: '不只做页面。会分析格式、写渲染代码、做跨端界面，也会把构建和发布自动化。',
    writingTitle: '最近写下的',
    writingMore: '按标签浏览',
    older: '更早的文章',
    newer: '较新的文章',
    page: '第',
    pageOf: '页，共',
    contactTitle: '有值得做的问题？',
    contactTail: '一起把它做出来。',
  },
  work: {
    index: 'Engineering',
    title: '代码不是展示，',
    titleEm: '结果才是。',
    intro: '这里优先展示能体现技术深度的仓库：二进制格式解析、计算机视觉、Flutter、Local-first 产品和 MCP 工具。在线页面则按用途整理在下方。',
    allRepos: 'GitHub 上的全部仓库',
    technical: '技术代表作',
    liveTitle: '在线工具与实验',
    liveIntro: '个仓库启用了 GitHub Pages。下面按用途整理最有代表性的入口。',
    source: '查看源码',
    demo: '在线体验',
    languages: '仓库语言分布',
    browseAll: '浏览全部仓库',
  },
  demos: {
    tools: '工具',
    toolsDesc: '解决具体问题的浏览器工具。',
    games: '游戏',
    gamesDesc: '规则、状态和交互反馈实验。',
    focus: '效率与生活',
    focusDesc: '时间、习惯与日常记录。',
    experiments: '创意实验',
    experimentsDesc: 'AI、文化与一次性想法的快速原型。',
  },
  about: {
    title: 'Alun',
    titleEm: '不明栗子',
    lead: '我是一名开发者，也做导演和摄影。喜欢把抽象问题拆成可运行的代码，再把过程整理成别人也能使用的工具。',
    approachTitle: '不追求堆技术，',
    approachTail: '先把问题解决。',
    approach1: '我的工作横跨图形、图像、跨端界面和自动化。会从 JPEG、OpenGL、OpenCV 这些底层细节入手，也会把结果做成 Flutter 应用或浏览器工具。',
    approach2: '在 GitHub 上维护',
    approach2Tail: '个自有仓库，其中',
    approach3: '个已经发布为在线页面。这个站点记录做这些项目时留下的判断、失败和可复用方法。',
    practiceTitle: '现在关注的方向',
    practice1: 'OpenGL 渲染、OpenCV 分析、JPEG 元数据和图像质量评估。',
    practice2: 'Flutter 组件、手势、动画、裁剪和 iOS-first 应用体验。',
    practice3: 'Canvas、WebGL、TypeScript 和轻量离线工具。',
    practice4: '构建脚本、CI/CD、部署流程和 AI 辅助工具链。',
    stackTitle: '常用技术',
  },
  archive: {
    title: '文章索引',
    lede: '篇文章，个主题。选择主题筛选，也可以按时间从新到旧浏览。',
    all: '全部',
    result: '显示全部',
    resultTag: '：',
    posts: '篇',
  },
  article: {
    by: '作者',
    catalog: '本页目录',
    newer: '更新一篇',
    older: '更早一篇',
    comments: '文章评论',
    commentsDown: '评论服务暂时无法加载。可以通过 GitHub Issue 继续讨论。',
    cover: '题图',
  },
  footer: {
    lede: '把技术问题拆开，也把解决过程写下来。',
    builtWith: 'Astro 构建 · GitHub Pages 托管',
    verified: '仓库数据核验于',
    rights: '内容与代码保留权利',
  },
  error: {
    code: 'ERROR / 404',
    title: '页面没有找到',
    body: '这个地址没有对应的页面。你可以回到文章列表，或通过标签继续查找内容。',
    home: '返回首页',
    offlineCode: 'STATUS / OFFLINE',
    offlineTitle: '暂时无法连接网络',
    offlineBody: '当前网络不可用。恢复连接后重新加载，即可获取最新内容。',
    reload: '重新加载',
  },


};
