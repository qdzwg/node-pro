const async = require('async'),
    needle = require('needle');
const USERTYPE = 'C'; //用户类型c端
const commonApi = require("./common/common");
exports.mainRouter = function (router, common) {
    //公园年卡详情
    router.get('/detail/yearcard/:id', function (req, res, next) {
        let merchantInfoId = req.query.m_id;
        common.commonRequest({
            url: [{
                urlArr: ["yearcard", "detail", "main"],
                parameter: {
                    id: req.params.id,
                    merchantInfoId: merchantInfoId
                },
            }],
            req: req,
            res: res,
            title: '年卡详情',
            page: 'yearcard/detail',
            callBack: function (results, reObj) {
                reObj.module = 'yearcard';
                req.session.useIntro = results[0].data.useContent;
                req.session.cardName = results[0].data.cardName;
            }
        });
    });

    //交易记录列表
    router.get('/yearcard/record/:cardId', function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId, cardId = req.params.cardId,
            params = {
                title: '交易记录',
                cardId: cardId
            };
        if (!req.session.member) {
            res.redirect('/login?m_id=' + merchantInfoId);
            return;
        } else {
            commonApi.renderPage(req, res, 'yearcard/record', params)
        }
    });

    //交易记录列表数据获取
    router.post('/yearcard/record', function (req, res, next) {
        let urlArr = ["member", "yearcard", "selectOrderList"], method = 'GET';
        let merchantInfoId = req.query.m_id;
        req.body.merchantInfoId = merchantInfoId;
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

    //交易详情
    router.get('/yearcard/recordd/:payOrderNo', function (req, res, next) {
        let payOrderNo = req.params.payOrderNo,
            merchantInfoId = req.query.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'yearcard', 'selectOrderDetil'],
                parameter: {
                    payOrderNo: payOrderNo,
                    merchantInfoId: merchantInfoId
                }
            }],
            req: req,
            res: res,
            page: 'yearcard/recordd',
            title: '交易详情',
            callBack: function (results, reObj) {

            }
        });
    });

    //使用说明
    router.get('/yearcard/intro', async function (req, res, next) {
        let params = {
            title: '使用说明'
        };
        commonApi.renderPage(req, res, 'yearcard/intro', params)
    });

    //年卡充值
    router.get('/yearcard/recharge/:id', function (req, res, next) {
        let id = req.params.id, merchantInfoId = req.query.merchantInfoId;
        var urlArr = [{
            urlArr: ['member', 'info'],
            parameter: {
                leaguerId: req.session.member.id
            }
        }, {
            urlArr: ["yearcard", "detail", "main"],
            parameter: {
                id: id,
                merchantInfoId: merchantInfoId
            },
        }, {
            urlArr: ['main', 'getSysParamByKey'],
            parameter: {
                key: 'cardMediumType'
            }
        }];
        common.commonRequest({
            url: urlArr,
            req: req,
            res: res,
            page: 'yearcard/recharge',
            title: '年卡充值',
            callBack: function (results, reObj, res, handTag) {
                let cardTypeList = results[1].data.cardTypeList,
                    cardTypeMessage = results[2].message,
                    cardTypeTotal = cardTypeMessage.split(','),
                    finalType = [];
                if (cardTypeList) {
                    for (let j = 0; j < cardTypeList.length; j++) {
                        for (let i = 0; i < cardTypeTotal.length; i++) {
                            if (cardTypeList[j] == cardTypeTotal[i].split(':')[0]) {
                                let obj = {
                                    type: cardTypeTotal[i].split(':')[0],
                                    name: cardTypeTotal[i].split(':')[1]
                                };
                                finalType.push(obj);
                            }
                        }
                    }
                }
                reObj.finalType = finalType;
            }
        });
    });

    //下单获取订单号和支付金额
    router.post('/yearcard/recharg', async function (req, res, next) {
        try {
            let yearCard = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                method: 'POST',
                url: ['yearcard', 'order', 'main'],
                data: req.body
            });
            console.log(yearCard)
            if (yearCard && yearCard.status === 200) {
                req.session.payOrderNo = yearCard.data.payOrderNo;
                req.session.paySum = yearCard.data.paySum;
            } else if (yearCard && yearCard.status == '400') {
                req.session.curUrl = req.originalUrl;
                res.redirect('/login?m_id=' + merchantInfoId);
                return false;
            } 
            yearCard = typeof yearCard === 'string' ? JSON.parse(yearCard) : yearCard;
            res.send(yearCard);
        } catch (error) {
            console.log(error)
            res.json({
                status:402,
                message:'提交数据异常'
            })
        }

        // let url = "https://testwww.lotsmall.cn/yearcard/api/saveOrder";            
        // needle.post(rUrl, body, option, function (err, resp) {
        //     console.log(resp.body)
        //     if (!!resp.body && resp.body.status == '200') {
        //         req.session.payOrderNo = resp.body.data.payOrderNo;
        //         req.session.paySum = resp.body.data.paySum;
        //     } else if (!!resp.body && resp.body.status == '400') {
        //         req.session.curUrl = req.originalUrl;
        //         res.redirect('/login?m_id=' + merchantInfoId);
        //         return false;
        //     }
        //     resp.body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        //     res.send(resp.body);
        // });
    });

    //去支付（充值）
    router.get('/yearcard/recharges', async (req, res, next) => {
        let orderNo = req.query.payOrderNo ? req.query.payOrderNo : req.session.payOrderNo,
            paySum = req.query.paySum ? req.query.paySum : req.session.paySum,
            merchantInfoId = req.session.merchantInfoId || req.query.m_id,
            params = {},
            data = {},
            getPayType = {},
            payType = '',
            page = "",
            businessType = 'WAP';

        let isWxAli = await commonApi.isWxAli(req);

        if (isWxAli.isWx) {
            businessType = 'WEIXIN';
        }
        else if (isWxAli.isAliPay) {
            businessType = 'ALI';
        }

        try {
            //  C端类型(wap网页端: WAP, 微信生活号: WEIXIN, 支付宝生活号: ALI)
            getPayType = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getMerchantPayType'],
                data: {
                    merchantInfoId: merchantInfoId,
                    businessType,
                }
            });

            payType = JSON.parse(getPayType.message)[0];

        } catch (error) {
            throw new Error(error);
        }

        if (businessType === 'WEIXIN') {
            //next();
            params = {
                openId: req.session.member.openId,
                operateId: req.session.member.id,
                orderInfo: req.session.cardName
            };
            data = {
                payOrderNo: orderNo,
                userType: USERTYPE,
                accountId: merchantInfoId,
                payType: payType, //微信支付类型
                paySum: paySum,
                extendParamJson: JSON.stringify(params)
            };
            page = "pay/wxpay";
        } else {
            params = {
                redirectUrl: "//" + req.headers.host + "/payPlat/result",
                orderInfo: req.session.cardName
            };
            data = {
                payOrderNo: orderNo,
                userType: USERTYPE,
                accountId: merchantInfoId,
                //accountId:0,
                payType: payType, //wap支付宝支付
                paySum: paySum,
                operateId: req.session.member.id,
                extendParamJson: JSON.stringify(params)
            };
            page = "pay/payAlipay";
        }
        let alipayInfo = {};
        //判断是否是yearcard支付
        req.session.ycPay = true;
        try {
            alipayInfo = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'pay', 'goPay'],
                data: data
            });
        } catch (error) {
            throw new Error(`gopay 请求异常::${error}`)
        }
        if (!!alipayInfo.payLink) {
            console.log(page, alipayInfo)
            if (payType === '12') {         // 工行聚合支付特别处理
                let itemInfo = alipayInfo.data;
                itemInfo = typeof itemInfo === 'string'
                    ? JSON.parse(itemInfo)
                    : {};
                commonApi.renderPage(req, res, 'wxpay', { item: itemInfo, orderNo })
            }
            else {
                commonApi.renderPage(req, res, page, alipayInfo)
            }
        } else {
            res.redirect('/payPlat/result?out_trade_no=' + alipayInfo.data);
        }
    });

    router.get('/yearcard/refund/:orderNo', async (req, res, next) => {
        commonApi.renderPage(req, res, 'yearcard/refund', { title: '年卡退款', orderNo: req.params.orderNo, m_id: req.query.m_id, payOrderNo: req.query.payOrderNo })
    }).post('/yearcard/refund/:orderNo', async (req, res, next) => {
        let result = {}
        try {
            result = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                method: "post",
                url: ['yearcard', 'order', 'refund'],
                data: {
                    merchantInfoId: req.body.merchantInfoId,
                    orderNo: req.params.orderNo,
                    reason: req.body.reason
                }
            });
        } catch (error) {
            throw new Error(`gopay 请求异常::${error}`)
        }
        res.send(result);
    });
};

