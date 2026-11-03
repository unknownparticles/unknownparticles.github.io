"""生成可编辑的文章 SVG 示意图；不依赖外部图床。"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
INK = '#20304d'
MUTED = '#536580'


def txt(x, y, value, size=24, color=INK):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}">{escape(value)}</text>'


def box(x, y, w, h, fill='#dbe5ff', radius=14):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>'


def line(x1, y1, x2, y2, arrow=False):
    marker = ' marker-end="url(#arrow)"' if arrow else ''
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{MUTED}" stroke-width="3"{marker}/>'


def save(folder, name, title, desc, body, height=440):
    target = ROOT/'public/img/posts'/folder/(name+'.svg')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{MUTED}"/></marker></defs>{box(0,0,1000,height,'#f3f6fc',20)}<g font-family="system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif">{txt(36,52,title,32)}{txt(36,91,desc,21,MUTED)}{body}</g></svg>''')


def flow(folder, name, title, desc, nodes, footer):
    body = ''
    w = 210
    colors = ['#dbe5ff', '#d5f5ee', '#fce9cf', '#efdefa']
    for i, (label, detail) in enumerate(nodes):
        x = 32+i*246
        body += box(x,155,w,120,colors[i]) + txt(x+16,201,label,26) + txt(x+16,243,detail,20)
        if i < len(nodes)-1:
            body += line(x+w+5,215,x+240,215,True)
    body += txt(36,340,footer,23)
    save(folder,name,title,desc,body,390)


flow('opengl-basics','render-pipeline','一次绘制如何到达帧缓冲',
     '此图简化装配、裁剪与可选阶段；片段与最终像素并非一一对应。',
     [('顶点输入','VBO / 索引'),('顶点着色','裁剪空间位置'),('光栅化与片段','插值 / 颜色计算'),('测试与写入','深度 / 混合 / FBO')],
     '先准备资源与状态，再由绘制命令使用它们。')
body = box(360,132,280,90) + txt(400,188,'VAO：属性状态',28)
body += box(50,290,380,82,'#d5f5ee') + txt(75,340,'VBO：位置、UV 等数据',26)
body += box(570,290,380,82,'#fce9cf') + txt(593,340,'EBO：0, 1, 2, 0, 2, 3',26)
body += line(410,222,240,287,True) + line(590,222,760,287,True)
body += txt(36,420,'四个完整顶点 + 六个索引 → 两个共享边的三角形',25)
save('opengl-basics','buffer-relationships','VAO 引用数据，不复制数据',
     '属性格式与缓冲区引用由 VAO 记录，EBO 的绑定也属于 VAO 状态。',body,460)

body = box(40,150,250,135,'#dbe5ff') + txt(68,195,'屏幕片段',28) + txt(68,240,'生成方向 d',25)
body += line(300,200,430,165,True) + line(300,245,430,315,True)
body += box(445,125,510,110,'#d5f5ee') + txt(468,168,'经纬方向 → (u,v)',28) + txt(468,207,'sampler2D：二维等距柱状图',23)
body += box(445,275,510,110,'#fce9cf') + txt(468,318,'方向 d → 面与面内坐标',28) + txt(468,357,'samplerCube：六面立方体纹理',23)
body += txt(40,435,'同一条观察射线，两种环境数据表示。',25)
save('panorama','direction-mapping','全景采样：屏幕方向到环境纹理',
     '显示全景背景无需先构建球体网格；关键是方向与纹理表示保持一致。',body,475)

body=''
faces=[(390,125,'+Y'),(245,225,'−X'),(390,225,'−Z'),(535,225,'+X'),(680,225,'+Z'),(390,325,'−Y')]
for x,y,label in faces:
    body+=box(x,y,130,86,'#d5f5ee' if label=='−Z' else '#dbe5ff',6)+txt(x+39,y+54,label,32)
body += txt(40,465,'API 上传顺序：+X、−X、+Y、−Y、+Z、−Z',25)
body += txt(40,505,'展开图仅标识邻接；每面的旋转与 UV 方向还需按纹理约定校验。',22)
save('panorama','cubemap-faces','Cubemap 的六个方向',
     '相机默认朝 −Z，Y 向上；front / back 等文件名不能代替轴向定义。',body,550)

# Eye landmark geometry.
body='<path d="M110 245Q280 80 450 245Q280 410 110 245Z" fill="#dbe5ff" stroke="#536580" stroke-width="3"/>'
points=[(110,245,'p1'),(210,176,'p2'),(350,176,'p3'),(450,245,'p4'),(350,314,'p5'),(210,314,'p6')]
for x,y,label in points:
    body+=f'<circle cx="{x}" cy="{y}" r="7" fill="#156f78"/>'+txt(x-15,y-18,label,24)
body+=line(210,183,210,307)+line(350,183,350,307)+line(117,245,443,245)
body+=box(515,160,445,180,'#d5f5ee')+txt(540,209,'EAR = 两条竖向距离之和',25)+txt(540,251,'÷（2 × 两眼角距离）',25)+txt(540,302,'闭合 → 竖向距离下降',24)
body+=txt(36,411,'关键点缺失 → Unknown；连续低 EAR → 再判定闭眼。',25)
save('eye-state','ear-landmarks','眼睛纵横比：量眼睑，不量检测框',
     '六点顺序是本例的约定，接入具体模型时需要映射其关键点编号。',body,455)

body=box(40,145,920,80,'#dbe5ff')+txt(64,194,'JPEG：SOI → APP0 / APP1 / 其他段 → SOS → 扫描数据',26)
body+=box(40,270,300,90,'#d5f5ee')+txt(60,324,'Exif + 两个零字节',26)
body+=box(360,270,220,90,'#fce9cf')+txt(386,324,'TIFF 头',28)
body+=box(610,270,350,90,'#d5f5ee')+txt(637,324,'IFD 与其他数据',28)
body+=line(470,367,780,367,True)+txt(360,410,'IFD 偏移从 TIFF 头起算',25)
body+=txt(40,470,'段长度是大端；TIFF 内部字节序由 II / MM 决定。',25)
save('jpeg-exif','offset-layout','两层结构，两种偏移基准',
     'APP1 也可能装 XMP，先验证标识，再解析 TIFF。此图不表示固定字节位置。',body,510)

body=box(40,140,920,90,'#dbe5ff')+txt(64,194,'DOWN：Activity → ViewGroup → 子 View（接受手势）',26)
body+=box(40,265,920,100,'#fce9cf')+txt(64,307,'MOVE：父级决定拦截 → 子 View 收到 CANCEL',26)+txt(64,343,'后续事件交给父级；子 View 清理本次手势',23)
body+=txt(40,422,'消费：处理结果返回调用者；拦截：父级改变分发目标。',25)
save('android-touch','dispatch-flow','Android：消费与拦截分开理解',
     '一般序列以 UP 或 CANCEL 之一结束；父级可观察事件而不消费。',body,465)

body=''
for row in range(4):
    for col in range(5):
        boundary=row in (0,3) or col in (0,4)
        x=40+col*75;y=135+row*62
        body+=box(x,y,65,52,'#fce9cf' if boundary else '#d5f5ee',6)+txt(x+14,y+35,'−1' if boundary else '+1',26)
body+=box(480,145,475,190,'#dbe5ff')+txt(504,188,'参考实现 → 候选实现',28)+txt(504,234,'先验证：空矩阵、单行、单列',23)+txt(504,275,'再测量：编译器、输入、硬件',23)+txt(504,314,'结果等价 ≠ 保证更快',25)
body+=txt(40,430,'每个元素只更新一次，角点不能重复处理。',26)
save('cpp-performance','boundary-and-measure','矩阵循环拆分前先固定语义',
     '边界元素减一，内部元素加一；不能只用普通矩形验证优化。',body,475)

flow('frontend','request-state-render','前端交互中的数据流',
     '把加载、成功与失败状态显式建模，错误状态码需要主动检查。',
     [('用户交互','触发请求'),('网络请求','检查 response.ok'),('状态更新','成功 / 失败'),('界面渲染','内容 / 错误 / 重试')],
     '请求失败不能伪装成成功返回 undefined。')
flow('open-source','contribution-flow','一次可审查的开源贡献',
     '先阅读项目贡献指南；CI 与审查帮助确认修改的范围和行为。',
     [('问题复现','描述输入与预期'),('分支修改','聚焦一个问题'),('验证与 PR','附复现和测试'),('审查与迭代','响应反馈后合并')],
     '个人项目维护与向他人项目贡献，是不同的经历。')
flow('learning','feedback-loop','用反馈推动下一轮学习',
     '每轮围绕一个可验证的小目标，避免只收集工具名称。',
     [('明确问题','设定小目标'),('动手实现','完成最小项目'),('验证结果','测试与调试'),('复盘分享','解释并找出缺口')],
     '把下一轮的问题写下来，再选择需要学习的知识。')
print('已生成十一张本地文章图解')
