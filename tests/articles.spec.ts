import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const postDirectory = join(process.cwd(), 'src/content/posts');
const source = (file: string) => readFileSync(join(postDirectory, file), 'utf8');
const shaders = (file: string) => [...source(file).matchAll(/```glsl\n([\s\S]*?)\n```/g)].map(match => match[1]);
const blending = shaders('2024-03-08-opengl混合模式相关.md')[0];
const panoramas = shaders('2024-03-20-opengl全景图渲染.md');

// WebGL 的软件实现让这些文档数值回归不依赖本机显卡。
test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const file of readdirSync(postDirectory).filter(file => file.endsWith('.md'))) {
  // Astro 内容 slug 会移除加号、转换 ASCII 大写和空格。
  const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.*)\.md$/)!;
  const slug = match[4].toLowerCase().replaceAll('+', '').replaceAll(' ', '-');
  const route = `/${match[1]}/${match[2]}/${match[3]}/${slug}/`;
  test(`${file} has readable local figures`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.post-hero h1')).toBeVisible();
    const images = page.locator('.prose img');
    expect(await images.count()).toBeGreaterThan(0);
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('src', /^\/img\/posts\//);
      await expect(img).toHaveAttribute('alt', /.+/);
      await img.scrollIntoViewIfNeeded();
      expect(await img.evaluate(async image => {
        const element = image as HTMLImageElement;
        await element.decode();
        return element.naturalWidth > 0 && element.getBoundingClientRect().width <= innerWidth;
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('article shaders compile and blend boundaries render as specified', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '相同软件 WebGL 实现只需运行一次');
  await page.goto('/');
  const result = await page.evaluate(({ blending, panoramas }) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false })!;
    if (!gl) throw new Error('WebGL unavailable');
    gl.disable(gl.DITHER);
    const vertex = 'attribute vec2 position; varying vec2 vUV; void main(){vUV=position*0.5+0.5;gl_Position=vec4(position,0.,1.);}';
    const program = (fragment: string) => {
      const p = gl.createProgram()!;
      for (const [type, code] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, code); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)!);
        gl.attachShader(p, shader); gl.deleteShader(shader);
      }
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)!);
      return p;
    };
    const full = program(blending);
    for (const source of panoramas) program(source);
    const scalar = program(blending.split('void main()')[0] + '\nuniform float testA; uniform float testB; void main(){gl_FragColor=vec4(vec3(blendChannel(testA,testB,blendMode)),1.);}');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const use = (p: WebGLProgram) => {
      gl.useProgram(p);
      const location = gl.getAttribLocation(p, 'position');
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };
    const draw = () => {
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const pixel = new Uint8Array(4); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
      if (gl.getError() !== gl.NO_ERROR) throw new Error('WebGL draw error');
      return [...pixel];
    };
    use(scalar);
    const expected = [.75,.1875,0,1,.8125,.375,.75,.25,.5,.625,.375,.625,.5,.75,.5,0,1,1,0,1/3];
    let checked = 0;
    const check = (mode: number, a: number, b: number, value: number) => {
      gl.uniform1i(gl.getUniformLocation(scalar,'blendMode'), mode);
      gl.uniform1f(gl.getUniformLocation(scalar,'testA'), a);
      gl.uniform1f(gl.getUniformLocation(scalar,'testB'), b);
      const pixel = draw();
      if (Math.abs(pixel[0]/255-value)>2/255) throw new Error(`mode=${mode}, ${a},${b}: ${pixel[0]/255} != ${value}`);
      checked++;
    };
    expected.forEach((v,m) => check(m,.25,.75,v));
    check(2,1,0,1); check(2,0,0,0); check(3,0,1,0); check(3,1,1,1);
    check(19,0,0,1);
    for (const a of [0,.125,.25,.5,.75,1]) {
      check(0,a,0,0); check(1,a,1,a); check(4,a,0,a); check(5,a,.5,a);
    }
    // 完整片段 shader：真实纹理输入验证透明底图及输出 Alpha。
    use(full);
    const texture = (unit: number, color: number[]) => {
      gl.activeTexture(gl.TEXTURE0+unit);
      gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(color));
    };
    gl.uniform1i(gl.getUniformLocation(full,'baseTexture'),0);
    gl.uniform1i(gl.getUniformLocation(full,'layerTexture'),1);
    gl.uniform1i(gl.getUniformLocation(full,'blendMode'),0);
    gl.uniform1f(gl.getUniformLocation(full,'opacity'),1);
    texture(0,[0,0,255,0]); texture(1,[255,0,0,128]);
    const transparentBase=draw();
    texture(0,[0,0,255,255]); texture(1,[255,0,0,128]);
    const opaqueBase=draw();
    return { checked, transparentBase, opaqueBase };
  }, { blending, panoramas });
  expect(result.checked).toBe(49);
  expect(result.transparentBase).toEqual([255,0,0,128]);
  expect(result.opaqueBase[0]).toBeCloseTo(128,0);
  expect(result.opaqueBase[2]).toBeCloseTo(127,0);
  expect(result.opaqueBase[3]).toBe(255);
});
