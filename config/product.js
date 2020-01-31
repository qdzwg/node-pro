module.exports = {
  env: 'production', //环境名称
  port: 4006, //服务端口号
  version: 'v1.0.0116',
  baseURL: '//www.lotsmall.cn',
  qyyxBaseUrl: '//qyyx.zhiyoubao.com',
  redis: {
    // host: "192.168.200.189",
    // password: 'sendinfo',
    host: "redis.xxsc.com",
    password: '2018hxJZzO4tcJilHX1h',
    port: 6379,
    ttl: 8 * 60 * 60 // 过期时间
  }
}
