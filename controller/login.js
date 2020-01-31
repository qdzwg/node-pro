const commonApi = require("../routes/common/common");
const conJson = require("../routes/common/config.json");
const Login = {
    /**
     * 首页请求数据处理;
     */
    async login(req, res, next) {
        let is_wx_ali = {
            isWx: false,
            isAliPay: false
        };
        let that = this;
        let channl = '';
        is_wx_ali = commonApi.isWxAli(req);
        const merchantInfoId = req.query.m_id;
        req.session.merchantInfoId = merchantInfoId;

        if (req.query.redir) req.session.curUrl = decodeURI(req.query.redir);

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

        //微信环境下授权登录
        if (is_wx_ali.isWx) {
            //定义微信支付内容
            channl = 'WEIXIN';
            //获取微信配置信息
            let wxInfo = {};
            let wxAccount = {
                appid: '',
                appsecret: ''
            }

            try {
                wxInfo = await commonApi.apiRequest({
                    ctx: {
                        req,
                        res
                    },
                    url: ['main', 'pay', 'getPayInfo'],
                    data: {
                        payCode: 'wxZyb',
                        merchantInfoId
                    }
                });
            } catch (error) {
                console.error(error)
            }

            if (wxInfo && (wxInfo.data.details.length > 0)) {
                wxInfo.data.details.forEach(element => {
                    if (element.payKey === 'appid')
                        wxAccount.appid = element.payValue;
                    if (element.payKey === 'appsecret')
                        wxAccount.appsecret = element.payValue;
                });
                req.session.wxAccount = wxAccount;

            }
        } else if (is_wx_ali.isAliPay) {
            //去授权登录
            channl = 'ALI';
        } else {
            let redirUrl = '';
            if (req.session.curUrl) {
                redirUrl = hasMerchantInfoId(req.session.curUrl, merchantInfoId)
            } else {
                redirUrl = './?m_id=' + merchantInfoId;
            }
            //账号登录  
            commonApi.renderPage(req, res, 'login', {
                title: '登录',
                redir: redirUrl
            })
            return false
        }
        let reUrl = commonApi.handleGetUrl({
            url: ['member', 'login', 'authApi'],
            data: {
                redirectUrl: encodeURIComponent(`${req.protocol}://${req.headers.host}/authLogin?m_id=${merchantInfoId}`),
                merchantInfoId,
                channl,
            }
        })
        res.redirect(reUrl);
    },
    /**
     * 微信、支付宝授权登录回调
     */

    async authLogin(req, res, next) {
        let leaguerId = req.query.leaguerInfoId;
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        req.session.token = req.query.token;
        req.session.loginSign = 1; // 已登录

        let member = await commonApi.apiRequest({
            ctx: { req, res },
            url: ['member', 'info'],
            data: {
                leaguerId,
                merchantInfoId,
            }
        })
        if (member) {
            req.session.member = member.data;
            res.cookie("token", req.query.token, { maxAge: 28800000, httpOnly: false });
            res.cookie("leaguerInfoId", leaguerId, { maxAge: 28800000, httpOnly: false });
        } 

        //设计重定向链接
        let redirUrl = '';
        if (req.session.curUrl) {
            redirUrl = hasMerchantInfoId(req.session.curUrl, merchantInfoId)
        } else {
            redirUrl = './?m_id=' + merchantInfoId;
        }
        res.redirect(redirUrl)
    },
    /**
     * 打开登录界面
     */
    async register(req, res, next) {
        const merchantInfoId = req.query.m_id;
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
                            url: ["main", "merchant", "showWholeMarket"],
                            data: {
                                merchantInfoId
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
            console.error(error)
        }

        commonApi.renderPage(req, res, 'register', {
            title: '注册',
            redir: hasMerchantInfoId(req.session.curUrl, merchantInfoId) || './member?m_id=' + merchantInfoId
        })
    },
    /**
     * 授权失败
     */
    async aliLoginFail(req, res, next) {
        let message = req.query.message || '授权登录失败，请检查配置是否正确。';
        commonApi.renderPage(req, res, 'error', {
            title: "授权失败",
            message,
            merchantInfoId: req.session.merchantInfoId
        })
    }
}

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


function changeURLPar(destiny, par, par_value) {
    var pattern = par + '=([^&]*)';
    var replaceText = par + '=' + par_value;
    if (destiny.match(pattern)) {
        var tmp = '/\\' + par + '=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else {
        if (destiny.match('[\?]')) {
            return destiny + '&' + replaceText;
        }
        else {
            return destiny + '?' + replaceText;
        }
    }
    return destiny + '\n' + par + '\n' + par_value;
}

module.exports = Login;
