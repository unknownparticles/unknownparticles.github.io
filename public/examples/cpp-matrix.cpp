#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <unordered_set>
#include <vector>

using Matrix = std::vector<int>;

void reference(Matrix& a, std::size_t rows, std::size_t cols) {
    for (std::size_t r = 0; r < rows; ++r)
        for (std::size_t c = 0; c < cols; ++c)
            a[r * cols + c] += (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) ? -1 : 1;
}

void split_loops(Matrix& a, std::size_t rows, std::size_t cols) {
    if (rows == 0 || cols == 0) return;
    for (std::size_t c = 0; c < cols; ++c) --a[c];
    if (rows == 1) return;
    for (std::size_t c = 0; c < cols; ++c) --a[(rows - 1) * cols + c];
    for (std::size_t r = 1; r + 1 < rows; ++r) {
        --a[r * cols];
        if (cols == 1) continue;
        for (std::size_t c = 1; c + 1 < cols; ++c) ++a[r * cols + c];
        --a[r * cols + cols - 1];
    }
}

std::size_t unique_reference(const std::string& s) {
    std::unordered_set<unsigned char> window;
    std::size_t left = 0, best = 0;
    for (std::size_t right = 0; right < s.size(); ++right) {
        const auto ch = static_cast<unsigned char>(s[right]);
        while (window.count(ch)) window.erase(static_cast<unsigned char>(s[left++]));
        window.insert(ch);
        best = std::max(best, right - left + 1);
    }
    return best;
}

std::size_t unique_last_seen(const std::string& s) {
    std::array<std::size_t, 256> next{};
    std::size_t left = 0, best = 0;
    for (std::size_t right = 0; right < s.size(); ++right) {
        const auto ch = static_cast<unsigned char>(s[right]);
        left = std::max(left, next[ch]);
        best = std::max(best, right - left + 1);
        next[ch] = right + 1;
    }
    return best;
}

void require(bool ok) {
    if (!ok) throw std::runtime_error("结果不等价");
}

int main(int argc, char** argv) {
    std::mt19937 rng(42);
    std::size_t matrices = 0, strings = 0;
    for (std::size_t rows = 0; rows <= 24; ++rows) {
        for (std::size_t cols = 0; cols <= 24; ++cols) {
            Matrix input(rows * cols);
            for (auto& v : input) v = static_cast<int>(rng() % 2001) - 1000;
            auto expected = input, actual = input;
            reference(expected, rows, cols);
            split_loops(actual, rows, cols);
            require(actual == expected);
            ++matrices;
        }
    }
    for (const auto& s : {std::string(""), std::string("abcabcbb"), std::string("bbbbb"), std::string("pwwkew")}) {
        require(unique_reference(s) == unique_last_seen(s));
        ++strings;
    }
    require(unique_last_seen("") == 0 && unique_last_seen("abcabcbb") == 3);
    require(unique_last_seen("bbbbb") == 1 && unique_last_seen("pwwkew") == 3);
    for (std::size_t len = 0; len <= 512; ++len) {
        std::string s(len, '\0');
        for (auto& ch : s) ch = static_cast<char>(rng() % 256);
        require(unique_reference(s) == unique_last_seen(s));
        ++strings;
    }
    std::cout << "校验通过：" << matrices << " 个矩阵，" << strings << " 个字节字符串\n";

    if (argc < 2 || std::string(argv[1]) != "--bench") return 0;
    constexpr std::size_t rows = 512, cols = 768, iterations = 80;
    auto measure = [&](auto fn) {
        Matrix a(rows * cols, 0);
        const auto start = std::chrono::steady_clock::now();
        for (std::size_t i = 0; i < iterations; ++i) fn(a, rows, cols);
        const auto end = std::chrono::steady_clock::now();
        std::int64_t checksum = 0;
        for (int v : a) checksum += v;
        std::cout << std::chrono::duration<double, std::milli>(end - start).count()
                  << " ms; checksum=" << checksum << '\n';
    };
    std::cout << "reference: "; measure(reference);
    std::cout << "split_loops: "; measure(split_loops);
}
