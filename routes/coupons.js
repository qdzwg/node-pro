const commonApi = require("./common/common");
exports.mainRouter = function (router, common) {
    //领取优惠券
    router.get('/coupon/get', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ["main", "marketing", "getCoupon"],
                parameter: {
                    couponCode: req.query.couponCode,
                    userId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    //优惠券详情
    router.get('/coupon/detail', function (req, res, next) {
        let merchantInfoId = req.query.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ["main", "marketing", "couponsList"],
                parameter: {
                    couponCode: req.query.couponCode,
                    currPage: 1,
                    pageSize: 6,
                    merchantInfoId
                },
            }],
            req: req,
            res: res,
            title: '领取优惠券',
            page: 'coupons/couponDetail'
        });
    });

    //领取成功
    router.get('/coupon/get/result',function (req,res,next) {
        let merchantInfoId = req.query.m_id;
        common.commonRequest({
            url: [{
                urlArr: ["main", "marketing", "couponsList"],
                parameter: {
                    couponCode: req.query.couponCode,
                    currPage: 1,
                    pageSize:6,
                    merchantInfoId
                },
                method: "GET"
            }],
            req: req,
            res: res,
            title: '领取成功',
            page: 'coupons/couponSuccess'
        });
    });

    //使用优惠券
    router.get('/coupon/useAble', function (req, res, next){
        req.query.userId = req.session.member.id || '';
        common.commonRequest({
            url: [{
                urlArr: ["main", "marketing", "useCoupons"],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax:true
        });
    });

    //优惠券列表页
    router.get('/coupons/:from',async function (req, res, next) {
        let from = req.params.from;
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let templateData = {};
        let params = {
            from: from,
            title: '优惠券列表',
            merchantInfoId,
        };
        try {
            templateData = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['main', 'merchant', 'getMerchantTemplateCustom'],
                data: {
                    merchantInfoId: merchantInfoId
                },
                ignoreError:true
            });
        } catch (error) {
            throw new Error('模板信息获取错误');
        }
        if (templateData.data) {
            req.session.templateVersion = templateData.data.version; //版本
            if (templateData.data.version === 'old') {
                req.session.templateCode = templateData.data.templateVO.code;
                req.session.footerDatas = null;
            } else {
                let template = JSON.parse(templateData.data.templateVO.template);
                let footerDatas = {};
                let hasFooter = false;
                template.forEach((item, index) => {
                    if (item.type.indexOf('Footer__') === 0) {
                        footerDatas = item;
                        hasFooter = true;
                        req.session.footerDatas = footerDatas;
                        req.session.templateCode = null;
                    }
                })
                if (!hasFooter) {
                    req.session.footerDatas = null;
                    req.session.templateCode = 'MTI20180316172401';
                }
            }
        }

        if (from === 'member') params.title = '我的优惠券';

        if (from === 'order') { //如果是从订单跳转过来的
            params.title = '可使用优惠券';
            params.productCode = req.query.productCode || '';
            params.productType = req.query.productType || '';
        }
        params.templateCode=req.session.templateCode;
        params.marketDisAccount = req.session.marketDisAccount
        params.merchantInfoId = req.session.merchantInfoId;
        commonApi.renderPage(req, res, 'coupons', params)
    });

    //获取优惠券列表
    router.post('/coupons/:from', function (req, res, next) {
        let urlArr = [], method = 'GET';
        let merchantInfoId = req.query.m_id;
        req.body.merchantInfoId = merchantInfoId;
        switch (req.params.from) {
            case 'list':
                urlArr = ["main", "marketing", "couponsList"];
                break;
            case 'member':
                urlArr = ["main", "marketing", "myCoupons"];
                req.body.userId = req.session.member.id;
                break;
            default:
                break;
        }
        common.commonRequest({
            url: [{
                urlArr: urlArr,
                parameter: req.body,
                method: method
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });

};

