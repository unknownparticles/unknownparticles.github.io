export type TechnicalProject = {
  name: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  evidence: string[];
  evidenceEn: string[];
  caseSlug?: string;
  featured?: boolean;
  signal?: string[];
  language: string;
  repoUrl: string;
  demoUrl?: string;
  preview?: string;
  accent: 'coral' | 'blue' | 'violet' | 'amber' | 'green' | 'slate';
};

export type DemoProject = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  language: string;
  repoUrl: string;
  demoUrl: string;
};

export type DemoGroup = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  items: DemoProject[];
};

export const technicalProjects: TechnicalProject[] = [
  {
    name: 'jpeg-info',
    title: 'JPEG 元数据解析器',
    titleEn: 'JPEG metadata parser',
    summary: '不用图像框架，直接读取 JPEG 标记段，解析 JFIF、EXIF、XMP 与 ICC Profile。',
    summaryEn: 'Reads JPEG marker segments directly, with no image framework: JFIF, EXIF, XMP and ICC Profile.',
    evidence: ['C++17', '二进制格式解析', 'EXIF / XMP / ICC'],
    evidenceEn: ['C++17', 'Binary parsing', 'EXIF / XMP / ICC'],
    caseSlug: 'jpeg-info',
    featured: true,
    signal: ['FF D8 · SOI', 'APPn · metadata', 'FF DA · SOS'],
    language: 'C++',
    repoUrl: 'https://github.com/unknownparticles/jpeg-info',
    accent: 'coral',
  },
  {
    name: 'ImageQualityAnalyzer',
    title: '图像质量分析器',
    titleEn: 'Image quality analyser',
    summary: '图像质量分析的项目说明；公开仓库目前仅包含 README，算法实践另见本站笔记。',
    summaryEn: 'An image quality project outline. The public repository currently contains a README; algorithm experiments are documented in the notes.',
    evidence: ['项目说明', 'OpenCV', '图像指标'],
    evidenceEn: ['Project outline', 'OpenCV', 'Image metrics'],
    language: 'Python',
    repoUrl: 'https://github.com/unknownparticles/ImageQualityAnalyzer',
    accent: 'blue',
  },
  {
    name: 'pixpet',
    title: 'Pixpet 专注养成',
    titleEn: 'Pixpet focus companion',
    summary: 'Flutter iOS-first 专注应用，用专注获得能量并养成像素角色。',
    summaryEn: 'A Flutter, iOS-first focus app that turns attention into energy and grows a pixel companion.',
    evidence: ['Flutter', '状态管理', 'iOS-first UI'],
    evidenceEn: ['Flutter', 'State management', 'iOS-first UI'],
    language: 'Dart',
    repoUrl: 'https://github.com/unknownparticles/pixpet',
    accent: 'violet',
  },
  {
    name: 'photo',
    title: 'Photo Lab',
    titleEn: 'Photo Lab',
    summary: '以浏览器本地图片处理为核心，将降噪与锐化放入 Worker，并为图像方向和裁剪保留测试。',
    summaryEn: 'Browser image processing with a worker for denoising and sharpening, plus tests for orientation and cropping.',
    evidence: ['TypeScript', '像素处理线程', '图像测试'],
    evidenceEn: ['TypeScript', 'Pixel processing worker', 'Image tests'],
    caseSlug: 'photo',
    featured: true,
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/photo',
    demoUrl: 'https://alunapp.cn/photo/',
    preview: '/img/projects/photo.webp',
    accent: 'green',
  },
  {
    name: 'RepLog',
    title: 'RepLog 训练记录',
    titleEn: 'RepLog training log',
    summary: '本地优先的健身训练与饮食记录应用，包含日历、训练量和饮食追踪。',
    summaryEn: 'A local-first fitness and diet log with a calendar, volume tracking and meal records.',
    evidence: ['TypeScript', 'Local-first', '复杂状态界面'],
    evidenceEn: ['TypeScript', 'Local-first', 'Stateful interfaces'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/RepLog',
    demoUrl: 'https://alunapp.cn/RepLog/',
    preview: '/img/projects/RepLog.webp',
    accent: 'violet',
  },
  {
    name: 'life-mcp',
    title: 'Life MCP',
    titleEn: 'Life MCP',
    summary: '记录和检索个人经验的 MCP 工具，给 AI 当外部记忆用。',
    summaryEn: 'An MCP server that stores and searches personal notes, used as external memory for AI.',
    evidence: ['MCP', 'TypeScript', '知识工作流'],
    evidenceEn: ['MCP', 'TypeScript', 'Knowledge workflows'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/life-mcp',
    demoUrl: 'https://alunapp.cn/life-mcp/',
    accent: 'slate',
  },
  {
    name: 'unknownparticles.github.io',
    title: '本站：静态内容工程',
    titleEn: 'This site: static content engineering',
    summary: '用 Astro 在构建时校验内容、生成静态页面，以浏览器回归覆盖双语、主题与离线阅读。',
    summaryEn: 'Astro validates content and generates static pages at build time. Browser regression checks cover language, themes and offline reading.',
    evidence: ['Astro', '内容模型', '浏览器回归'],
    evidenceEn: ['Astro', 'Content schemas', 'Browser regression'],
    caseSlug: 'this-site',
    featured: true,
    signal: ['Markdown → schema', 'Astro → static HTML', 'Playwright → checks'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/unknownparticles.github.io',
    accent: 'slate',
  },

];

export const demoGroups: DemoGroup[] = [
  {
    id: 'tools',
    title: '工具',
    titleEn: 'Tools',
    description: '解决具体问题的浏览器工具。',
    descriptionEn: 'Browser tools that solve one specific problem.',
    items: [
      { name: 'Photo Lab', nameEn: 'Photo Lab', description: '本地图片处理', descriptionEn: 'Local image processing', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/photo', demoUrl: 'https://alunapp.cn/photo/' },
      { name: 'EasyDrop', nameEn: 'EasyDrop', description: '跨设备投送', descriptionEn: 'Cross-device casting', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/easydrop', demoUrl: 'https://alunapp.cn/easydrop/' },
      { name: '2FA', nameEn: '2FA', description: '双因素验证码', descriptionEn: 'Two-factor codes', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/2fa', demoUrl: 'https://alunapp.cn/2fa/' },
      { name: '随机选择器', nameEn: 'Random picker', description: '快速作出选择', descriptionEn: 'Decide faster', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/whattoeattoday', demoUrl: 'https://alunapp.cn/whattoeattoday/' },
      { name: '工资感知', nameEn: 'WageAware', description: '薪资与工时计算', descriptionEn: 'Pay and hours maths', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/WageAware', demoUrl: 'https://alunapp.cn/WageAware/' },
      { name: '确认存活', nameEn: 'Still alive', description: '邮件驱动的每日确认', descriptionEn: 'Daily check-in by email', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/alive', demoUrl: 'https://alunapp.cn/alive/' },
    ],
  },
  {
    id: 'games',
    title: '游戏',
    titleEn: 'Games',
    description: '规则、状态和交互反馈实验。',
    descriptionEn: 'Experiments in rules, state and interaction feedback.',
    items: [
      { name: 'TidyUp', nameEn: 'TidyUp', description: '整理与收纳游戏', descriptionEn: 'Tidy-up puzzler', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/TidyUp-', demoUrl: 'https://alunapp.cn/TidyUp-/' },
      { name: '博饼', nameEn: 'Bobing', description: '闽南骰子游戏', descriptionEn: 'Fujian dice game', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/bobing', demoUrl: 'https://alunapp.cn/bobing/' },
      { name: 'Chess Hub', nameEn: 'Chess Hub', description: '本地棋类智能中心', descriptionEn: 'Local chess hub', language: 'C++', repoUrl: 'https://github.com/unknownparticles/chess', demoUrl: 'https://alunapp.cn/chess/' },
      { name: '俄罗斯方块', nameEn: 'Tetris', description: '经典方块游戏', descriptionEn: 'The classic block stacker', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/tetris', demoUrl: 'https://alunapp.cn/tetris/' },
      { name: '贪吃蛇', nameEn: 'Snake', description: '浏览器贪吃蛇', descriptionEn: 'Snake in the browser', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/snake', demoUrl: 'https://alunapp.cn/snake/' },
      { name: '扫雷', nameEn: 'Minesweeper', description: '浏览器扫雷', descriptionEn: 'Minesweeper', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/minesweeper', demoUrl: 'https://alunapp.cn/minesweeper/' },
    ],
  },
  {
    id: 'focus',
    title: '效率与生活',
    titleEn: 'Focus & life',
    description: '时间、习惯与日常记录。',
    descriptionEn: 'Time, habits and everyday records.',
    items: [
      { name: 'RepLog', nameEn: 'RepLog', description: '训练与饮食记录', descriptionEn: 'Training and meals', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/RepLog', demoUrl: 'https://alunapp.cn/RepLog/' },
      { name: 'Focus Lab', nameEn: 'Focus Lab', description: '专注力测试与练习', descriptionEn: 'Attention drills', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/focuslab', demoUrl: 'https://alunapp.cn/focuslab/' },
      { name: 'Momentum', nameEn: 'Momentum', description: '小步行动记录', descriptionEn: 'Small-step tracker', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/momentum', demoUrl: 'https://alunapp.cn/momentum/' },
      { name: 'Worktime', nameEn: 'Worktime', description: '工作时间计算', descriptionEn: 'Work hours maths', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/worktime', demoUrl: 'https://alunapp.cn/worktime/' },
      { name: 'Todo', nameEn: 'Todo', description: '极简待办', descriptionEn: 'A minimal todo list', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/todo', demoUrl: 'https://alunapp.cn/todo/' },
      { name: '番茄钟', nameEn: 'Pomodoro Forest', description: '番茄工作法计时', descriptionEn: 'Pomodoro timer', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/pomodoro_forest', demoUrl: 'https://alunapp.cn/pomodoro_forest/' },
    ],
  },
  {
    id: 'experiments',
    title: '创意实验',
    titleEn: 'Experiments',
    description: 'AI、文化与一次性想法的快速原型。',
    descriptionEn: 'Fast prototypes around AI, culture and one-off ideas.',
    items: [
      { name: '电子木鱼', nameEn: 'Wooden fish', description: '功德与幸运值交互', descriptionEn: 'Merit and luck, by tapping', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/Electronic-Woodfish', demoUrl: 'https://alunapp.cn/Electronic-Woodfish/' },
      { name: 'Alun Chatbot', nameEn: 'Alun Chatbot', description: '多模式聊天机器人', descriptionEn: 'Multi-mode chatbot', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/alun-chatbot', demoUrl: 'https://alunapp.cn/alun-chatbot/' },
      { name: 'Life MCP', nameEn: 'Life MCP', description: '人生经验 MCP', descriptionEn: 'Experience as an MCP', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/life-mcp', demoUrl: 'https://alunapp.cn/life-mcp/' },
      { name: '新年倒计时', nameEn: 'New year countdown', description: '节日拍摄工具', descriptionEn: 'Holiday video helper', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/happy_new_year', demoUrl: 'https://alunapp.cn/happy_new_year/' },
      { name: 'Lottery', nameEn: 'Lottery', description: '彩票主题游戏', descriptionEn: 'A lottery game', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/lottery', demoUrl: 'https://alunapp.cn/lottery/' },
      { name: '天机', nameEn: 'Tianji', description: '算卦实验', descriptionEn: 'A divination toy', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/tianji', demoUrl: 'https://alunapp.cn/tianji/' },
    ],
  },
];
