# 验证记录

## 项目证据

核验日期：2026-10-30。外部源码只克隆到系统临时目录，未修改外部仓库。

- jpeg-info：`90c7bbb78dc47462d52c090071c489bc7685084b`，检查段索引、元数据模块和 README。索引器遇到 SOS 后查找下一个标记并结束，不能据此承诺支持所有渐进扫描或损坏文件。
- Photo Lab：`9daf264f91bf8d164826bb49ce39ea35e8341fb2`，检查 `detailClient.ts`、`detailWorker.ts`、`image.test.ts` 和 README；Worker 不可用时有主线程路径。没有在本轮运行外部项目测试或性能基准。
- ImageQualityAnalyzer：`c6eeab385b7035fe6a54885eb9dc3c95bee55f88`，仓库仅 README，因此不作为完整工程案例展示。
- 本站：当前仓库的路由、内容模型、语言设置、部署工作流和 Playwright 用例。

## 文章正确性

`npm run test:article -- --bench` 已通过。Apple clang 21.0.0，darwin/arm64；以 ASan/UBSan 校验 625 个矩阵和 517 个字节字符串。微基准使用 `-O3`、512×768、80 次更新；两者校验和均为 31048320。一次测量不足以支持通用加速结论，未将耗时或加速倍数写入网站。

## 待完成的站点验证

类型检查、构建、浏览器回归和截图检查将在展示改动完成后记录。
