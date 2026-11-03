"""生成固定种子的受控清晰度样本，并使用文章原代码计算分数。
依赖：opencv-python、numpy。只更新合成图，不改动读者图片。
"""
from pathlib import Path
import re
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def samples():
    image = np.full((240, 280), 225, np.uint8)
    cv2.rectangle(image, (20, 20), (259, 219), 35, 3)
    for x in range(40, 245, 20):
        cv2.line(image, (x, 48), (x, 105), 25, 3)
    cv2.putText(image, 'FOCUS', (40, 160), cv2.FONT_HERSHEY_SIMPLEX, 1.2, 30, 2)
    cv2.circle(image, (85, 190), 18, 40, 3)
    cv2.line(image, (130, 210), (235, 175), 15, 3)
    blurred = cv2.GaussianBlur(image, (0, 0), 3.0)
    noise = np.random.default_rng(42).normal(0, 18, image.shape)
    noisy = np.clip(blurred.astype(np.float64)+noise, 0, 255).astype(np.uint8)
    return {'Sharp': image, 'Blurred': blurred, 'Blurred + noise': noisy}


def article_functions():
    source = (ROOT/'src/content/posts/2024-03-28-图像模糊筛选.md').read_text()
    code = re.search(r'```python\n([\s\S]*?)\n```', source).group(1)
    namespace = {'__name__': 'article_example'}
    exec(compile(code, 'blur_article', 'exec'), namespace)
    return namespace['preprocess_image'], namespace['sharpness_scores']


def main():
    preprocess, score = article_functions()
    panels = []
    for label, sample in samples().items():
        panel = np.full((300, 300, 3), (252, 246, 243), np.uint8)
        panel[50:290, 10:290] = cv2.cvtColor(sample, cv2.COLOR_GRAY2BGR)
        cv2.putText(panel, label, (12, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.68, (77, 48, 32), 2)
        panels.append(panel)
        print(label, 'raw=', score(preprocess(sample)),
              'denoised=', score(preprocess(sample, denoise_sigma=1.0)))
    target = ROOT/'public/img/posts/blur-detection/controlled-samples.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(target), np.hstack(panels), [cv2.IMWRITE_WEBP_QUALITY, 90]):
        raise RuntimeError('示例图片写入失败')


if __name__ == '__main__':
    main()
