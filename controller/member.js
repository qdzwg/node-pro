const commonApi = require("../routes/common/common");
const Config = require('../config/index');

const Member = {
    /**
     * 我要成为推广员
     */
    async salesPromotion(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let isQy = req.query.isQy;
        let flag = null; //1：微信，2：支付宝，3：手机号
        let is_wx_ali = {
            isWx: false,
            isAliPay: false
        };
        is_wx_ali = commonApi.isWxAli(req);

        //重定向
        // if (!req.session.member.id) {
        //     req.session.curUrl = req.originalUrl;
        //     res.redirect('/login?m_id=' + merchantInfoId);
        //     return false;
        // }

        //微信环境下授权登录
        if (is_wx_ali.isWx) {
            flag = '1';
        }
        //支付宝环境
        else if (is_wx_ali.isAliPay) {
            flag = '2';
        }
        //第三方浏览器账号登录
        else {
            flag = '3';
        }

        let _data = {
            flag,
            corpCode: req.query.corpCode || req.session.marketDisAccount, //req.session.merchantInfo.code
            openId: req.query.openId || req.session.member.id,
            ixmgUrl: '',
        }
        let getAccount = await commonApi.apiRequest({
            ctx: { req, res, next },
            noLocal: true,
            url: ['member', 'enterPromote', 'main'],
            data: _data
        })
        if (getAccount) {
            //2019年11月7日19:52:59 老旧代码，开发要求，去除
            // if (isQy !== 'T') {
            //     commonApi.apiRequest({
            //         ctx: { req, res, next },
            //         url: ['member', 'qyyxOper'],
            //         data: {
            //             merchantInfoId
            //         }
            //     })
            // }

            if (getAccount.success) {
                let _url = `${Config.qyyxBaseUrl}/wap/loginWapAuthor.htm?username=${getAccount.username}&password=${getAccount.password}&redirectUrl=${req.protocol}://${req.headers.host}?m_id=${merchantInfoId}`
                res.redirect(_url);
            } 
            else if (getAccount.message && getAccount.message.indexOf('openId') !== -1) {
                req.session.curUrl = req.originalUrl; //路由拦截,跳转前储存地址
                res.redirect('/login?m_id='+merchantInfoId);
            }
            else {
                commonApi.renderPage(req, res, 'error', {
                    title: '未加载成功',
                    message: getAccount.message
                });
            }

        }

    },
    // 订单详情
    async orderDetal(req, res, next) {
        let url = ['member', 'order', 'detail'];
        let page = "member/order/detail";
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId
        let params = {
            orderInfoId: req.params.orderInfoId,
            merchantInfoId: merchantInfoId
        }
        if (req.query.orderStatus) {
            url = ['member', 'order', 'getPayOrder'];
            page = "member/order/payDetail";
            params = {
                payOrderNo: req.params.orderInfoId,
                merchantInfoId: merchantInfoId
            }
        }
        if(req.query.orderType == 'cloud_repast'){
            url = ['member', 'order', 'repastDetail'];
            page = "member/order/repastDetail";
            params = {
                orderInfoId: req.params.orderInfoId,
                merchantInfoId: merchantInfoId
            }
        }
        let orderInfo = await commonApi.apiRequest({
            ctx: { req, res, next },
            url: url,
            data: params
        });

        // 获取卡券id
        let getCardInfo = null;
        if (orderInfo.status === 200 && orderInfo.data.orderDetail instanceof Array) {
            if (orderInfo.data.checkNo) {
                try {
                    getCardInfo = await commonApi.apiRequest({
                        ctx: {
                            req,
                            res
                        },
                        url: ['wxCardPack', 'getCardIdByCheckNo'],
                        data: {
                            checkNo: orderInfo.data.checkNo,
                            merchantInfoId: merchantInfoId
                        }
                    });

                } catch (error) {
                    getCardInfo = {
                        status: 402,
                        message: '数据加载异常'
                    };
                }
            }
        }

        try {
            let [getMarketDisAccount, getShowWholeMarket] = await commonApi.apiRequestAll(
                {
                    ctx: { req, res },
                    apiList: [
                        {
                            url: ["main", "merchant", "getCorpCode"],
                            data: {
                                merchantInfoId
                            }
                        },
                        {
                            url: ["main", "merchant", "showQyTab"],
                            data: {
                              merchantInfoId,
                              leaguerInfoId:req.session.member.id
                            }
                        }
                    ]
                }
            );

            if (getMarketDisAccount.status === 200 && getMarketDisAccount.data) {
                req.session.marketDisAccount = getMarketDisAccount.data.marketDisAccount;
            }
            if (getShowWholeMarket.status === 200, getShowWholeMarket.message) {
                req.session.showWholeMarket = getShowWholeMarket.message;
            }

        } catch (error) {
            console.error('登录获取企业码错误');
            return;
        }

        if (!req.query.orderStatus) {
            let iscomment = ''
            if(req.query.orderType !== 'cloud_repast'){
                iscomment = await commonApi.apiRequest({
                    ctx: {
                        req,
                        res,
                        next
                    },
                    url: ['main', 'comment', 'iscomment'],
                    data: {
                        goodsCode: orderInfo.data.modelCode,
                        orderNo: orderInfo.data.orderNo,
                        userInfoId: req.session.member.id,
                        merchantInfoId: merchantInfoId
                    }
                });
            }            

            let urlParams = {};
            if (orderInfo.data.orderType === 'mdse') {
                page = "member/order/goodsdetail"
            }
            else if (orderInfo.data.orderType === 'route') {
                page = "member/order/goodsdetail"
                orderInfo.data.orderDetail.map(item => {
                    urlParams[item.detailType] = { 'maxNum': item.leftAmount, 'id': item.id };
                })
            } 

            commonApi.renderPage(req, res, page, {
                title: "订单详情",
                module: orderInfo.data.orderType,
                data: [orderInfo, iscomment],
                originalUrl: 'http://' + req.headers.host + req.originalUrl,
                urlParams: JSON.stringify(urlParams),
                getCardInfo,
                isWeixn: commonApi.isWxAli(req).isWx,
                isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F',
                isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F'
            })
        } else {
            commonApi.renderPage(req, res, page, {
                title: "订单详情",
                data: [orderInfo],
                orderCloseTime: orderInfo.data.orderCloseTime,
                getCardInfo,
                isWeixn: commonApi.isWxAli(req).isWx,
                isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F',
                isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F'
            })
        }

    },
    async pmsOrderDetal(req, res, next){
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId

        let [orderInfo = {},pmsKeys = {}] = await commonApi.apiRequestAll(
            {
                ctx: { req, res },
                apiList: [
                  {
                    url: ['member', 'order','pmsDetail'],
                    data: {
                        payOrderNo: req.params.orderInfoId,
                        merchantInfoId: merchantInfoId
                    }
                  },
                  {
                    url: ["main", "merchant", "pmsKeys"],
                    data: {
                        merchantInfoId: merchantInfoId,
                      keys:"pmsHotelLevel,pmsHotelType,pmsHotelBedType"
                    }
                  }
                ]
            }
        )

        // 获取卡券id
        let getCardInfo = null;
        if (orderInfo.status === 200 && orderInfo.data.orderDetail instanceof Array) {
            if (orderInfo.data.checkNo) {
                try {
                    getCardInfo = await commonApi.apiRequest({
                        ctx: {
                            req,
                            res
                        },
                        url: ['wxCardPack', 'getCardIdByCheckNo'],
                        data: {
                            checkNo: orderInfo.data.checkNo,
                            merchantInfoId: merchantInfoId
                        }
                    });

                } catch (error) {
                    getCardInfo = {
                        status: 402,
                        message: '数据加载异常'
                    };
                }
            }  
        }

        let beginDate = '';
        let iscomment = {};
        let cancelRuleStr = '';
        let extendParam = null;
        let cancelRuleJson = null;
        let timeArr = [];
        if (orderInfo.data && orderInfo.data.startTime && orderInfo.data.endTime) {
            let nowDate = new Date().getTime();
            let startTime = orderInfo.data.startTime.substring(0,10); 
            let endTime = orderInfo.data.endTime.substring(0,10); 
            let startArray = startTime.split('-')
            let endArray = endTime.split('-')
            let startTimeInit = new Date(startArray[0],startArray[1],startArray[2])
            let startTimeNum = startTimeInit.getTime()
            let endTimeInit = new Date(endArray[0],endArray[1],endArray[2])
            let endTimeNum = endTimeInit.getTime()  

            let days = (endTimeNum - startTimeNum) / 1000 / 60 / 60 / 24;
            let isToday = (nowDate - startTimeNum) < 24 * 60 * 1000;
            let a = new Array("日", "一", "二", "三", "四", "五", "六");  
            let startTimeHan = '',endTimeHan = '';
            if (isToday) {
                startTimeHan = '今日'
            } else {
                let startWeek =startTimeInit.getDay();  
                startTimeHan  = "周"+ a[startWeek];  
            }
            let endWeek = endTimeInit.getDay();
            endTimeHan  = "周"+a[endWeek]    

            orderInfo.data.days = days;
            orderInfo.data.startTimeHan = startTimeHan;
            orderInfo.data.endTimeHan = endTimeHan;

            let pmsHotelBedTypeList = pmsKeys.data.pmsHotelBedType;
            let bedItem = pmsHotelBedTypeList.find(
                it => it.key == orderInfo.data.pmsTypeProductDetailDto.bedType
            );
            orderInfo.data.pmsTypeProductDetailDto.bedStr = bedItem.value;
            
            if (typeof orderInfo.data.extendParam === 'string') {
                try {
                    extendParam = JSON.parse(orderInfo.data.extendParam)
                    let ruleCancel = extendParam.typeProduct.ruleCancel
                    if (ruleCancel.ifCancel === 'T' && ruleCancel.cancelTimeRule === 'T') {
                        cancelRuleJson  = JSON.parse(ruleCancel.cancelRuleJson)
                    }
                } catch (error) {
                    console.log('JSON.parse extendParam 错误')
                }
                       
            }
            if (cancelRuleJson && cancelRuleJson.excludeTimeAdd instanceof Array && cancelRuleJson.excludeTimeAdd.length > 0) {
                cancelRuleStr = getCancelRuleStr(cancelRuleJson.excludeTimeAdd[0],startTime);
                timeArr = formatterTime(startTime,cancelRuleJson.excludeTimeAdd);
            }

            iscomment = await commonApi.apiRequest({
                ctx: {
                    req,
                    res,
                    next
                },
                url: ['main', 'comment', 'iscomment'],
                data: {
                    goodsCode: orderInfo.data.modelCode,
                    orderNo: orderInfo.data.orderNo,
                    userInfoId: req.session.member.id,
                    merchantInfoId: merchantInfoId
                }
            });
            
        }  

        try {
            let [getMarketDisAccount, getShowWholeMarket] = await commonApi.apiRequestAll(
                {
                    ctx: { req, res },
                    apiList: [
                        {
                            url: ["main", "merchant", "getCorpCode"],
                            data: {
                                merchantInfoId
                            }
                        },
                        {
                            url: ["main", "merchant", "showQyTab"],
                            data: {
                              merchantInfoId,
                              leaguerInfoId:req.session.member.id
                            }
                        }
                    ]
                }
            );

            if (getMarketDisAccount.status === 200 && getMarketDisAccount.data) {
                req.session.marketDisAccount = getMarketDisAccount.data.marketDisAccount;
            }
            if (getShowWholeMarket.status === 200, getShowWholeMarket.message) {
                req.session.showWholeMarket = getShowWholeMarket.message;
            }

        } catch (error) {
            console.error('登录获取企业码错误');
            return;
        }

        commonApi.renderPage(req, res, "member/order/pmsDetail", {
            title: "订单详情",
            data: [orderInfo,pmsKeys,iscomment],
            orderCloseTime: orderInfo.data.orderCloseTime,
            getCardInfo,
            beginDate,
            cancelRuleStr,
            timeArr,
            extendParam,
            cancelRuleJson,
            payOrderNo:req.params.orderInfoId,
            isWeixn: commonApi.isWxAli(req).isWx,
            isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F',
            isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F'
        })
    },

    // 电子发票信息提交页  
    async submitInfo(req, res, next) {
        let payOrderNo = req.params.payOrderNo,
            merchantInfoId = req.session.merchantInfoId || req.query.m_id,
            invoiceRate = {};
        try {
            invoiceRate = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'invoices', 'rate'],
                data: {
                    merchantInfoId,
                    payOrderNo,
                },
                ignoreError: true
            });
        } catch (error) {
            console.log(`获取开票商品税率错误::${error}`);
        }
        commonApi.renderPage(req, res, 'member/invoice/invoiceInfoSubmit', {
            title: '申请发票',
            invoiceRate,
            payOrderNo
        })
    },

    // 电子发票信息提交
    async saveInvoiceInfo(req, res, next) {
        let saveResult = {},
            merchantInfoId = req.session.merchantInfoId || req.query.m_id;
        try {
            saveResult = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'invoices', 'saveInvoiceInfo'],
                data: Object.assign({}, req.query, {
                    merchantInfoId
                })
            });
        } catch (error) {
            console.log(`保存申请发票信息错误${error}`);
        }

        res.json(
            saveResult
        )

    },

    // 电子发票列表展示页  
    async invoiceList(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId,
            flag = req.query.flag || 0;
        commonApi.renderPage(req, res, 'member/invoice/invoiceList', {
            title: '我的电子发票',
            merchantInfoId,
            flag
        })
    },

    // 电子发票分页展示
    async invoicePageList(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId,
            invoiceList = {};
        delete req.query.m_id;
        let pageObj = Object.assign(req.body, {
            merchantInfoId,
            membersId: req.session.member.id,
        });
        try {
            invoiceList = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'invoices', 'pageList'],
                data: pageObj,
                ignoreError: true
            });
        } catch (error) {
            console.log(`获取电子发票列表错误::${error}`);
        }
        res.json(invoiceList)
    },

    // 电子发票详情页展示
    async invoiceDetail(req, res, next) {
        let invoiceDetail = {},
            payOrderNo = req.params.payOrderNo;
        try {
            invoiceDetail = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'invoices', 'detail'],
                data: {
                    merchantInfoId: req.session.merchantInfoId,
                    payOrderNo
                }
            });
        } catch (error) {
            console.log('模板信息获取错误');
        }

        commonApi.renderPage(req, res, 'member/invoice/inoviceInfoDetail', {
            title: '电子发票详情',
            invoiceDetail
        })
    },

    //常用联系人列表
    async linksUserLists(req, res, next) {
        let userInfoLists = {},
            merchantInfoId = req.session.merchantInfoId || req.query.m_id;
        try {
            userInfoLists = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'user', 'getInfoLists'],
                data: {
                    merchantInfoId,
                    leaguerId: req.session.member.id
                }
            });
        } catch (error) {
            console.log(`获取联系人列表异常::${error}`)
        }

        commonApi.renderPage(req, res, 'member/links/lists', {
            title: '常用联系人',
            userInfoLists
        })
    },

    // 打开常用联系人编辑页
    async linksUserInfoEduter(req, res, next) {
        let id = req.query.id,
            linksUserInfo = {},
            orderId = req.query.orderId || '',
            merchantInfoId = req.session.merchantInfoId || req.query.m_id;
        try {
            if (typeof id !== 'undefined') {
                linksUserInfo = await commonApi.apiRequest({
                    ctx: { req, res },
                    url: ['member', 'user', 'getInfo'],
                    data: {
                        merchantInfoId,
                        id,
                        leaguerId: req.session.member.id
                    }
                });
            }
        } catch (error) {
            console.log(`获取联系人列表异常::${error}`)
        }

        commonApi.renderPage(req, res, 'member/links/add', {
            title: '编辑联系人',
            linksUserInfo,
            id,
            url: hasMerchantInfoId(req.session.curUrl, merchantInfoId),
            orderId,
            isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
            isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
        })
    },

    // 删除常用联系人

    async linksUserInfoDel(req, res, next) {
        let id = req.params.id || '',
            deleteResult = {},
            merchantInfoId = req.session.merchantInfoId || req.query.m_id;
        try {
            deleteResult = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['member', 'user', 'delete'],
                data: {
                    merchantInfoId,
                    id
                }
            });

            res.json(deleteResult)
        } catch (error) {
            console.log(`获取联系人列表异常::${error}`)
        }
    },

    // 保存常用联系人信息
    async linksUserInfoSave(req, res, next) {
        let saveResult = {},
            merchantInfoId = req.session.merchantInfoId || req.query.m_id;
        try {
            saveResult = await commonApi.apiRequest({
                ctx: { req, res },
                method: 'POST',
                url: ['member', 'user', 'save'],
                data: Object.assign(req.body, {
                    merchantInfoId,
                    leaguerId: req.session.member.id
                })
            });

            res.json(saveResult)
        } catch (error) {
            console.log(`获取联系人列表异常::${error}`)
        }
    },
    // 打开绑定推广员页面
    async goBindPromoter(req, res, next) {
        commonApi.renderPage(req, res, 'member/user/bindPromote', {
            title: '绑定推广员账号',
            isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
            isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
        })   
    },
    // 打开绑定推广员页面
    async submitBindPomoterInfo(req, res, next) {
        const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let thisOs = commonApi.isWxAli(req)
        let flag = 3;
        if (thisOs.isWx) flag =1; 
        else if (thisOs.isAliPay) flag = 2;
        const saveResult = await commonApi.apiRequest({
            ctx: { req, res },
            method: 'POST',
            url: ['member', 'enterPromote', 'bindPronoter'],
            data: Object.assign(req.query, {
                corpCode:req.session.marketDisAccount,
                merchantInfoId,
                flag,
                openId: req.session.member.id
            })
        });
        //2019年11月7日19:52:59 老旧代码，开发要求，去除
        // if (saveResult.success) {
        //     commonApi.apiRequest({
        //         ctx: { req, res, next },
        //         url: ['member', 'qyyxOper'],
        //         data: {
        //             merchantInfoId
        //         }
        //     })
        // }

        res.json(saveResult)  
    }
};

function hasMerchantInfoId(str, merchantInfoId) {
    let _url = str;
    if (!str) return false;
    if (str.indexOf('?') < 0) {
        _url = `${str}?m_id=${merchantInfoId}`;
    } else if (str.indexOf('m_id') < 0) {
        _url = `${str}&m_id=${merchantInfoId}`;
    }

    if (parseQueryString(_url)["m_id"] != merchantInfoId) {
        _url = "/?m_id=" + merchantInfoId;
    }
    return _url;
}

function parseQueryString(url) {
    var reg_url = /^[^\?]+\?([\w\W]+)$/,
        reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
        arr_url = reg_url.exec(url),
        ret = {};
    if (arr_url && arr_url[1]) {
        var str_para = arr_url[1], result;
        while ((result = reg_para.exec(str_para)) != null) {
            ret[result[1]] = result[2];
        }
    }
    return ret;
}

function getTimeValue(item) {
    let time;    
      // 时间格式为分钟
      time = item.minutes * 60 * 1000;

    return time;
}
function getCancelRuleStr(item,beginDate) {
    beginDate = beginDate.replace(/-/g, '/')
    //入住时间时间戳
    let beginDateValue = new Date(beginDate).valueOf() + (24 * 60 * 60 * 1000);

    let value = getTimeValue(item);
    let preDateValue = beginDateValue - value;
    let preDate = new Date(preDateValue);
    let year = preDate.getFullYear(); // 获取完整的年份(4位,1970)
    let month = preDate.getMonth() + 1; // 获取月份(0-11,0代表1月,用的时候记得加上1)
    let day = preDate.getDate(); // 获取日(1-31)
    let hour = preDate.getHours(); // 获取小时数(0-23)
    let minute = preDate.getMinutes(); //分
    // let seconds = preDate.getSeconds(); //秒
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;
    // seconds = seconds < 10 ? "0" + seconds : seconds;
    // let time;
    // if (item.timeType == "Hour") {
    //   // 时间格式为小时
    //   time = hour + ":00";
    // }
    // if (item.timeType == "minute") {
    //   // 时间格式为分钟
    //   time = hour + ":" + minute;
    // }
    // if (item.timeType == "second") {
    //   // 时间格式为秒
    //   time = hour + ":" + minute + ":" + seconds;
    // } 
    let time = hour + ":" + minute;
    return (
      month + "月" + day + "日" + time + "前取消可退支付金额" + item.per + "%"
    );
}
function getTime(item) {
    let time = item.hour + ":" + item.minute;;
    // if (item.timeType == "hour") {
    //     // 时间格式为小时
    //     time = item.hour + ":00";
    // }
    // if (item.timeType == "minute") {
    //     // 时间格式为分钟
    //     time = item.hour + ":" + item.minute;
    // }
    // if (item.timeType == "second") {
    //     // 时间格式为秒
    //     time = item.hour + ":" + item.minute + ":" + item.seconds;
    // }
    // console.log(time)
    return time;
}
function formatterTime(checkInTime, timeArr) {
    //checkInTime 入住时间
    //格式化开始结束时间
    let beginDate = checkInTime.replace(/-/g, '/') 
    //入住时间时间戳
    let beginDateValue = new Date(beginDate).valueOf() + 24 * 60 * 60 * 1000;

    let list = [];
    timeArr.forEach((item, index) => {
        let value = getTimeValue(item);
        let preDateValue = beginDateValue - value;
        let preDate = new Date(preDateValue);
        let year = preDate.getFullYear(); // 获取完整的年份(4位,1970)
        let month = preDate.getMonth() + 1; // 获取月份(0-11,0代表1月,用的时候记得加上1)
        let day = preDate.getDate(); // 获取日(1-31)
        let hour = preDate.getHours(); // 获取小时数(0-23)
        let minute = preDate.getMinutes(); //分
        // let seconds = preDate.getSeconds(); //秒
        list.push({
            year: year,
            month: month < 10 ? "0" + month : month,
            day: day < 10 ? "0" + day : day,
            hour: hour < 10 ? "0" + hour : hour,
            minute: minute < 10 ? "0" + minute : minute,
            // seconds: seconds < 10 ? "0" + seconds : seconds,
            timeType: item.timeType || 'Min'
        });
    });
    // console.log("list",list)
    let arr = [];

    list.forEach((item, index) => {
        item.showTime = getTime(item);
        if (index > 0) {
            arr.push({
                start: list[index - 1],
                end: item,
                proportion: timeArr[index].per
            });
        }
    });
    if (list.length) {
        arr = [
            { end: list[0], proportion: timeArr[0].per }
        ].concat(arr);
    }
    if (list.length > 0) {
        arr.push({
            start: list[list.length - 1]
        });
    }

    return arr
}
module.exports = Member;
