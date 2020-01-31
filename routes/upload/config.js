var path = require('path');
module.exports = {
    root: path.resolve(__dirname, '../'), //根目录
    //七牛云 配置
    serverUrl:'http://qnstatic.zhiyoubao.com/',
    qiniu_config:{
        //需要填写你的 Access Key 和 Secret Key
        accessKey:'MfnIyeYQ0LFiezRBGVMVzmM-vS4xVyl11861rzgS',
        secretKey:'GGNFMfMvGWTSyXASp6l9H7IkNgI-8fTHkr8fFSQK',
        bucket: 'zyb-statics',
        origin: ''
    }
}