const commonApi = require('./common/common')
exports.mainRouter = function (router, common) {
    // 购物车列表 
    router.get('/cart', async function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let skuInfo = {};
        let cartInfo = {
            data: {
                cartDto: {},
                cartItemDtos: []
            }
        };
        let skuCodes = '';
        try {
            cartInfo = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'cart', 'list'],
                data: {
                    merchantInfoId: req.session.merchantInfoId,
                    userID: req.session.member.id,
                    merchantInfoName: "1"
                }
            });
        } catch (error) {
            console.log(error);
        }
        let bottomData = {};
        try{
            bottomData = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getUsePage'],
                data: {
                    merchantInfoId: merchantInfoId,
                    pageType: 'navigationPage',
                    useRange: 'wap'
                }
            });
        }catch(error){
            console.log(error);
        };
        let ifshowFoot = false;
        let footerData = {};
        if(bottomData&&bottomData.data){
            footerData = JSON.parse(bottomData.data.content);
            if(footerData && footerData.range){            
                footerData.range.forEach(function(item, index){
                    if(item=='shopcartpage'){
                        ifshowFoot = true
                    }
                });
            } 
        }             
        if (cartInfo.data.cartItemDtos && cartInfo.data.cartItemDtos.length > 0){
            cartInfo.data.cartItemDtos.map((item) => {
                skuCodes += item.modelCode + ',';
            })
            try {
                skuInfo = await commonApi.apiRequest({
                    ctx: {
                        req,
                        res
                    },
                    url: ['member', 'order', 'getMerchantMdseDetailByCode'],
                    data: {
                        modelCodes: skuCodes,
                        merchantInfoId: req.session.merchantInfoId
                    }
                });
            } catch (error) {
                console.log(error)
            }
            commonApi.renderPage(req, res, 'cart', {
                title: '购物车',
                module: 'cart',
                data: [
                    cartInfo,
                    skuInfo                    
                ],
                footerData,
                module:'cart',
                ifshowFoot: ifshowFoot
            })
        }else{
            commonApi.renderPage(req, res, 'cart', {
                title: '购物车',
                module: 'cart',
                data: [
                    cartInfo                    
                ],
                footerData,
                module:'cart',
                ifshowFoot: ifshowFoot
            })
        }
    });

    // 删除购物车
    router.get('/cart/itemdel/:ids', async function (req, res, next) {
        const result = await commonApi.apiRequest({
            ctx: {
                req,
                res
            },
            url: ['main', 'cart', 'delete'],
            data: {
                mdseDetailIds: req.params.ids,
                userID: req.session.member.id,
                merchantInfoId: req.session.merchantInfoId
            }
        });

        res.json(result);
    });
    
    //清空购物车
    router.get('/cart/removeCart',async function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        const result = await commonApi.apiRequest({
            ctx: {
                req,
                res
            },
            url: ['main', 'cart', 'removeCart'],
            data: {
                userID: req.session.member.id,
                merchantInfoId: merchantInfoId
            }
        });
        res.json([result]);
    });

    // 购物车支付
    router.get('/cart/pay/:ids',async function (req, res, next) {
        const result = await commonApi.apiRequest({
            ctx: {
                req,
                res
            },
            url: ['cart', 'list', 'order'],
            data: {
                ids: req.params.ids,
                loginId: req.session.loginId
            }
        });
        res.json([result]);
    });
};