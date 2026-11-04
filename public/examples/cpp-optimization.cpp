#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>
#if defined(__ARM_NEON)
#include <arm_neon.h>
#elif defined(__SSE2__)
#include <emmintrin.h>
#endif

void require(bool ok) {
    if (!ok) throw std::runtime_error("结果校验失败");
}
using Values = std::vector<std::int64_t>;

Values windows_naive(const Values& a, std::size_t k) {
    if (k == 0 || k > a.size()) return {};
    Values out;
    out.reserve(a.size() - k + 1);
    for (std::size_t i = 0; i + k <= a.size(); ++i) {
        std::int64_t sum = 0;
        for (std::size_t j = i; j < i + k; ++j) sum += a[j];
        out.push_back(sum);
    }
    return out;
}
Values windows_rolling(const Values& a, std::size_t k) {
    if (k == 0 || k > a.size()) return {};
    Values out;
    out.reserve(a.size() - k + 1);
    std::int64_t sum = std::accumulate(a.begin(), a.begin() + k, std::int64_t{0});
    out.push_back(sum);
    for (std::size_t i = k; i < a.size(); ++i) {
        sum -= a[i-k];
        sum += a[i];
        out.push_back(sum);
    }
    return out;
}

std::int64_t sum_rows(const Values& a, std::size_t rows, std::size_t cols) {
    std::int64_t sum = 0;
    for (std::size_t r = 0; r < rows; ++r)
        for (std::size_t c = 0; c < cols; ++c) sum += a[r*cols+c];
    return sum;
}
std::int64_t sum_columns(const Values& a, std::size_t rows, std::size_t cols) {
    std::int64_t sum = 0;
    for (std::size_t c = 0; c < cols; ++c)
        for (std::size_t r = 0; r < rows; ++r) sum += a[r*cols+c];
    return sum;
}

using Bytes = std::vector<std::uint8_t>;
using Table = std::array<std::uint8_t, 256>;
std::uint8_t adjusted(std::uint8_t value, int delta) {
    // 用例中的 delta 限定为 [-255, 255]。
    return static_cast<std::uint8_t>(std::clamp(int(value) + delta, 0, 255));
}
Table make_lut(int delta) {
    Table table{};
    for (std::size_t i = 0; i < table.size(); ++i)
        table[i] = adjusted(static_cast<std::uint8_t>(i), delta);
    return table;
}
Bytes brighten_direct(const Bytes& input, int delta) {
    Bytes out(input.size());
    for (std::size_t i = 0; i < input.size(); ++i) out[i] = adjusted(input[i], delta);
    return out;
}
Bytes brighten_lut(const Bytes& input, const Table& table) {
    Bytes out(input.size());
    for (std::size_t i = 0; i < input.size(); ++i) out[i] = table[input[i]];
    return out;
}

Values collect(const Values& input, bool preallocate) {
    Values out;
    if (preallocate) out.reserve(input.size());
    for (auto value : input) out.push_back(value * value);
    return out;
}

std::uint8_t quantize(double value) {
    if (!std::isfinite(value)) throw std::invalid_argument("输入必须有限");
    const double unit = (std::clamp(value, 0.1, 0.8) - 0.1) / 0.7;
    return static_cast<std::uint8_t>(std::lround(unit * 255.0));
}
double restore(std::uint8_t value) {
    return 0.1 + double(value) * 0.7 / 255.0;
}

Bytes brighten_simd(const Bytes& input, std::uint8_t delta) {
    Bytes out(input.size());
    std::size_t i = 0;
#if defined(__ARM_NEON)
    const auto d = vdupq_n_u8(delta);
    for (; i + 16 <= input.size(); i += 16)
        vst1q_u8(out.data()+i, vqaddq_u8(vld1q_u8(input.data()+i), d));
#elif defined(__SSE2__)
    const auto d = _mm_set1_epi8(static_cast<char>(delta));
    for (; i + 16 <= input.size(); i += 16) {
        const auto value = _mm_loadu_si128(reinterpret_cast<const __m128i*>(input.data()+i));
        _mm_storeu_si128(reinterpret_cast<__m128i*>(out.data()+i), _mm_adds_epu8(value, d));
    }
#endif
    for (; i < input.size(); ++i) out[i] = adjusted(input[i], delta);
    return out;
}

std::int64_t parallel_sum(const Values& input, std::size_t workers) {
    if (workers == 0) throw std::invalid_argument("线程数必须为正");
    if (input.empty()) return 0;
    workers = std::min(workers, input.size());
    Values partial(workers, 0);
    std::vector<std::thread> threads;
    threads.reserve(workers);
    try {
        for (std::size_t w = 0; w < workers; ++w) {
            const auto begin = input.size() * w / workers;
            const auto end = input.size() * (w + 1) / workers;
            threads.emplace_back([&, w, begin, end] {
                std::int64_t local = 0;
                for (auto i = begin; i < end; ++i) local += input[i];
                partial[w] = local;
            });
        }
    } catch (...) {
        for (auto& thread : threads) thread.join();
        throw;
    }
    for (auto& thread : threads) thread.join();
    return std::accumulate(partial.begin(), partial.end(), std::int64_t{0});
}

volatile std::int64_t observed = 0;

template<class F, class G>
void compare(const char* label, F first, G second) {
    std::array<double, 7> a{}, b{};
    auto measure = [](auto fn) {
        const auto start = std::chrono::steady_clock::now();
        const auto result = fn();
        const auto end = std::chrono::steady_clock::now();
        observed = result;
        return std::chrono::duration<double, std::milli>(end-start).count();
    };
    observed = first(); observed = second(); // 预热，不计入七轮
    for (std::size_t i = 0; i < a.size(); ++i) {
        if (i % 2 == 0) { a[i] = measure(first); b[i] = measure(second); }
        else { b[i] = measure(second); a[i] = measure(first); }
    }
    std::sort(a.begin(), a.end()); std::sort(b.begin(), b.end());
    std::cout << label << "\n  A median=" << a[3] << " ms [" << a.front() << "," << a.back()
              << "]\n  B median=" << b[3] << " ms [" << b.front() << "," << b.back() << "]\n";
}

template<class T>
std::int64_t checksum(const std::vector<T>& a) {
    return std::accumulate(a.begin(), a.end(), std::int64_t{0});
}

int main(int argc, char** argv) {
    std::mt19937 rng(42);
    for (std::size_t n = 0; n <= 80; ++n) {
        Values a(n);
        for (auto& value : a) value = int(rng()%201)-100;
        for (std::size_t k = 0; k <= n+1; ++k)
            require(windows_naive(a,k) == windows_rolling(a,k));
        require(collect(a,false) == collect(a,true));
        for (auto w : {1u,2u,4u}) require(parallel_sum(a,w) == checksum(a));
    }
    for (std::size_t rows = 0; rows <= 20; ++rows)
        for (std::size_t cols = 0; cols <= 20; ++cols) {
            Values a(rows*cols);
            for (auto& value : a) value = int(rng()%201)-100;
            require(sum_rows(a,rows,cols) == sum_columns(a,rows,cols));
        }
    Bytes all(256); std::iota(all.begin(), all.end(), 0);
    for (int delta = -255; delta <= 255; ++delta)
        require(brighten_direct(all,delta) == brighten_lut(all,make_lut(delta)));
    for (int delta = 0; delta <= 255; ++delta) {
        require(brighten_direct(all,delta) == brighten_simd(all,static_cast<std::uint8_t>(delta)));
        for (std::size_t n = 0; n <= 65; ++n) {
            Bytes a(n); for (auto& value : a) value = static_cast<std::uint8_t>(rng()%256);
            require(brighten_direct(a,delta) == brighten_simd(a,static_cast<std::uint8_t>(delta)));
        }
    }
    require(sum_rows({1,2,3,4,5,6},2,3) == 21);
    require(sum_columns({1,2,3,4,5,6},2,3) == 21);
    require(collect({-2,0,3},true) == Values({4,0,9}));
    for (auto n : {257u,1023u,4099u}) {
        Bytes input(n);
        for (std::size_t i = 0; i < input.size(); ++i)
            input[i] = static_cast<std::uint8_t>((i*37)%256);
        for (auto delta : {0,1,23,127,255})
            require(brighten_simd(input,static_cast<std::uint8_t>(delta)) == brighten_direct(input,delta));
    }
    bool rejected = false;
    try { parallel_sum({1},0); } catch (const std::invalid_argument&) { rejected = true; }
    require(rejected);
    double max_error = 0;
    for (int i = 0; i <= 10000; ++i) {
        const double value = 0.1 + 0.7*i/10000.0;
        max_error = std::max(max_error, std::abs(restore(quantize(value))-value));
    }
    require(max_error <= 0.7/510.0 + 1e-12);
    require(quantize(-1) == 0 && quantize(2) == 255);
    require(windows_rolling({1,7,3,2,4,5,8,0},5) == Values({17,21,22,19}));
    require(brighten_direct({0,120,250,255},10) == Bytes({10,130,255,255}));
    std::cout << "正确性校验通过：滑动窗口、遍历顺序、查表、预分配、量化、SIMD 与线程归并\n";
    std::cout << "量化最大误差=" << max_error << '\n';
#if defined(__ARM_NEON)
    std::cout << "SIMD path: ARM NEON\n";
#elif defined(__SSE2__)
    std::cout << "SIMD path: x86 SSE2\n";
#else
    std::cout << "SIMD path: scalar fallback\n";
#endif
    if (argc < 2 || std::string(argv[1]) != "--bench") return 0;
    constexpr std::size_t rows = 1024, cols = 1024;
    Values input(rows*cols);
    for (auto& value : input) value = int(rng()%201)-100;
    Bytes pixels(input.size());
    for (auto& value : pixels) value = static_cast<std::uint8_t>(rng()%256);
    const auto table = make_lut(23);
    std::cout << "n=1048576; window=64; matrix=1024x1024; threads=4; rounds=7\n";
    compare("窗口和 A=重新累加 B=增量更新", [&]{return checksum(windows_naive(input,64));}, [&]{return checksum(windows_rolling(input,64));});
    compare("遍历 A=按列 B=按行", [&]{return sum_columns(input,rows,cols);}, [&]{return sum_rows(input,rows,cols);});
    compare("亮度 A=直接计算 B=查表(不含建表)", [&]{return checksum(brighten_direct(pixels,23));}, [&]{return checksum(brighten_lut(pixels,table));});
    compare("容器 A=自动增长 B=预留容量", [&]{return checksum(collect(input,false));}, [&]{return checksum(collect(input,true));});
    compare("像素 A=普通循环 B=显式SIMD或回退", [&]{return checksum(brighten_direct(pixels,23));}, [&]{return checksum(brighten_simd(pixels,23));});
    compare("求和 A=单线程 B=四线程(含创建与归并)", [&]{return checksum(input);}, [&]{return parallel_sum(input,4);});
    std::cout << "observable checksum=" << observed << '\n';
}
