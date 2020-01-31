module.exports = {
  env: 'development', //环境名称
  port: 8008,
  version: 'v1.0.0116', //服务端口号
  baseURL: '//testwww.lotsmall.cn',
  // baseURL: '//192.168.66.120:8080',
  qyyxBaseUrl: '//qyyxcs.sendinfo.com.cn',
  redis: {
    host: "192.168.200.189",
    password: 'sendinfo',
    port: 6379,
    ttl: 8 * 60 * 60 // 过期时间
  }
}
