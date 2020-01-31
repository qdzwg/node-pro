const Csearch = require('../controller/csearch');

exports.mainRouter = function (router, common) {
    // 列表页
    router.get('/csearch',Csearch.list);
    // 下拉加载
    router.post('/csearch', Csearch.pageList);

};