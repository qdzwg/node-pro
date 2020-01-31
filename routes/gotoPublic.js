const commonApi = require("./common/common");

exports.mainRouter = function (router, common) {
    //判断公共服务是否过期
    router.get('/gotoPublic', async (req, res, next) => {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'guide'
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //跳转中控公共服务验证
    router.get('/realgotoPublic', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'gotoPublic'],
                parameter: {
                    merchantId: req.query.merchantId
                }
            }],
            req: req,
            res: res,
            isAjax: true
        })
    });

    //判断公园年卡是否过期
    router.get('/gotoyearcard', async (req, res, next) => {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'gynk'
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    router.get('/gototheater', async (req, res, next) => {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'theater'
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //判断公园年卡是否过期
    router.get('/gototheater', async (req, res, next) => {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        common.commonRequest({
            url:[{
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'theater'
                }
            }],
            req: req,
            res: res,
            isAjax:true
        });        
    });
};

