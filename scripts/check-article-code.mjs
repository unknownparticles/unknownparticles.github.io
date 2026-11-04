import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir, cpus } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const article = readFileSync(new URL('../src/content/posts/2024-08-14-浅谈c++性能优化.md', import.meta.url), 'utf8');
const blocks = [...article.matchAll(/```cpp\n([\s\S]*?)\n```/g)];
if (blocks.length < 2) throw new Error('性能文章应包含套件与矩阵示例');
const suites = [
  ['cpp-optimization.cpp', blocks.slice(0, -1).map((block) => block[1]).join('\n\n') + '\n'],
  ['cpp-matrix.cpp', blocks.at(-1)[1] + '\n'],
];
for (const [file, source] of suites) {
  if (readFileSync(new URL('../public/examples/' + file, import.meta.url), 'utf8') !== source)
    throw new Error(file + ' 下载内容与文章不一致');
}
const directory = mkdtempSync(join(tmpdir(), 'alun-article-'));
const compiler = process.env.CXX || 'c++';
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} 执行失败：${result.status}`);
}
try {
  console.log(`平台：${process.platform}/${process.arch}；CPU：${cpus()[0]?.model ?? 'unknown'}`);
  run(compiler, ['--version']);
  for (const [name, code] of suites) {
    console.log(`\n运行 ${name}`);
    const source = join(directory, name);
    const binary = join(directory, 'article');
    writeFileSync(source, code);
    const flags = ['-std=c++17', '-pthread', '-Wall', '-Wextra', '-Werror', '-O1', '-g', '-fsanitize=address,undefined'];
    console.log(`校验参数：${flags.join(' ')}`);
    run(compiler, [...flags, source, '-o', binary]);
    run(binary, []);
    if (process.argv.includes('--bench')) {
      const optimized = ['-std=c++17', '-O3', '-pthread'];
      console.log(`基准平台：${process.platform}/${process.arch}；参数：${optimized.join(' ')}`);
      run(compiler, [...optimized, source, '-o', binary]);
      run(binary, ['--bench']);
    }
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
