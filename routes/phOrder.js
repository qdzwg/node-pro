const commonApi = require("./common/common");

exports.mainRouter = function (router, common) {

    router.get('/phOrder/:module/:id', function (req, res, next) {
        let id = req.params.id,
            module = req.params.module,
            cacheInfo = req.session.cacheInfo,
            idList = '',
            parameter = {},
            idName = '';
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let ticketid = req.query.ticketid || '';

        if (process.env.NODE_ENV && module === 'ticket') {
            let queryString = '';
            for (let key in req.query) {
                if (key === 'ticketid') continue;
                var thisValue = req.query[key];
                queryString += `&${key}=${thisValue}`
            }
            let reUrl = `//${req.headers.host}/vue/order/ticket?scenicId=${id}&ticketId=${ticketid}${queryString}`;
            res.redirect(reUrl);
            return; 
        }
       
        //没有缓存数据去重新登录
        if (!req.session.member.id) {   
            req.session.curUrl = req.originalUrl;
            res.redirect(`/login?m_id=${merchantInfoId}`);
            return;
        }

        switch (module) {
            case 'ticket':
                idName = 'merchantParkInfoId';
                parameter = {
                    merchantParkTicketIds: ticketid,
                    playDate: (cacheInfo && cacheInfo.playDate) ? cacheInfo.playDate : getDateStr(0)
                };
                break;
            case 'hotel':
                idName = 'merchantHotelInfoId';
                parameter = {
                    merchantHotelRoomIds: ticketid,
                    beginDate: (cacheInfo && cacheInfo.beginDate) ? cacheInfo.beginDate + ' 00:00:00' : getDateStr(0) + ' 00:00:00',
                    endDate: (cacheInfo && cacheInfo.endDate) ? cacheInfo.endDate + ' 00:00:00' : getDateStr(1) + ' 00:00:00',
                };
                break;
            default:
                break;
        }

        var urlArr = [{
            urlArr: [module, 'detail', 'main'],
            parameter: {
                [idName]: id
            }
        }, {
            urlArr: [module, 'order', 'main'],
            parameter: parameter
        }, {
            urlArr: ['member', 'user', 'getInfoLists'],
            parameter: {
                merchantInfoId,
                leaguerId: req.session.member.id
            }
        },{
                urlArr: ['main', 'marketing', 'idCardServiceEnable'],
                parameter: {
                    merchantId: merchantInfoId,
                },
                ignoreError: true,
                method: 'post'
        }
    ];

        common.commonRequest({
            url: urlArr,
            req: req,
            res: res,
            page: 'pOrder',
            title: merchantInfoId === '229' ? '预约订单' : common.pageTitle(module) + '订单',
            callBack: function (results, reObj) {
                reObj.cacheInfo = cacheInfo;
                reObj.member = req.session.member;
                reObj.module = module;
                reObj.idList = idList;
                reObj.flag = req.query.flag;
                reObj.orderMold = req.query.mold;
                reObj.ticketid = req.query.ticketid;
                reObj.isWx = commonApi.isWxAli(req).isWx ? 'T' : 'F';
                reObj.isAli = commonApi.isWxAli(req).isAliPay ? 'T' : 'F';
                if (module === 'ticket') {
                    reObj.playDate = getDateStr(0)
                } else if (module === 'hotel') {
                    reObj.beginDate = getDateStr(0);
                    reObj.endDate = getDateStr(1);
                }
            }
        });

    });

    router.get('/ticketStock', async function (req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId, id = req.query.id, month = req.query.month || getYearAndMonth(),
            productType = req.query.module;
        if (productType === 'hotel') productType = 'room';
        var urlArr = [{
            urlArr: [req.query.module, 'order', 'getPriceStockCalendar'],
            parameter: {
                id: id,
                month: month,
                productType: productType,
                merchantInfoId: merchantInfoId
            }
        }];
        common.commonRequest({
            url: urlArr,
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results, reObj) {
                console.log('2222222223333333333', results);
            }
        })
    })
};


/**
 * 获取当前和今天以前以后的日期
 * 
 * @param {any} data 
 */

function getDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
}
/**
 * 获取当前的年份和月份
 *  */
function getYearAndMonth() {
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    return year + '-' + month;
}