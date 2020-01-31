const Member = require('../controller/member');
const commonApi = require("./common/common");
exports.mainRouter = function (router, common) {

    // 个人中心
    router.get('/member',async function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId || '';
        if (!req.session.member.id) {
            req.session.curUrl = req.originalUrl;
            res.redirect('/login?m_id=' + merchantInfoId);
            return false;
        }

        let reqArray = [{
                urlArr: ['main', 'findPicInfo'],
                parameter: {
                    adType: 'person_center_bg'
                },
                ignoreError: true
            }, {
                urlArr: ['main', 'merchant', 'getCorpCode'], //取企业码
                parameter: {
                    merchantInfoId: merchantInfoId
                }
            }, {
                urlArr: ['main', 'merchant', 'getMerchantTemplateCustom'],
                parameter: {
                    merchantInfoId: merchantInfoId
                }
            }, {
                urlArr: ['member', 'invoices', 'enabled'],
                parameter: {
                    merchantInfoId: merchantInfoId
                },
                ignoreError: true
            }, {
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'gynk'
                }
            }, {
                urlArr: ['main', 'merchant', 'getUsePage'],
                parameter: {
                    merchantInfoId,
                    pageType: 'centerPage',
                    useRange: 'wap'
                }
            }, {
                urlArr: ['main', 'merchant', 'getUsePage'],
                parameter: {
                    merchantInfoId,
                    pageType: 'navigationPage',
                    useRange: 'wap'
                }
            },
            {
                urlArr: ["main", "merchant", "showQyBindTab"],
                parameter: {
                merchantInfoId,
                leaguerInfoId:req.session.member.id
                }
            }];

        let member = await commonApi.apiRequest({
            ctx: {
                req,
                res
            },
            url: ['member', 'info'],
            data: {
                merchantInfoId,
                leaguerId: req.session.member.id
            }
        })

        if (member && member.status === 200 && member.data.leaguserServiceAvailable) {
            reqArray.push({
                urlArr: ["member", "pubs", "help"],
                parameter: {
                merchantInfoId
                },
                method:"POST",
                ignoreError:true
            })
        }

        common.commonRequest({
            url: [{
                urlArr: ['main', 'findPicInfo'],
                parameter: {
                    adType: 'person_center_bg'
                },
                ignoreError: true
            }, {
                urlArr: ['main', 'merchant', 'getCorpCode'], //取企业码
                parameter: {
                    merchantInfoId: merchantInfoId
                }
            }, {
                urlArr: ['main', 'merchant', 'getMerchantTemplateCustom'],
                parameter: {
                    merchantInfoId: merchantInfoId
                }
            }, {
                urlArr: ['member', 'invoices', 'enabled'],
                parameter: {
                    merchantInfoId: merchantInfoId
                },
                ignoreError: true
            }, {
                urlArr: ['member', 'invoices', 'selectServiceUse'],
                parameter: {
                    merchantInfoId: merchantInfoId,
                    serviceType: 'gynk'
                }
            }, {
                urlArr: ['main', 'merchant', 'getUsePage'],
                parameter: {
                    merchantInfoId,
                    pageType: 'centerPage',
                    useRange: 'wap'
                }
            }, {
                urlArr: ['main', 'merchant', 'getUsePage'],
                parameter: {
                    merchantInfoId,
                    pageType: 'navigationPage',
                    useRange: 'wap'
                }
            },
            {
                urlArr: ["main", "merchant", "showQyBindTab"],
                parameter: {
                  merchantInfoId,
                  leaguerInfoId:req.session.member.id
                }
            },
            {
                urlArr: ["member", "pubs", "help"],
                parameter: {
                  merchantInfoId
                },
                method:"POST",
                ignoreError:true
            }],
            req: req,
            res: res,
            page: 'member',
            title: '个人中心',
            callBack: function (results, reObj, res, handTag) {
                // 个人中心数据
                results.unshift(member)

                if (results[2].data) {
                    req.session.marketDisAccount = results[2].data.marketDisAccount;
                } else {
                    req.session.marketDisAccount = '';
                }
                if (results[3].data) {
                    let templateData = results[3];
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
                                req.session.footerDatas = footerDatas;
                                req.session.templateCode = null;
                                hasFooter = true;
                            }
                        })
                        if (!hasFooter) {
                            req.session.footerDatas = null;
                            req.session.templateCode = 'MTI20180316172401';
                        }
                    }
                }
                if (results[6].status == 200 && results[6].data) {
                    let customMemberDatas = JSON.parse(results[6].data.content);
                    reObj.customMemberData = customMemberDatas;
                    if (customMemberDatas.pageSetData && customMemberDatas.pageSetData.title) {
                        reObj.title = customMemberDatas.pageSetData.title;
                    }
                }
                if (results[7].status == 200 && results[7].data) {
                    let footerData = JSON.parse(results[7].data.content);
                    let ifshowFoot = false;
                    if (footerData && footerData.range) {
                        footerData.range.forEach(function (item, index) {
                            if (item == 'personalpage') {
                                ifshowFoot = true
                            }
                        })
                    }
                    reObj.footerData = JSON.parse(results[7].data.content);
                    reObj.module = 'member';
                    reObj.ifshowFoot = ifshowFoot;
                }
            }
        });
    });

    // 用户中心
    router.get('/member/user', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'info'],
                parameter: {
                    leaguerId: req.session.member.id
                }
            }],
            req: req,
            res: res,
            page: 'member/user/index',
            title: '用户中心',
            callBack: function (results, reObj, res, handTag) {
                let userInfo = results[0].data;
                for (key in userInfo) {
                    req.session.member[key] = userInfo[key];
                }
            }
        });
    });

    // 修改用户信息
    router.get('/member/user/:modify', function (req, res, next) {
        commonApi.renderPage(req, res, 'member/user/modify', {
            title: '修改信息',
            modify: req.params.modify,
            data: req.session.member
        })
    });

    //打开修改密码页面
    router.get('/member/changePassword', function (req, res, next) {
        commonApi.renderPage(req, res, 'member/user/changePassword', {})
    });

    //修改用户密码
    router.get('/member/leaguerFixPwd', function (req, res, next) {

        req.query.loginName = req.session.member.loginName;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'leaguerFixPwd'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true
        });
    });

    // 提交用户修改
    router.post('/member/modify', function (req, res, next) {
        console.log(req.query);
        req.query.loginId = req.session.member.id;
        common.commonRequest({
            url: [{
                urlArr: ['member', 'modify'],
                parameter: req.query
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results) {
                for (key in req.query) {
                    req.session.member[key] = req.query[key];
                }
            }
        });
    });

    //我要成为推广员
    router.get('/member/salesPromotion', Member.salesPromotion);
    /*----- 订单列表在list.js(方便统一做翻页) -----*/
    router.get('/member/pmsOrder/:orderInfoId', Member.pmsOrderDetal);
    // 订单详情
    router.get('/member/order/:orderInfoId', Member.orderDetal);

    router.get('/member/myTicket', function (req, res, next) {
        let orderId = req.query.id;
        let from = req.query.from || '';
        let urlArr = '', paramsName = '';
        if (from === 'pay') {
            urlArr = 'orderQueryByOrderId';
            paramsName = 'orderId';
        } else {
            urlArr = 'detail';
            paramsName = 'orderInfoId';
        }
        if(req.query.orderType == 'cloud_repast'){
            urlArr = 'repastDetail';
            paramsName = 'orderInfoId';
        }
        var url = [{
            urlArr: ['member', 'order', [urlArr]],
            parameter: {
                [paramsName]: orderId,
            }
        }];
        var page = "member/order/myTicket";
        common.commonRequest({
            url: url,
            req: req,
            res: res,
            page: page,
            title: '票型二维码',
            callBack: function (results, reqs, resp, handTag) {
                // console.log(results)
                reqs.merchantInfoId = req.session.merchantInfoId;
            }
        });
    });

    // 剧院一票一码
    router.get('/member/myTheater',function(req, res, next){
        let orderNo = req.query.orderNo;
        let orderId = req.query.id;
        let from = req.query.from || '';
        let page = "member/order/myTheater";
        let url =  [
            {
                urlArr: ['member', 'order', 'detail'],
                parameter: {
                    "orderInfoId": orderId,
                }
            },
            {
                urlArr: ['member', 'order', 'getCheckNoListByOrderNo'],
                parameter: {
                    "orderNo": orderNo,
                    "orderType":"theater_ticket"
                }
            }]
        common.commonRequest({
            url: url,
            req: req,
            res: res,
            page: page,
            title: '票型二维码',
            callBack: function (results, reqs, resp, handTag) {
                // console.log(results)
                reqs.merchantInfoId = req.session.merchantInfoId;
            }
        });
    })

    // 订单评论页
    router.get('/member/comment/:module', function (req, res, next) {
        commonApi.renderPage(req, res, 'member/order/comment', {
            title: '订单评论',
            module: req.params.module,
            orderNo: req.query.orderNo,
            orderId:req.query.orderId,
            modelCode: req.query.modelCode,
            productCode:req.query.productCode,
            payOrderNo: req.query.payOrderNo
        });
    });

    // 提交评论
    router.post('/member/comment', function (req, res, next) {
        req.body.userInfoId = req.session.member.id;
        req.body.userName = req.session.member.realName ? req.session.member.realName : req.session.member.loginName;
        req.body.merchantInfoId = req.session.merchantInfoId;
        common.commonRequest({
            url: [{
                urlArr: ['main', 'comment', 'add'],
                parameter: req.body
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });

    /**
     * 更新评论
     */
    router.post('/member/comment/updata',async function (req,res,next) {
        if (!req.body.merchantInfoId) req.body.merchantInfoId = req.session.merchantInfoId;
        req.body.userInfoId = req.session.member.id;

        let orderInfo = null;
        try {
            orderInfo = await commonApi.apiRequest({
                ctx: { req, res, next },
                method: 'POST',
                url: ['main', 'comment', 'upData'],
                data: req.body,
                // ignoreError:true
            });

        } catch (error) {
            console.log('提交评论更新接口异常');
            res.json({
                state: 402,
                message: '提交评论更新接口异常'
            })
        }

        res.json(orderInfo);
    })


    // 退款页面
    router.get('/member/refund/:module', async function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let orderInfo = {};
        let module = req.params.module;
        let urlParams = typeof req.query.refParams !== 'undefined'
            ? JSON.parse(req.query.refParams)
            : {};

        let pageObj = {
            title: '订单退款',
            module: req.params.module,
            orderDetailId: req.query.orderDetailId,
            maxNum: req.query.maxNum,
            orderId: req.query.orderId,
            merchantInfoId: merchantInfoId,
            urlParams
        };

        let normalResions = []; // 常用退款原因
        switch (module) {
            case 'mdse':
                normalResions = ['不想要了', '未按时发货', '收到商品破损', '商品与描述不符'];
                break;
            case 'repast':
                normalResions = ['不想要了', '够买错了', '店家原因', '没时间使用'];
                break;
            case 'ticket':
                normalResions = ['临时不想去了', '天气不合适', '选错日期', '其他原因'];
                break;  
            default:
                normalResions = ['临时不想去了', '天气不合适', '选错日期', '其他原因'];
                break;
        }
        pageObj.normalResions = normalResions;
        if (req.query.fh) {
            pageObj.fh = req.query.fh;
        }
        if (module === 'pmsHotel') {
            orderInfo = await commonApi.apiRequest({
                ctx: { req, res, next },
                url: ['member', 'order','pmsDetail'],
                data: {
                    payOrderNo: req.query.orderId,
                    merchantInfoId: merchantInfoId
                },
                // ignoreError:true
            });
            if (orderInfo.status === 200) {
                pageObj.payOrderNo = req.query.orderId;
                pageObj.orderId = orderInfo.data.orderId;
                pageObj.orderDetailId = orderInfo.data.orderDetailId;
            }
        } else {
        if(module==='cloud_repast'){
            orderInfo = await commonApi.apiRequest({
                ctx: { req, res, next },
                url: ['member', 'order', 'repastDetail'],
                data: {
                    orderInfoId: req.query.orderId,
                    merchantInfoId: req.session.merchantInfoId
                },
                // ignoreError:true
            });
        }else{
            orderInfo = await commonApi.apiRequest({
                ctx: { req, res, next },
                url: ['member', 'order', 'detail'],
                data: {
                    orderInfoId: req.query.orderId,
                    merchantInfoId:  merchantInfoId 
                },
                // ignoreError:true
            });
        }    
    }
        commonApi.renderPage(req, res, 'member/order/refund', Object.assign(pageObj, orderInfo));
    });

    // 提交退款
    router.post('/member/refund/:module', function (req, res, next) {
        let module = req.params.module;
        req.query.leaguerId = req.session.member.id;
        req.query.refundType = req.query.type || 0;
        if (module === 'route') {
            let routeParams = [];
            req.query.refundAmount = 0;
            if (typeof req.query.adultAmount !== 'undefined' && Number(req.query.adultAmount)) {
                routeParams.push({
                    'orderDetailId': req.query.adultId,
                    'refundAmount': req.query.adultAmount
                })
                req.query.refundAmount += Number(req.query.adultAmount)
            }
            if (typeof req.query.childAmount !== 'undefined' && Number(req.query.childAmount)) {
                routeParams.push({
                    'orderDetailId': req.query.childId,
                    'refundAmount': req.query.childAmount
                })
                req.query.refundAmount += Number(req.query.childAmount)
            }

            req.query.routeParams = JSON.stringify(routeParams);
        }
        if (module === 'theater_ticket') {
            let theaterSeats = JSON.parse(req.query.refundSeats);
            let ticketArray = [];
            // for (let i = 0, flag = false, lens = theaterSeats.length; i < lens; i++) {
            //     flag = false;
            //     if (ticketArray.length) {
            //         for (let j = 0; j < ticketArray.length; j++) {
            //             if (theaterSeats[i].orderDetailId === ticketArray[j].ttId) {
            //                 ticketArray[j].amount++;
            //                 flag = true;
            //                 break;
            //             }
            //         }
            //     }
            //     if (!flag) {
            //         ticketArray.push({
            //             ttId: theaterSeats[i].orderDetailId,
            //             amount: 1
            //         })
            //     }
            // }
            ticketArray.push({
                ttId: req.query.orderDetailId,
                amount: theaterSeats.length
            })
            delete req.query.refundSeats;
            req.query.ttList = JSON.stringify(ticketArray);
            req.query.theatreSeats = JSON.stringify(theaterSeats);
            req.query.refundAmount = theaterSeats.length;
            req.query.refundType = 0;
        }
        if(module == 'family'){            
            if(req.query && req.query.tKtype == 1){                
                req.query.familyRefundType = 0;
                // delete req.query.partRefundAmount;
            }else{
                req.query.familyRefundType = 1;
                if(req.query.comboId&&req.query.partRefundAmount){
                    var childList = [];
                                       
                    if(typeof(req.query.comboId)==='string'){
                        var obj = {
                            orderDetailId: req.query.comboId,                            
                            amount: req.query.partRefundAmount
                        }
                        childList.push(obj);
                    }else{
                        for(var i = 0; i < req.query.comboId.length; i++){
                            var obj = {
                                orderDetailId: req.query.comboId[i],                            
                                amount: req.query.partRefundAmount[i]
                            }
                            childList.push(obj);
                        }                        
                    }                    
                    req.query.childList = JSON.stringify(childList);
                    // delete req.query.comboId                   
                    // delete req.query.partRefundAmount
                    delete req.query.refundAmount
                    delete req.query.orderDetailId
                }                
            }
            delete req.query.comboId                   
            delete req.query.partRefundAmount
            delete req.query.refundType;
            delete req.query.tKtype;        
        }
        
        let urlArr = ['member', 'order', 'refund'];
        if (module === 'pmsHotel') urlArr = ['member', 'order', 'pmsRefund'];

        
        if(module === 'cloud_repast'){
            urlArr = ['member', 'order', 'repastRefund']
        }
        common.commonRequest({ 
            url: [{
                urlArr: urlArr,
                parameter: req.query
            }],
            isAjax: true,
            req: req,
            res: res
        });
    });

    //取消订单
    router.post('/member/cancle/:orderNo', function (req, res, next) {
        let uArr = [];
        if(req.query&&req.query.ordertype=='cloud_repast'){
            uArr = ['member', 'order', 'repastCancle']
        }else{
            uArr = ['member', 'order', 'cancel']
        }
        common.commonRequest({
            url: [{
                urlArr: uArr,
                parameter: {
                    payOrderNo: req.params.orderNo,
                    leaguerId: req.session.member.id
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    //删除订单
    router.post('/member/remove/:orderNo', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'remove'],
                parameter: {
                    orderId: req.params.orderId
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    })

    //提醒发货
    router.get('/member/warnsendgoods/:orderNo', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'warnsendgoods'],
                parameter: {
                    merchantInfoId: req.session.merchantInfoId,
                    orderNo: req.params.orderNo
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    // 新用户专享
    router.get('/member/newPreferential', async function (req, res, next) {
        const userId = req.session.member.id;
        const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        const getNewUserCoupons = await commonApi.apiRequest({
            ctx: {
                req,
                res,
                next
            },
            url: ["main", "marketing", "listCouponTemplet4New"],
            data: {
                userId: userId,
                merchantInfoId,
                currPage: 1,
                pageSize: 100
            }
        });

        res.json(getNewUserCoupons);
    })

    // 领取新用户专享优惠券
    router.get('/member/getNewUserCoupons', async function (req, res, next) {
        const codes = req.query.codes;
        const getNewUserCoupons = await commonApi.apiRequest({
            ctx: {
                req,
                res,
                next
            },
            url: ["main", "marketing", "getCouponDetailVoOneKey"],
            data: {
                userId: req.session.member.id,
                couponCode: codes,
                merchantInfoId: req.session.merchantInfoId
            }
        });

        res.json(getNewUserCoupons);

    })

    //撤销申请
    router.get('/member/cancelRetreat/:orderNo', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'cancelRetreat'],
                parameter: {
                    merchantInfoId: req.session.merchantInfoId,
                    orderRefundNo: req.params.orderNo
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    //确认收货
    router.get('/member/receipt/:orderid', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['member', 'order', 'confirmGoods'],
                parameter: {
                    merchantInfoId: req.session.merchantInfoId,
                    orderinfoId: req.params.orderid
                }
            }],
            isAjax: true,
            req: req,
            res: res
        })
    });

    // 电子发票信息提交页
    router.get('/invoice/submitInfo/:payOrderNo', Member.submitInfo)

    router.get('/invoice/saveInoviceFrom', Member.saveInvoiceInfo)

    // 电子发票列表页
    router.get('/invoice/list', Member.invoiceList)

    // 动态加载列表
    router.post('/invoice/pageList', Member.invoicePageList)

    // 电子发票详情页
    router.get('/invoice/detail/:payOrderNo', Member.invoiceDetail)

    // 打开常用联系人列表
    router.get('/member/links/lists', Member.linksUserLists)

    // 打开常用联系人详情
    router.get('/member/links/detail', Member.linksUserInfoEduter)

    // 删除常用联系人
    router.get('/member/links/delete/:id', Member.linksUserInfoDel)

    // 保存常用联系人
    router.post('/member/links/linksUserInfoSave', Member.linksUserInfoSave)

    // 打开绑定推广员页面
    router.get('/member/bindPromoter', Member.goBindPromoter)

    // 绑定推广员
    router.post('/member/submitBindPomoterInfo', Member.submitBindPomoterInfo)
};
