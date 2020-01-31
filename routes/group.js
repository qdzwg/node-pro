
exports.mainRouter = function (router, common) {
    console.log('group');
    // 团购商品详情页
    router.get('/group/detail', function (req, res, next) {
        res.render('group/productDetail', {title: '团购'})
    });
    // 团购订单详情
    router.get('/group/orderDetail', function (req, res, next) {
        res.render('group/orderDetail', {title: '团购'})
    });
    // 团购订单列表
    router.get('/group/orderList', function (req, res, next) {
        res.render('group/orderList', {title: '团购'})
    });
    // 下单确认
    router.get('/group/toOrder', function (req, res, next) {
        res.render('group/toOrder', {title: '确认下单'})
    });
    // 订单支付
    router.get('/group/orderPay', function (req, res, next) {
        res.render('group/orderPay', {title: '订单支付'})
    });
    // 订单支付
    router.get('/group/payResult', function (req, res, next) {
        res.render('group/payResult', {title: '支付结果'})
    });
};