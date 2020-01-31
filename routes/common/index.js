const async = require('async'),
    needle = require('needle'),
    crypto = require('crypto');
const conJson = require('./config.json');
const Config = require('../../config/index');

// 私有属性
var private = {
    partner: 'wap',
    key: 'd332326d0b36f9cf66d290363f3b29f6',
    reMd5: function (text) {
        return crypto.createHash('md5').update(text).digest('hex');
    },
    getMethod: function (url) {
        return url.split('/').splice(-1)[0].split('.')[0];
    },
    getUrl: function (url) {
        var config = conJson,
            reUrl = Config.baseURL;
        if (url.urlArr[1] === 'enterPromote') reUrl = Config.qyyxBaseUrl;  // 切换到全员链接    
        url.urlArr
            .map(function (item, index) {
                config = config[item];
            });
        url.outApi && url.urlArr[1] !== 'enterPromote' ? reUrl = config : reUrl += config;
        return reUrl;
    },
    gul: function (url, falg) {
        var reUrl = url;
        if (reUrl) {
            var tagUrl = '';
            for (key in falg) {
                tagUrl += key + '=' + falg[key] + '&'
            }
            return reUrl + '?' + tagUrl;
        } else {
            console.log('In config.json not found the url');
        }
    },
    nowdDate: Date.now(),
    getParam: function (req,item) {
        let isWxAli = this.isWxAli(req);
        let _o = {};
        if (isWxAli.isWx) {
            _o.wayType = 2;
        }
        else if (isWxAli.isAliPay) {
            _o.wayType = 3;
        }
        else {
            _o.wayType = 1;
        };
        _o = item.parameter || {};

        return _o;
    },
    isWxAli: function (req) {
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
};
// 导出属性 
var common = {
    getUrl: function (url) {
        var config = conJson,
            reUrl = null,
            tagUrl = '';

        url.urlArr
            .map(function (item, index) {
                config = reUrl = config[item];
            });
        if (url.parameter) {
            for (key in url.parameter) {
                tagUrl += key + '=' + url.parameter[key] + '&'
            }
            reUrl += '?' + tagUrl.slice(0, -1);
        }

        return reUrl;
    },
    gul: function (url) {
        var config = conJson,
            reUrl = config.domain;

        url.map(function (item, index) {
            config = config[item];
        });
        reUrl += config;
        return reUrl;
    },
    commonRequest: function (_p) {
        // 扩展对象
        var opt = {
            title: '标题', // 页面标题
            isAjax: false, // 是否为异步
            callBack: function () { } // 流程处理完之后的回调
        };
        _p.__proto__ = opt;

        var merchantInfoId = _p.req.session.merchantInfoId; //獲取店鋪id

        //追加个推广码存入cookie，初始打开页面没有cookie，单独配置
        if(_p.req.query.spread_code){
            _p.req.cookies.promote_code=_p.req.query.spread_code;
        }
        
        if(_p.req.query.mkPromoteCode){
            _p.req.cookies.mk_promote_code=_p.req.query.mkPromoteCode;
        }

        var _a = new Array(),
            _o = {
                'content-type': 'text/html;charset=utf-8',
                headers: {
                    'access-token': _p.req.session.token || ""
                },
                cookies: _p.req.cookies,
                timeout: 100000
            };
        console.log('token', _p.req.session.token);
        _p.url
            .map(function (item, index) {
                var _u = private.getUrl(item),
                    _d = item.noLocal ? item.parameter : private.getParam(_p.req,item),
                    method = item.method ? item.method : _p.req.method;
                _d.merchantInfoId = merchantInfoId;
                let startTime = new Date().getTime();
                _a.push(function (cb) {
                    needle.request(method, _u, _d, _o, function (err, resp, body) {
                        console.log(_u);
                        console.log(_d);
                        console.log(_o);
                        console.log(body);
                        let endTime = new Date().getTime();
                        console.log('(timeDigest-branch,' + _u + ',' + (endTime - startTime) + ')');
                        if (!err && resp.statusCode === 200) {
                            try {
                                body = typeof body === 'string' ? JSON.parse(body) : body;
                            } catch (error) {
                                body = {
                                    status: 404,
                                    message: '获取数据异常'
                                }
                            }

                            if (body && body.status != 200 && !item.noLocal && (typeof item.ignoreError === 'undefined' || !item.ignoreError)) {
                                cb('error', body);
                            } else {
                                cb(null, body);
                            }

                        } else {
                            var result = null;
                            try {
                                result = typeof body === 'string' ? JSON.parse(body) : body;
                            } catch (error) {
                                result = {
                                    status: 404,
                                    message: '获取数据异常'
                                }
                            }
        
                            if (typeof result === 'object' &&  (result.status == 400 || result.status == 410 ) && (typeof item.ignoreError === 'undefined' || !item.ignoreError)) {
                                cb('error', result);
                            } else {
                                _p.res.status(404);
                                cb(null, body);
                            }
                        }
                    });
                });
            });
        async.parallel(_a, function (err, results) {
            if (err) {
                if (_p.isAjax) {
                    _p.res.send(results);
                } else {
                    if (results.length > 0) {
                        results.map(function (item, index) {
                            if (item.status !== 200 && (typeof _p.url[index].ignoreError === 'undefined' || !_p.url[index].ignoreError)) {
                                _p.req.flash('message', item.message ? item.message : '没有数据');
                                switch (item.status) {
                                    case 400:
                                        _p.req.session.curUrl = _p.req.originalUrl;
                                        _p.res.redirect('/login?m_id=' + _p.req.session.merchantInfoId);
                                        break;
                                    case 402:
                                        console.log("接口 402！");
                                        _p.res.redirect('/error?m_id=' + _p.req.session.merchantInfoId);
                                        break;
                                    case 404:
                                        console.log("接口 404！");
                                        _p.res.redirect('/error?m_id=' + _p.req.session.merchantInfoId);
                                        break;
                                    case 410:
                                        _p.req.session.curUrl = _p.req.originalUrl; //路由拦截,跳转前储存地址
                                        let redUrl = decodeURIComponent(_p.req.originalUrl)
                                        if (process.env.NODE_ENV) {      
                                            _p.res.redirect(`//${_p.req.headers.host}/vue/bind/mobile?m_id=${_p.req.session.merchantInfoId}&
                                            rediurl=${redUrl}`)
                                        }  
                                        break;    
                                    default:
                                        _p.res.redirect('/error?m_id=' + _p.req.session.merchantInfoId);
                                        break;
                                }

                            }
                        });
                    } else {
                        _p.req.flash('message', '没有数据');
                        _p.res.redirect('/error404');
                    }
                }
            } else {
                var reObj = {};
                var handTag = {
                    tag: 1
                };

                _p.callBack(results, reObj, _p.res, handTag);

                if (handTag.tag) {
                    if (_p.isAjax) {
                        if (results[0].data && results[0].data.token) {
                            _p.req.session.token = results[0].data.token;
                            _p.req.session.loginSign = 1;
                            _p.res.cookie("token", results[0].data.token , { maxAge: 28800000, httpOnly: false });
                            _p.res.cookie("leaguerInfoId", results[0].data.leaguerId , { maxAge: 28800000, httpOnly: false });
                            _p.res.locals.openSingle = _p.req.session.openSingle = ""; //清楚单品全局，登录后重新获取
                            needle.request("GET", private.getUrl({
                                urlArr: ['member', 'info']
                            }), {
                                    leaguerId: results[0].data.leaguerId,
                                    merchantInfoId: _p.req.session.merchantInfoId
                                }, {
                                    'content-type': 'text/html;charset=utf-8',
                                    headers: {
                                        'access-token': results[0].data.token
                                    },
                                    timeout: 100000
                                }, function (err, resp, body) {
                                    console.log(body);
                                    var result = typeof body === 'string' ? JSON.parse(body) : body;
                                    if (result.status === 200) {
                                        _p.req.session.member = result.data;
                                        _p.res.send([{
                                            status: 200
                                        }]);
                                    } else {
                                        _p.res.send([result]);
                                    }
                                });
                        } else {
                            _p.res.send(results);
                        }
                    } else if (_p.page) {
                        const showNewUserSpecialOffer = !!_p.req.session.loginSign;
                        const userFrom = private.isWxAli(_p.req);
                        if (
                            _p.req.originalUrl.indexOf("login") === -1
                            && _p.req.originalUrl.indexOf("register") === -1
                            && _p.req.originalUrl.indexOf("csearch") === -1
                        ) {
                            _p.req.session.curUrl = _p.req.originalUrl; //缓存访问地址
                            if (_p.req.session.loginSign) _p.req.session.loginSign = null;
                        }
                        if (_p.page !== 'login') {
                            _p.req.session.curUrl = _p.req.originalUrl;
                        };

                        reObj.title = _p.title;
                        reObj.data = results;
                        reObj.userFrom = userFrom;
                        reObj.inWx = userFrom.isWx;
                        reObj.userInfo = _p.req.session.member;
                        reObj.merchantInfoId = merchantInfoId;
                        reObj.templateCode = _p.req.session.templateCode;
                        reObj.marketDisAccount = _p.req.session.marketDisAccount;
                        reObj.showWholeMarket = _p.req.session.showWholeMarket;
                        reObj.footerDatas = _p.req.session.footerDatas;
                        reObj.curPath = _p.req.path;
                        reObj.qyyxUrl = Config.qyyxBaseUrl;
                        reObj.version = Config.version;
                        reObj.nodeEnv = process.env.NODE_ENV || 'local';
                        reObj.showNewUserSpecialOffer = showNewUserSpecialOffer;
                        console.log(reObj);
                        _p.res.render(_p.page, reObj);
                    } else {
                        return false;
                    }
                }
            }
        });
    },
    pageTitle: function (module) {
        var title = "";
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
            case "goods":
                title = "商品";
                break;
            case "raiders":
                title = "攻略";
                break;
            case "guide":
                title = "导游";
                break;
            case "order":
                title = "订单";
                break;
            case "qr":
                title = "门票";
                break;
            case "mealCoupon":
                title = "餐券";
                break;
        }
        return title;
    },
    getModule: function (m) {
        var _r = m;
        switch (m) {
            case 'amuse':
                _r = 'amusement';
                break;
        }
        return _r;
    },
    is_weixn: function (req) {
        try {
            var ua = req.headers["user-agent"].toLowerCase();
            return ua.match(/MicroMessenger/i) == "micromessenger";
        } catch (error) {
            console.log('get user-agent error');
            return false;
        }
    }
};

exports.common = common;