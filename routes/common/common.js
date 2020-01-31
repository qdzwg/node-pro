const needle = require('needle');
const crypto = require('crypto');
const conJson = require('./config.json');
const Config = require('../../config/index');

/***************************************************************************************************************
 * 请求处理
 ***************************************************************************************************************/

/**
 * 请求数据处理
 * @param {any} {method,url,data,options} 
 */
async function apiRequest({
    ctx = {},
    method = 'GET',
    url = [],
    data = {},
    noLocal = false, //是否添加公共参数
    noData = false,
    ignoreError = false,
}) {
    url = getUrl(url, noLocal);
    data = noLocal ? data : getParam(isWxAli(ctx.req),data);

    if(ctx.req.query.spread_code){
        ctx.req.cookies.promote_code=ctx.req.query.spread_code;
    }
    
    if(ctx.req.query.mkPromoteCode){
        ctx.req.cookies.mk_promote_code=ctx.req.query.mkPromoteCode;
    }

    let merchantInfoId = '',
        marketDisAccount = '',
        options = {
            'content-type': 'text/html;charset=utf-8',
            headers: {},
            cookies:ctx.req.cookies,
            timeout: 100000
        };

    if (!noLocal) {
        merchantInfoId = ctx.req.session.merchantInfoId; //獲取店鋪id
        options.headers = {
            'access-token': ctx.req.session.token || ""
        };
        marketDisAccount = ctx.req.session.marketDisAccount;
        showWholeMarket = ctx.req.session.showWholeMarket;
       
    }

    let result = null; //保存结果

    console.log('=====================================请求数据开始===========================================');
    console.log('option', options);

    await needlePromise(method, url, data, options)
        .then(body => {
            if (noData) return; // 不需要数据处理直接返回
            if (body && body.status !== 200 && !noLocal && !ctx.req.xhr && !ignoreError) {
                switch (body.status) {
                    case 400:
                        ctx.req.session.curUrl = ctx.req.originalUrl; //路由拦截,跳转前储存地址
                        ctx.res.redirect('/login?m_id=' + ctx.req.session.merchantInfoId);
                        break;
                    case 410:
                        ctx.req.session.curUrl = ctx.req.originalUrl; //路由拦截,跳转前储存地址
                        let redUrl = decodeURIComponent(ctx.req.originalUrl)
                        if (process.env.NODE_ENV) {      
                            ctx.res.redirect(`//${ctx.req.headers.host}/vue/bind/mobile?m_id=${ctx.req.session.merchantInfoId}&
                            rediurl=${redUrl}`)
                        }  
                        break;
                    default:
                        if (body.message) {
                            ctx.req.session.errMsg = body.message;
                            ctx.req.flash('message', body.message);
                        };
                        ctx.res.redirect('/error?m_id=' + ctx.req.session.merchantInfoId);
                        break;
                }
            } else {
                result = noLocal ? body : Object.assign({
                    merchantInfoId,
                    marketDisAccount,
                    showWholeMarket
                }, body);
            }
        })
        .catch(err => {
            console.log('==================================获取数据失败==================================');
            console.log(err);
            ctx.res.status(404);
            result = {
                status:404,
                message:'数据未成功加载'
            };
        })
    console.log('=====================================请求数据结束===========================================');
    return result;
}

async function apiRequestAll({
    ctx = {},
    apiList = [],
    noLocal = false, //是否添加公共参数
}) {
    let merchantInfoId = '',
        requestArray = [],
        result = [] //保存结果
    options = {
        'content-type': 'text/html;charset=utf-8',
        headers: {},
        timeout: 100000
    };
    if (!noLocal) {
        merchantInfoId = ctx.req.query.m_id || ctx.req.body.merchantInfoId || ctx.req.session.merchantInfoId; //獲取店鋪id
        ctx.req.session.merchantInfoId = merchantInfoId;
        options.headers = Object.assign(options.headers, {
            'access-token': ctx.req.session.token || ""
        });
        marketDisAccount = ctx.req.session.marketDisAccount;
        showWholeMarket = ctx.req.session.showWholeMarket;
    }

    apiList.map(item => {
        let url =
            getUrl(item.url, noLocal);
        let data = noLocal ? item.data : getParam(isWxAli(ctx.req),item.data);
        requestArray.push(needlePromise(item.method, url, data, options));
    })

    await Promise.all(requestArray)
        .then(body => {
            if (body && body.length > 0) {
                for (let i = 0, lengs = body.length; i < lengs; i++) {
                    const item = body[i];
                    if (item.status !== 200 && !noLocal && !ctx.req.xhr && (typeof apiList[i].ignoreError === 'undefined' || !apiList[i].ignoreError)) {
                        switch (item.status) {
                            case 400:
                                ctx.req.session.curUrl = ctx.req.originalUrl; //路由拦截,跳转前储存地址
                                ctx.res.redirect('/login?m_id=' + merchantInfoId);
                                break;
                            case 410:
                                ctx.req.session.curUrl = ctx.req.originalUrl; //路由拦截,跳转前储存地址
                                let redUrl = decodeURIComponent(ctx.req.originalUrl)
                                if (process.env.NODE_ENV) {      
                                    ctx.res.redirect(`//${ctx.req.headers.host}/vue/bind/mobile?m_id=${ctx.req.session.merchantInfoId}&
                                    rediurl=${redUrl}`)
                                }  
                                break;    
                            default:
                                if (body.message) {
                                    ctx.req.session.errMsg = item.message;
                                    ctx.req.flash('message', item.message);
                                };
                                ctx.res.redirect('/error?m_id=' + merchantInfoId);
                                break;
                        }
                    } else {
                        result.push(item)
                    }
                }
            }
        })
        .catch(err => {
            console.log('common.js Promise.all() 处理出错')
            console.error(err)
        })

    return result;
}

/**
 * 发起请求
 * @param {*请求方式} method 
 * @param {*请求地址} url 
 * @param {*请求数据} data 
 * @param {*请求头信息} options 
 */
function needlePromise(method = 'GET', url = '', data = {}, options = {}) {
    return new Promise((resolve, reject) => {
        let startTime = new Date().getTime();
        needle.request(method, url, data, options, (err, resp, body) => {
            let endTime = new Date().getTime();
            console.log('=========================================打印数据开始======================================');
            console.log('(timeDigest-branch,' + url + ',' + (endTime - startTime) + ')');
            console.log('(options:',options);
            console.log('params:', data);
            console.log(body);
            console.log('=========================================打印数据结束======================================');
            if (err) {
                reject(err);
            } else {
                try {
                    body = typeof body === 'string' ? JSON.parse(body) : body;
                } catch (error) {
                    body = {status:404,message:'数据未成功加载'}
                    console.log(`接口${url}数据错误`)
                } 
                resolve(body);
            }
        });
    })
};
/**
 * 从接口库里面取相关接口
 * @param {any} url 
 * @returns reUrl 请求接口
 * @memberof commonApi
 */
function getUrl(url, noLocal) {
    let config = conJson,
        reUrl = Config.baseURL;
    if (url[1] === 'enterPromote') reUrl = Config.qyyxBaseUrl;  // 切换到全员链接
    url.map((item, index) => {
        config = config[item];
    });
    noLocal && url[1] !== 'enterPromote' ?
        reUrl = config :
        reUrl += config;
    return reUrl;
}

/**
 * 添加公共参数
 * @param {any} { parameter: {} } 
 * @returns 处理后的参数
 * @memberof commonApi
 */
function getParam(isWxAli ,data = {}) {
    let wayType = 1;
    if (isWxAli.isWx) {
        wayType = 2;
    }
    else if (isWxAli.isAliPay) {
        wayType = 3;
    }
    return Object.assign({
        wayType: wayType
    }, data);
}

/**
 * 拼接链接
 * @param {地址+参数} url 
 */
function handleGetUrl({
    url,
    data,
    outApi
}) {
    let urlList = conJson,
        reUrl = Config.baseURL,
        dataStr = '';

    url.map(function (item, index) {
        urlList = urlList[item];
    });

    outApi ?
        reUrl = urlList :
        reUrl += urlList;

    if (data) {
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&';
        })

        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            reUrl = reUrl + '?' + dataStr;
        }
    }

    return reUrl;
}

/**
 * 渲染頁面
 * @param {*} param0 
 */
function renderPage(req, res, page, data) {
    const showNewUserSpecialOffer = !!req.session.loginSign;
    if (req.originalUrl.indexOf("login") === -1 
        && req.originalUrl.indexOf("register") === -1
        && req.originalUrl.indexOf("csearch") === -1
    ) {
      req.session.curUrl = req.originalUrl; //缓存访问地址
      if (req.session.loginSign) req.session.loginSign = null;
    }
    let userFrom = isWxAli(req);
    let newData = Object.assign(
        data,
        {
            userFrom,
            inWx: userFrom.isWx,
            userInfo: req.session.member, //用户信息            
            merchantInfoId: req.session.merchantInfoId || req.query.m_id, //店铺id
            marketDisAccount: req.session.marketDisAccount, //企业码
            showWholeMarket: req.session.showWholeMarket,
            footerDatas: req.session.footerDatas,  // 底部数据
            curPath: req.path,
            showNewUserSpecialOffer,
            qyyxUrl: Config.qyyxBaseUrl,
            version: Config.version,
            nodeEnv:process.env.NODE_ENV || 'local'
        }
    )
    console.log('/**********************************************打印页面数据*************************************************************');
    console.log(newData);
    console.log('****************************************************结束打印*******************************************************\\');
    res.render(page, newData);
}

/*****************************************************************************************************************
 *其他公共方法
 *****************************************************************************************************************/


/**
 * 判断是否是来自微信环境 
 * @param {respons} req 
 */
function isWxAli(req) {
    try {
        var ua = req.headers["user-agent"].toLowerCase();
        return {
            isWx: (/micromessenger/.test(ua)),
            isAliPay: ua.match(/AlipayDefined/i) !== null && ua.match(/AlipayDefined/i)[0] === "alipaydefined"
        }
    } catch (error) {
        console.log('get user-agent error');
        return {
            isWx: false,
            isAliPay: false
        }
    }
    
}

/**
 * 获取业务名称
 * @param {any} module 
 * @returns 
 */
function pageTitle(module) {
    let title = "";
    switch (module) {
        case "ticket":
            title = "景区";
            break;
        case "hotel":
            title = "酒店";
            break;
        case "route":
            title = "跟团游";
            break;
        case "combo":
            title = "自由行";
            break;
        case "repast":
            title = "餐饮";
            break;
        case "shop":
            title = "商品";
            break;
        case "raiders":
            title = "攻略";
            break;
        case "order":
            title = "订单";
            break;
        case "mealCoupon":
            title = "餐券";
            break;
        case "yearcard":
            title = "年卡";
            break;
    }

    return title;
}

/**
 * MD5加密
 * @param {any} text 
 * @returns 
 */
function reMd5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = {
    apiRequest, //请求数据
    apiRequestAll, //并发请求
    isWxAli, //判断登录环境
    handleGetUrl, //拼接get请求链接
    pageTitle,
    reMd5,
    renderPage
}