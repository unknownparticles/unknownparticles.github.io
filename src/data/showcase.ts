export type TechnicalProject = {
  name: string;
  title: string;
  summary: string;
  evidence: string[];
  language: string;
  repoUrl: string;
  demoUrl?: string;
  preview?: string;
  accent: 'coral' | 'blue' | 'violet' | 'amber' | 'green' | 'slate';
};

export type DemoProject = {
  name: string;
  description: string;
  language: string;
  repoUrl: string;
  demoUrl: string;
};

export type DemoGroup = {
  id: string;
  title: string;
  description: string;
  items: DemoProject[];
};

export const technicalProjects: TechnicalProject[] = [
  {
    name: 'jpeg-info',
    title: 'JPEG 元数据解析器',
    summary: '不用图像框架，直接读取 JPEG 标记段，解析 JFIF、EXIF、XMP 与 ICC Profile。',
    evidence: ['C++17', '二进制格式解析', 'EXIF / XMP / ICC'],
    language: 'C++',
    repoUrl: 'https://github.com/unknownparticles/jpeg-info',
    accent: 'coral',
  },
  {
    name: 'ImageQualityAnalyzer',
    title: '图像质量分析器',
    summary: '使用 Python 与 OpenCV 评估清晰度、人脸、光照，并查找相似图片。',
    evidence: ['OpenCV', '图像指标', '相似度检索'],
    language: 'Python',
    repoUrl: 'https://github.com/unknownparticles/ImageQualityAnalyzer',
    accent: 'blue',
  },
  {
    name: 'pixpet',
    title: 'Pixpet 专注养成',
    summary: 'Flutter iOS-first 专注应用，用专注获得能量并养成像素角色。',
    evidence: ['Flutter', '状态管理', 'iOS-first UI'],
    language: 'Dart',
    repoUrl: 'https://github.com/unknownparticles/pixpet',
    accent: 'violet',
  },
  {
    name: 'photo',
    title: 'Photo Lab',
    summary: '浏览器端完成图片裁剪、压缩与批量导出，数据保持在本地。',
    evidence: ['TypeScript', '本地文件处理', '批量任务'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/photo',
    demoUrl: 'https://alunapp.cn/photo/',
    preview: '/img/projects/photo.webp',
    accent: 'green',
  },
  {
    name: 'RepLog',
    title: 'RepLog 训练记录',
    summary: '本地优先的健身训练与饮食记录应用，包含日历、训练量和饮食追踪。',
    evidence: ['TypeScript', 'Local-first', '复杂状态界面'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/RepLog',
    demoUrl: 'https://alunapp.cn/RepLog/',
    preview: '/img/projects/RepLog.webp',
    accent: 'violet',
  },
  {
    name: 'life-mcp',
    title: 'Life MCP',
    summary: '用于记录、检索和复用人生经验的 MCP 工具，把个人经验接入 AI 工作流。',
    evidence: ['MCP', 'TypeScript', '知识工作流'],
    language: 'TypeScript',
    repoUrl: 'https://github.com/unknownparticles/life-mcp',
    demoUrl: 'https://alunapp.cn/life-mcp/',
    accent: 'slate',
  },
];

export const demoGroups: DemoGroup[] = [
  {
    id: 'tools',
    title: '工具',
    description: '解决具体问题的浏览器工具。',
    items: [
      { name: 'Photo Lab', description: '本地图片处理', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/photo', demoUrl: 'https://alunapp.cn/photo/' },
      { name: 'EasyDrop', description: '跨设备投送', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/easydrop', demoUrl: 'https://alunapp.cn/easydrop/' },
      { name: '2FA', description: '双因素验证码', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/2fa', demoUrl: 'https://alunapp.cn/2fa/' },
      { name: '随机选择器', description: '快速作出选择', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/whattoeattoday', demoUrl: 'https://alunapp.cn/whattoeattoday/' },
      { name: '工资感知', description: '薪资与工时计算', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/WageAware', demoUrl: 'https://alunapp.cn/WageAware/' },
      { name: '确认存活', description: '邮件驱动的每日确认', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/alive', demoUrl: 'https://alunapp.cn/alive/' },
    ],
  },
  {
    id: 'games',
    title: '游戏',
    description: '规则、状态和交互反馈实验。',
    items: [
      { name: 'TidyUp', description: '整理与收纳游戏', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/TidyUp-', demoUrl: 'https://alunapp.cn/TidyUp-/' },
      { name: '博饼', description: '闽南骰子游戏', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/bobing', demoUrl: 'https://alunapp.cn/bobing/' },
      { name: 'Chess Hub', description: '本地棋类智能中心', language: 'C++', repoUrl: 'https://github.com/unknownparticles/chess', demoUrl: 'https://alunapp.cn/chess/' },
      { name: '俄罗斯方块', description: '经典方块游戏', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/tetris', demoUrl: 'https://alunapp.cn/tetris/' },
      { name: '贪吃蛇', description: '浏览器贪吃蛇', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/snake', demoUrl: 'https://alunapp.cn/snake/' },
      { name: '扫雷', description: '浏览器扫雷', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/minesweeper', demoUrl: 'https://alunapp.cn/minesweeper/' },
    ],
  },
  {
    id: 'focus',
    title: '效率与生活',
    description: '时间、习惯与日常记录。',
    items: [
      { name: 'RepLog', description: '训练与饮食记录', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/RepLog', demoUrl: 'https://alunapp.cn/RepLog/' },
      { name: 'Focus Lab', description: '专注力测试与练习', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/focuslab', demoUrl: 'https://alunapp.cn/focuslab/' },
      { name: 'Momentum', description: '小步行动记录', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/momentum', demoUrl: 'https://alunapp.cn/momentum/' },
      { name: 'Worktime', description: '工作时间计算', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/worktime', demoUrl: 'https://alunapp.cn/worktime/' },
      { name: 'Todo', description: '极简待办', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/todo', demoUrl: 'https://alunapp.cn/todo/' },
      { name: 'Pomodoro Forest', description: '番茄钟', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/pomodoro_forest', demoUrl: 'https://alunapp.cn/pomodoro_forest/' },
    ],
  },
  {
    id: 'experiments',
    title: '创意实验',
    description: 'AI、文化与一次性想法的快速原型。',
    items: [
      { name: '电子木鱼', description: '功德与幸运值交互', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/Electronic-Woodfish', demoUrl: 'https://alunapp.cn/Electronic-Woodfish/' },
      { name: 'Alun Chatbot', description: '多模式聊天机器人', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/alun-chatbot', demoUrl: 'https://alunapp.cn/alun-chatbot/' },
      { name: 'Life MCP', description: '人生经验 MCP', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/life-mcp', demoUrl: 'https://alunapp.cn/life-mcp/' },
      { name: '新年倒计时', description: '节日拍摄工具', language: 'HTML', repoUrl: 'https://github.com/unknownparticles/happy_new_year', demoUrl: 'https://alunapp.cn/happy_new_year/' },
      { name: 'Lottery', description: '彩票主题游戏', language: 'JavaScript', repoUrl: 'https://github.com/unknownparticles/lottery', demoUrl: 'https://alunapp.cn/lottery/' },
      { name: '天机', description: '智能算卦实验', language: 'TypeScript', repoUrl: 'https://github.com/unknownparticles/tianji', demoUrl: 'https://alunapp.cn/tianji/' },
    ],
  },
];
