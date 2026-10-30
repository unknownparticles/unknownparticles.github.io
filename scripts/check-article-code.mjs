import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const article = readFileSync(new URL('../src/content/posts/2024-08-14-浅谈c++性能优化.md', import.meta.url), 'utf8');
const blocks = [...article.matchAll(/```cpp\n([\s\S]*?)\n```/g)];
if (blocks.length !== 1) throw new Error('性能文章应包含一个完整的 C++ 示例');
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
  const source = join(directory, 'article.cpp');
  const binary = join(directory, 'article');
  writeFileSync(source, blocks[0][1]);
  run(compiler, ['--version']);
  const flags = ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-O1', '-g', '-fsanitize=address,undefined'];
  console.log(`校验参数：${flags.join(' ')}`);
  run(compiler, [...flags, source, '-o', binary]);
  run(binary, []);
  if (process.argv.includes('--bench')) {
    const optimized = ['-std=c++17', '-O3'];
    console.log(`基准平台：${process.platform}/${process.arch}；参数：${optimized.join(' ')}`);
    run(compiler, [...optimized, source, '-o', binary]);
    run(binary, ['--bench']);
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
