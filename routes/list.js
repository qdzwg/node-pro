const Merchant = require('../controller/merchant');

exports.mainRouter = function (router, common) {
    // 列表页
    router.get('/list/:module',Merchant.list);
    // 下拉加载
    router.post('/list/:module', Merchant.pageList);
    // 评论列表
    router.get('/commentList/:module/:id', Merchant.commentList)
};