var express = require('express');
var router = express.Router();
var common = require('./common/index').common;
const commonApi = require("./common/common");

router.use(async function (req, res, next) {
    let merchantInfoId = req.query.m_id;
    if (typeof merchantInfoId === 'undefined' || (typeof merchantInfoId  === 'string' && (merchantInfoId === "undefined") || isNaN(merchantInfoId))) {
        merchantInfoId = '';
    }
    if (!merchantInfoId){
        next();
        return
    };
    if (merchantInfoId != req.session.merchantInfoId) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!店铺id切换!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log(merchantInfoId)
        console.log(req.session.merchantInfoId);
        delete req.session.marketDisAccount;
        delete req.session.showWholeMarket;
        req.session.member = { id: '' };
        req.session.token = '';
        req.session.footerDatas = null;
        req.session.areaData = null;
        req.session.templateVersion = '';
        if (req.session.openSingle ) { req.session.openSingle='' }
    }
    req.session.merchantInfoId = merchantInfoId;
    if (req.query.spread_code || req.query.promoteCode) {
        res.cookie("spread_code_" + merchantInfoId, req.query.spread_code, { maxAge: 86400000, httpOnly: false,domain:".lotsmall.cn" });
    }
    // lots联盟优化 
    if (req.query.mkPromoteCode){
        req.session['mkSpreadCode_'+ merchantInfoId] = req.query.mkPromoteCode;
        res.cookie("mk_promote_code" + merchantInfoId, req.query.mkPromoteCode, { maxAge: 86400000, httpOnly: false, domain:".lotsmall.cn" });
        res.cookie("mk_promote_code", req.query.mkPromoteCode, { maxAge: 86400000, httpOnly: false, domain:".lotsmall.cn" });
    }
    next();
});

//存储全局单品推广权限（是否展示推广金额）
router.use(function(req, res, next){
    let  getUrl= req.originalUrl.split('/')[1],
        urlType = req.method;
    //&& !req.session.openSingle
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    if (!merchantInfoId || (typeof merchantInfoId === 'string' && merchantInfoId.trim() === 'undefined')) {
        next();
        return;
    }
    if(req.session && !req.body.currPage &&( (urlType==='GET' && getUrl==='list') || !req.session.openSingle ) ){
        common.commonRequest({
            url: [{
                urlArr: ['main', 'merchant', 'getOpenSingle'],
                parameter: {
                    leaguerId: req.session.member.id || '',
                    merchantInfoId: merchantInfoId
                },
                ignoreError:true
            }],
            req: req,
            res: res,
            isAjax: true,
            callBack: function (results, reObj, res, handTag) {
                handTag.tag = 0;
                if(typeof results[0].data !== 'undefined' && results[0].data.openSingle ){
                    res.locals.openSingle = req.session.openSingle = results[0].data.openSingle;
                }else{
                    res.locals.openSingle = req.session.openSingle = ""
                }
                next();
            }
        });
    }else{
        res.locals.openSingle = req.session.openSingle;
        next();
    }
});



// main
require('./main').mainRouter(router, common);
// member
require('./member').mainRouter(router, common);
// list
require('./list').mainRouter(router, common);
// detail  
require('./detail').mainRouter(router, common);
// order
require('./order').mainRouter(router, common);
// cart
require('./cart').mainRouter(router, common);
// pay
require('./pay').mainRouter(router, common);
//coupons
require('./coupons').mainRouter(router, common);
//yearcard
require('./yearcard').mainRouter(router, common);
//aggregate search
require('./csearch').mainRouter(router, common);
//跳转公共服务路由
require('./gotoPublic').mainRouter(router, common);
//ticket,hotel扫码下单route
require('./phOrder').mainRouter(router, common);

module.exports = router;