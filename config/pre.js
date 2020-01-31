module.exports = {
  env: 'pre', //环境名称
  port: 4006, //服务端口号
  version: 'v1.0.0116',
  baseURL: '//prewww.lotsmall.cn',
  qyyxBaseUrl: '//qyyx.zhiyoubao.com',
  redis: {
    host: "prexjredis.sendinfocs.com",
    password: '20190618VlWFFbfLiZ4UhEHb',
    // host: "redis.xxsc.com",
    // password: '2018hxJZzO4tcJilHX1h',
    port: 6379,
    ttl: 8 * 60 * 60 // 过期时间
  }
}
