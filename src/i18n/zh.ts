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
    description: 'Flutter、图像处理、前端与工程自动化的项目笔记。',
  },
  nav: {
    home: '首页',
    work: '项目',
    writing: '文章',
    about: '关于',
    skip: '跳到主要内容',
    menu: '菜单',
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
    status: '深圳 · 写代码，也拍片',
    titleLead: 'Alun',
    titleEm: '开发笔记',
    titleTail: '',
    lede: '专注图像处理与产品工程。从 JPEG 文件结构到浏览器里的像素计算，用源码、技术笔记和可复现验证记录实现过程。',
    ctaWork: '看项目',
    ctaGithub: 'GitHub',
    ctaMail: '联系我',
    repos: '仓库',
    live: '已上线',
    writing: '文章',
    workTitle: '精选技术实践',
    selectedKicker: '精选项目',
    selectedNote: '从 JPEG 的二进制解析，到浏览器图片处理与静态站点工程。每个案例都附具体实现依据与取舍。',
    workMore: '全部项目',
    pagesNote: '个仓库已经部署成网页。',
    capabilityTitle: '我在做的事',
    capabilityLede: '从 JPEG 的字节到 Flutter 的界面，再到自动发布的流水线。',
    writingTitle: '最近更新',
    writingMore: '按标签看',
    older: '更早的文章',
    newer: '较新的文章',
    page: '第',
    pageOf: '页 / 共',
    contactTitle: '有问题或者想法，',
    contactTail: '欢迎交流。',
  },
  work: {
    index: 'Projects',
    title: '做过的',
    titleEm: '项目',
    intro: '下面是 GitHub 上的仓库，按技术类型排。再往下是已经部署成网页、可以直接打开的那些。',
    allRepos: 'GitHub 上的全部仓库',
    technical: '开源项目',
    liveTitle: '在线工具与实验',
    liveIntro: '个仓库启用了 GitHub Pages，这里按用途挑了代表性的。',
    source: '源码',
    caseStudy: '技术案例',
    demo: '打开',
    languages: '语言分布',
    browseAll: '看全部仓库',
  },
  demos: {
    tools: '工具',
    toolsDesc: '解决一个具体问题的网页。',
    games: '游戏',
    gamesDesc: '练手用，顺便试交互。',
    focus: '效率与生活',
    focusDesc: '时间、习惯和日常记录。',
    experiments: '实验',
    experimentsDesc: '快速做出来的原型。',
  },
  about: {
    title: 'Alun',
    titleEm: '不明栗子',
    lead: '我是 Alun，写代码，也做导演和摄影。这个站放我做过的项目和写过的文章。',
    approachTitle: '我的开发',
    approachTail: '工作流',
    approachKicker: 'Workflow',
    approach1: '先写能跑通的最小版本，想法验证后再补边界情况、注释和文档，最后把构建和发布接到 CI。代码放 GitHub，过程记在这个站。',
    approach2: 'GitHub 上有',
    approach2Tail: '个仓库，其中',
    approach3: '个能直接打开。做项目时记的笔记就放在这个站。',
    practiceTitle: '我当前在做的事',
    practiceKicker: 'Now',
    practice1: 'OpenGL 渲染、OpenCV 分析、JPEG 元数据与图像质量评估。',
    practice2: 'Flutter 组件、手势、动画、裁剪与 iOS 界面。',
    practice3: 'Canvas、WebGL、TypeScript 和小工具。',
    practice4: '构建脚本、CI/CD、部署流程。',
    stackTitle: '常用技术',
  },
  archive: {
    title: '文章',
    lede: '篇文章，覆盖个主题。可以按标签筛，也可以从新到旧翻。',
    all: '全部',
    result: '共',
    resultTag: '篇',
    posts: '',
  },
  article: {
    by: '作者',
    catalog: '本页目录',
    newer: '上一篇',
    older: '下一篇',
    comments: '评论',
    commentsDown: '评论没加载出来。可以在 GitHub Issue 里继续讨论。',
    cover: '题图',
  },
  footer: {
    lede: '我的技术笔记',
    label: 'Keep building',
    mail: '邮件',
    builtWith: 'Astro 构建 · GitHub Pages 托管',
    verified: '仓库数据更新于',
    rights: '内容与代码保留权利',
  },
  error: {
    code: 'ERROR / 404',
    title: '页面不存在',
    body: '这个地址没有内容。可以回首页，或者按标签找文章。',
    home: '回首页',
    offlineCode: 'STATUS / OFFLINE',
    offlineTitle: '网络不通',
    offlineBody: '现在连不上网。恢复后刷新页面就行。',
    reload: '刷新',
  },
};
