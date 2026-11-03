"""执行文章原代码的数值回归。依赖 Python NumPy/OpenCV、C++17 与 pkg-config opencv4。"""
from pathlib import Path
import importlib.util
import os
import re
import shlex
import subprocess
import tempfile
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT/'src/content/posts'


def blocks(name, language):
    source = (POSTS/name).read_text()
    return re.findall(r'```'+language+r'\n([\s\S]*?)\n```', source)


def load_python(name):
    namespace = {'__name__': 'article_regression'}
    for block in blocks(name, 'python'):
        exec(compile(block, name, 'exec'), namespace)
    return namespace


def main():
    learning = load_python('2025-11-11-编程学习心得.md')
    assert learning['backend_stack']['runtime'] == ['Node.js']
    eye = load_python('2024-03-28-人像闭眼检测.md')
    ear, State = eye['eye_aspect_ratio'], eye['EyeState']
    opened = [(0, 0), (1, -1), (3, -1), (4, 0), (3, 1), (1, 1)]
    closed = [(0, 0), (1, -.1), (3, -.1), (4, 0), (3, .1), (1, .1)]
    assert np.isclose(ear(opened), .5) and np.isclose(ear(closed), .05)
    # 等比缩放、平移不改变 EAR。
    assert np.isclose(ear(np.array(opened)*3+12), .5)
    state = State()
    assert [state.update(p) for p in [opened, closed, closed, closed, None]] == ['Open', 'Pending', 'Pending', 'Closed', 'Unknown']
    assert state.update([(0, 0)]*6) == 'Unknown'
    assert state.update(np.full((6, 2), np.nan)) == 'Unknown'
    spec = importlib.util.spec_from_file_location('blur_samples', ROOT/'scripts/generate-blur-samples.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    preprocess, score = module.article_functions()
    samples = module.samples()
    sharp = score(preprocess(samples['Sharp']))
    blurred = score(preprocess(samples['Blurred']))
    noisy = score(preprocess(samples['Blurred + noise']))
    assert sharp['laplacian_variance'] > blurred['laplacian_variance']
    assert noisy['laplacian_variance'] > blurred['laplacian_variance']
    assert score(preprocess(np.full((20, 20), 128, np.uint8)))['laplacian_variance'] == 0
    assert preprocess(np.zeros((100, 200), np.uint8), max_side=80).shape == (40, 80)
    for invalid in (None, np.zeros((0, 0), np.uint8), np.zeros((10, 10), np.float32)):
        try:
            preprocess(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError('无效图像未被拒绝')
    print('Python：字典执行、EAR 数值与缺失状态、清晰度噪声对照及无效输入通过')
    cpp = '\n'.join(blocks('2024-03-08-opengl混合模式相关.md', 'cpp'))
    harness = r'''
#include <cassert>
#include <iostream>
int main() {
    auto close = [](float a, float b) { return std::abs(a-b) < 1e-5f; };
    const float expected[] = {.75f,.1875f,0.f,1.f,.8125f,.375f,.75f,.25f,.5f,.625f,
                              .375f,.625f,.5f,.75f,.5f,0.f,1.f,1.f,0.f,1.f/3.f};
    for (int m=0; m<20; ++m) assert(close(blendChannel(.25f,.75f,m),expected[m]));
    assert(burn(1,0)==1 && burn(0,0)==0 && dodge(0,1)==0 && dodge(1,1)==1);
    // 独立定义的端点与恒等式，覆盖密集网格及所有模式。
    for (int i=0; i<=100; ++i) for (int j=0; j<=100; ++j) {
        float a=i/100.f, b=j/100.f;
        for (int m=0; m<20; ++m) {
            float c=blendChannel(a,b,m);
            assert(std::isfinite(c) && c>=-1e-6f && c<=1.000001f);
        }
        assert(close(blendChannel(a,b,10),blendChannel(b,a,11)));
        assert(close(blendChannel(a,1,1),a));
        assert(close(blendChannel(a,0,4),a));
        assert(close(blendChannel(a,.5f,5),a));
    }
    cv::Mat base(3,4,CV_32FC3,cv::Scalar(.2f,.3f,.4f));
    cv::Mat layer(2,3,CV_32FC3);
    for (int y=0;y<layer.rows;++y) for(int x=0;x<layer.cols;++x)
        layer.at<cv::Vec3f>(y,x)=cv::Vec3f((1+x+y*3)/10.f,.8f,.9f);
    for (cv::Point offset : {cv::Point(-1,-1),cv::Point(3,2),cv::Point(20,20),cv::Point(-20,-20),cv::Point(0,0)}) {
        cv::Mat out=blendImages(base,layer,offset,0,1);
        for(int y=0;y<base.rows;++y) for(int x=0;x<base.cols;++x) {
            int lx=x-offset.x,ly=y-offset.y;
            auto expectedPixel=(lx>=0 && ly>=0 && lx<layer.cols && ly<layer.rows)
                ? layer.at<cv::Vec3f>(ly,lx) : base.at<cv::Vec3f>(y,x);
            assert(cv::norm(out.at<cv::Vec3f>(y,x)-expectedPixel)<1e-6);
        }
    }
    auto unchanged=blendImages(base,layer,cv::Point(0,0),0,0);
    assert(cv::norm(unchanged-base)==0);
    std::cout << "C++：二十种模式、二十万余组结果、端点、负偏移和边界交集通过\n";
}
'''
    with tempfile.TemporaryDirectory(prefix='post-examples-') as directory:
        source = Path(directory)/'blend.cpp'
        source.write_text(cpp+'\n'+harness)
        flags = shlex.split(subprocess.check_output(['pkg-config', '--cflags', '--libs-only-L', 'opencv4'], text=True)) + ['-lopencv_core']
        binary = str(Path(directory)/'blend')
        subprocess.run([os.environ.get('CXX','c++'), '-std=c++17','-Wall','-Wextra','-Werror','-O1','-g','-fsanitize=undefined',str(source),'-o',binary]+flags,check=True)
        subprocess.run([binary],check=True)


if __name__ == '__main__':
    main()
