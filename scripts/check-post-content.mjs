import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import YAML from 'yaml';

const root = resolve(import.meta.dirname, '..');
const directory = join(root, 'src/content/posts');
let articles = 0, images = 0, snippets = 0;
for (const file of readdirSync(directory).filter(file => file.endsWith('.md'))) {
  const source = readFileSync(join(directory, file), 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
  assert(frontmatter, `${file}: 缺少元数据`);
  const data = YAML.parse(frontmatter[1]);
  assert(existsSync(join(root, 'public', data['header-img'])), `${file}: 封面不存在`);
  let fence = null, code = [], outside = [], bodyImages = 0;
  for (const line of source.slice(frontmatter[0].length).split('\n')) {
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!fence && marker) {
      fence = { char: marker[1][0], length: marker[1].length, lang: marker[2].trim() };
      code = [];
    } else if (fence && marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) {
      const value = code.join('\n');
      if (fence.lang === 'json') JSON.parse(value);
      if (fence.lang === 'yaml') YAML.parse(value);
      if (fence.lang === 'javascript') {
        const parsed = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: value, encoding: 'utf8' });
        assert.equal(parsed.status, 0, `${file}: JavaScript 语法错误 ${parsed.stderr}`);
      }
      if (fence.lang === 'python') {
        const parsed = spawnSync('python3', ['-c', 'import ast,sys;ast.parse(sys.stdin.read())'], { input: value, encoding: 'utf8' });
        assert.equal(parsed.status, 0, `${file}: Python 语法错误 ${parsed.stderr}`);
      }
      snippets += 1; fence = null;
    } else if (fence) {
      // 内部同长度、带语言标记的围栏一般是误嵌套，不应默默吞掉正文。
      assert(!(marker && marker[1].length >= fence.length), `${file}: 疑似嵌套代码围栏`);
      code.push(line);
    } else outside.push(line);
  }
  assert.equal(fence, null, `${file}: 未闭合代码围栏`);
  const body = outside.join('\n');
  for (const [, alt, src] of body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    assert(alt.trim() && !/在这里插入|Open image/.test(alt), `${file}: 图片缺少有意义的说明`);
    assert(src.startsWith('/img/'), `${file}: 正文仍依赖外部图床 ${src}`);
    assert(existsSync(join(root, 'public', src)), `${file}: 图片不存在 ${src}`);
    bodyImages += 1;
  }
  assert(bodyImages > 0, `${file}: 缺少正文图解`);
  // 构建后才检查本站路由；代码中的占位符不属于真实导航。
  if (existsSync(join(root, 'dist/index.html'))) {
    for (const [, href] of body.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)#]+)(?:#[^)]*)?\)/g)) {
      const target = join(root, 'dist', decodeURIComponent(href));
      assert(existsSync(target) || existsSync(join(target, 'index.html')), `${file}: 本站链接失效 ${href}`);
    }
  }
  images += bodyImages; articles += 1;
  console.log(`${file}: ${bodyImages} 张本地正文配图`);
}

// 验证 Fetch 示例确实区分 HTTP 错误与正常 JSON，不只验证语法。
const frontend = readFileSync(join(directory, '2025-11-11-前端开发技术分享.md'), 'utf8');
const fetchCode = frontend.match(/```javascript\n(\/\/ 使用 Fetch API[\s\S]*?)\n```/)[1];
const sandbox = { fetch: async () => ({ ok: false, status: 500 }), console: { error() {} } };
vm.createContext(sandbox); vm.runInContext(fetchCode, sandbox);
await assert.rejects(sandbox.fetchData(), /HTTP 500/);
sandbox.fetch = async () => ({ ok: true, json: async () => ({ ready: true }) });
assert.equal((await sandbox.fetchData()).ready, true);
console.log(`校验通过：${articles} 篇文章、${images} 张本地正文配图、${snippets} 个代码块及 Fetch 错误路径`);
