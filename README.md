# 编译异常

由于技术迭代，本项目使用的技术落后最新版本太多

## nodejs

报错：digital envelope routines
出现这个错误是因为 node.js V17 版本中最近发布的 OpenSSL3.0, 而 OpenSSL3.0 对允许算法和密钥大小增加了严格的限制，可能会对生态系统造成一些影响.

解决：给 NODE_OPTIONS 加参数
export NODE_OPTIONS=--openssl-legacy-provider
