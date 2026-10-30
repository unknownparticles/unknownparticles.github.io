export type Localized = { zh: string; en: string };
export type TechnicalCase = {
  slug: string;
  projectName: string;
  focus: Localized;
  flow: string[];
  sections: { id: string; title: Localized; body: Localized }[];
  evidence: { label: Localized; href: string }[];
};

const jpeg = 'https://github.com/unknownparticles/jpeg-info/blob/90c7bbb78dc47462d52c090071c489bc7685084b';
const photo = 'https://github.com/unknownparticles/photo/blob/9daf264f91bf8d164826bb49ce39ea35e8341fb2';

export const technicalCases: TechnicalCase[] = [
  {
    slug: 'jpeg-info',
    projectName: 'jpeg-info',
    focus: { zh: '把文件格式拆成可追踪的解析阶段', en: 'Make a binary format inspectable, one stage at a time' },
    flow: ['FileReader', 'SegmentIndex', 'APP subtype', 'Metadata parser'],
    sections: [
      { id: 'problem', title: { zh: '问题：图像像素之外的信息', en: 'Problem: information beyond pixels' }, body: { zh: '读取相机参数、拍摄时间或颜色配置，不必先把整张图解码成像素。这个 C++17 命令行工具从 JPEG 标记段出发，列出段的位置与长度，再按类型读取元数据。重点是文件结构和元数据解析。', en: 'Camera settings, timestamps and colour profiles can be inspected without decoding the entire image into pixels. This C++17 command-line tool indexes JPEG marker segments by position and length, then reads metadata by type. Its focus is file structure and metadata parsing.' } },
      { id: 'implementation', title: { zh: '实现：先建索引，再分派解析', en: 'Implementation: index, then dispatch' }, body: { zh: 'jpeg_indexer.cpp 记录 marker、payload_offset 和 payload_len，并读取 APP 段头部识别 EXIF、XMP、ICC 等子类型。APP1 不能直接等同于 EXIF：实现会检查标识头。各类解析器放在独立模块，EXIF 通过 TIFF 头决定字节序。', en: 'jpeg_indexer.cpp records marker, payload_offset and payload_len, then inspects APP headers to identify EXIF, XMP and ICC subtypes. APP1 does not automatically mean EXIF: the implementation checks the identifier. Parsers live in separate modules; EXIF reads byte order from the TIFF header.' } },
      { id: 'tradeoffs', title: { zh: '取舍：索引与载荷分离', en: 'Trade-off: separate index and payload' }, body: { zh: '索引阶段只保留定位信息并查看必要的 APP 头部，具体解析时再读取相应载荷，避免为了列出段信息而把所有元数据都展开。代价是按需读取可能再次打开文件；这是一种结构取舍，本页没有提供与成熟图像库的性能比较。', en: 'The index keeps locations and inspects only the necessary APP headers. Individual parsers load payloads later, so listing segments does not require expanding all metadata. On-demand reads may reopen the file. This is a structural trade-off; no benchmark against established imaging libraries is claimed here.' } },
      { id: 'verification', title: { zh: '验证：从段列表交叉核对', en: 'Verification: cross-check segment boundaries' }, body: { zh: '可以按仓库说明构建后，分别运行 --segments、--exif 和 --icc，对照文件的十六进制内容与已知元数据。核验依据是下方固定版本的实现。此案例基于索引器与解析模块的源码审阅，尚未执行外部仓库的构建、样本回归或模糊测试。', en: 'Build using the repository instructions, then compare --segments, --exif and --icc output with the file bytes and known metadata. The pinned implementation below is the evidence for this walkthrough. This review inspected the indexer and parser modules; it did not run the external build, sample regression or fuzz tests.' } },
      { id: 'limits', title: { zh: '边界：复杂扫描与异常文件', en: 'Limits: complex scans and malformed files' }, body: { zh: '当前索引器进入 SOS 后寻找下一个标记，并随后结束索引循环。因此不能把这份实现描述为完整覆盖多次扫描的 JPEG 解析器。截断文件、异常偏移、ICC 分片缺失与复杂扫描仍需要专门样本验证；这些是后续加固方向。', en: 'After SOS, the current indexer searches for the next marker and then leaves the indexing loop. It should not be presented as a complete parser for every multi-scan JPEG. Truncation, invalid offsets, missing ICC chunks and complex scans need dedicated fixtures and remain areas for hardening.' } },
    ],
    evidence: [
      { label: { zh: '段索引与 APP 子类型识别', en: 'Segment indexing and APP detection' }, href: `${jpeg}/src/jpeg_indexer.cpp` },
      { label: { zh: 'EXIF 解析实现', en: 'EXIF parser implementation' }, href: `${jpeg}/src/parse_exif.cpp` },
      { label: { zh: 'ICC 解析实现', en: 'ICC parser implementation' }, href: `${jpeg}/src/parse_icc.cpp` },
      { label: { zh: '构建与命令说明', en: 'Build and command reference' }, href: `${jpeg}/README.md` },
    ],
  },
  {
    slug: 'photo',
    projectName: 'photo',
    focus: { zh: '图片处理中的线程、数据与正确性', en: 'Threads, data and correctness in image processing' },
    flow: ['Image input', 'Detail client', 'Worker / fallback', 'Pixel buffer'],
    sections: [
      { id: 'problem', title: { zh: '问题：像素计算与交互争用', en: 'Problem: pixel work competes with interaction' }, body: { zh: '降噪与锐化需要遍历像素缓冲区。如果所有计算都与界面操作挤在主线程，处理大图时可能影响交互。Photo Lab 的细节处理模块提供了一个可追踪的例子：把这部分计算交给 Worker，同时保留不可用时的处理路径。', en: 'Denoising and sharpening traverse pixel buffers. Running every operation on the UI thread can compete with interaction on large images. Photo Lab provides a concrete example: a detail-processing worker with a separate path when workers are unavailable.' } },
      { id: 'implementation', title: { zh: '实现：串行任务与缓冲区转移', en: 'Implementation: serialize tasks and transfer buffers' }, body: { zh: 'detailClient.ts 延迟创建 Worker，通过 Promise 链串行提交任务，并用转移列表传递 ArrayBuffer。提交前的 input.slice() 保留了输入副本，避免转移直接使调用方的原始缓冲区失效。detailWorker.ts 调用降噪和锐化函数，再把结果缓冲区转回。', en: 'detailClient.ts creates the worker lazily, serializes requests through a promise chain and transfers ArrayBuffer ownership. input.slice() preserves the caller’s original buffer before transfer. detailWorker.ts applies denoising and sharpening, then transfers the result back.' } },
      { id: 'tradeoffs', title: { zh: '取舍：可用性、内存与队列', en: 'Trade-off: availability, memory and queues' }, body: { zh: 'Worker 未能创建或已被标记为失败时，后续任务走主线程实现。输入副本有内存成本，串行队列也可能积压连续操作。正在执行的任务收到 Worker 错误会拒绝 Promise，不能把这一机制描述为所有故障都无缝重试。', en: 'If worker creation fails or the worker has been marked broken, subsequent tasks use the main-thread implementation. Copying the input costs memory, and serial processing can queue rapid edits. An in-flight task rejects on a worker error; this is not seamless retry for every failure.' } },
      { id: 'verification', title: { zh: '验证：检查图像语义', en: 'Verification: check image semantics' }, body: { zh: '公开源码包含 EXIF 方向读取、元数据写入、裁剪定位与细节处理的测试。它们让文件语义和像素处理都有明确的核对入口。此案例基于测试与 Worker 实现的源码审阅，尚未执行外部项目的完整测试，也未测量主线程耗时或内存峰值。', en: 'The source includes tests for EXIF orientation, metadata writing, crop alignment and detail processing. These provide concrete checks for file semantics and pixel work. This review inspected the tests and worker implementation; it did not execute the external test suite or measure main-thread time and peak memory.' } },
      { id: 'limits', title: { zh: '边界：大图与可选资源', en: 'Limits: large images and optional resources' }, body: { zh: '基础图片操作以浏览器本地处理为核心；可选 AI 功能会按需下载模型和运行时资源。浏览器解码和编码支持、超大图内存占用、连续操作的过期任务，仍需要按设备测试。这里不承诺全格式支持、完全无网络或已实现取消机制。', en: 'Core image operations run locally in the browser; optional AI tools download models and runtime assets on demand. Codec support, large-image memory and stale tasks during rapid edits need device-specific testing. Universal format support, zero networking and task cancellation are not claimed.' } },
    ],
    evidence: [
      { label: { zh: '任务队列与回退路径', en: 'Task queue and fallback path' }, href: `${photo}/src/core/detailClient.ts` },
      { label: { zh: '像素处理 Worker', en: 'Pixel-processing worker' }, href: `${photo}/src/core/detailWorker.ts` },
      { label: { zh: '方向、元数据与裁剪测试', en: 'Orientation, metadata and crop tests' }, href: `${photo}/src/core/image.test.ts` },
      { label: { zh: '本地处理与模型资源说明', en: 'Local processing and model resources' }, href: `${photo}/README.md` },
    ],
  },
  {
    slug: 'this-site',
    projectName: 'unknownparticles.github.io',
    focus: { zh: '把个人网站当作一个持续验证的工程', en: 'Treat a personal site as an engineering project' },
    flow: ['Markdown', 'Content schema', 'Static routes', 'Browser checks'],
    sections: [
      { id: 'problem', title: { zh: '问题：内容持续增长，入口保持稳定', en: 'Problem: growing content, stable entry points' }, body: { zh: '技术博客要容纳文章、项目和案例，也要让旧链接继续可读。本站使用内容集合描述文章字段，在构建阶段生成日期路径和静态页面，把内容错误尽量前移到发布之前。页面无需常驻应用服务器。', en: 'A technical site needs articles, projects and case studies while keeping old links readable. Content collections describe article fields, and dated routes are generated at build time. This moves content errors ahead of release without requiring a persistent application server.' } },
      { id: 'implementation', title: { zh: '实现：内容模型与渐进增强', en: 'Implementation: content models and progressive enhancement' }, body: { zh: 'content.config.ts 校验标题、日期和标签等字段，posts.ts 集中生成文章地址。静态 HTML 提供中文内容及导航；少量脚本负责语言、主题、标签过滤和几何交互。案例与项目共用数据，标题和摘要分别提供中文与英文。', en: 'content.config.ts validates fields such as title, date and tags; posts.ts centralizes article URLs. Static HTML provides Chinese content and navigation, while small scripts handle language, themes, tag filters and geometry. Cases share project data with localized titles and summaries.' } },
      { id: 'tradeoffs', title: { zh: '取舍：静态交付与客户端状态', en: 'Trade-off: static delivery and client state' }, body: { zh: '静态输出减少运行时服务依赖，代价是内容更新需要重新构建。语言偏好和主题保存在本地；英文内容依赖脚本切换，当前没有独立的英文 URL。Service Worker 提供离线回退，同时也需要考虑旧缓存与新部署的一致性。', en: 'Static output reduces runtime service dependencies, but content updates require rebuilding. Language and theme preferences are stored locally. English is applied by script, with no separate English URL today. The service worker adds an offline fallback and creates a cache-consistency concern during deployments.' } },
      { id: 'verification', title: { zh: '验证：从类型到浏览器行为', en: 'Verification: from types to browser behaviour' }, body: { zh: 'npm run check 检查 Astro 和类型，npm run build 生成全部页面。Playwright 用例覆盖导航、语言持久化、主题、图片、标签过滤与离线回退。性能文章另通过 npm run test:article 提取并编译正文代码，校验示例不会只停留在文案层面。', en: 'npm run check checks Astro and types; npm run build generates the pages. Playwright covers navigation, language persistence, themes, images, tag filters and offline fallback. npm run test:article extracts and compiles the performance article’s code so its examples are checked directly.' } },
      { id: 'limits', title: { zh: '边界：测试与实际体验', en: 'Limits: tests and real experience' }, body: { zh: '浏览器回归只能验证覆盖到的行为，不能替代真实读者反馈或完整无障碍审计。当前部署工作流运行类型检查与构建，浏览器回归和 C++ 示例校验可在本地执行。本案例没有用未测量的性能分数或访问量证明质量。', en: 'Browser regression checks covered behaviour, not reader satisfaction or a complete accessibility audit. Deployment currently runs type checks and builds; browser regression and C++ example checks are available locally. No unmeasured performance score or traffic figure is used as evidence.' } },
    ],
    evidence: [
      { label: { zh: '内容模型', en: 'Content schema' }, href: 'https://github.com/unknownparticles/unknownparticles.github.io/blob/master/src/content.config.ts' },
      { label: { zh: '静态文章路径', en: 'Static article paths' }, href: 'https://github.com/unknownparticles/unknownparticles.github.io/blob/master/src/lib/posts.ts' },
      { label: { zh: '语言与主题回归', en: 'Language and theme regression' }, href: 'https://github.com/unknownparticles/unknownparticles.github.io/blob/master/tests/i18n.spec.ts' },
      { label: { zh: '构建与发布工作流', en: 'Build and deploy workflow' }, href: 'https://github.com/unknownparticles/unknownparticles.github.io/blob/master/.github/workflows/deploy.yml' },
    ],
  },
];
