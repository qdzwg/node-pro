const commonApi = require("../routes/common/common");
const conJson = require("../routes/common/config.json");
const jsSHA = require('jssha');
const cachedSignatures = {};
const expireTime = 7200 - 100;
const Group = {
  /**
   * 首页请求数据处理;
   */
  async detail(req, res, next) {
    let params = req.params,
      invited = Number(req.query.invited) || 0,
      lptId = req.query.lptId || 0,
      merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    let main = {};
    try {
      main = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['shop', 'detail', 'main'],
        data: {
          merchantMsdeInfoId: params.id,
          merchantInfoId,
          marketLptInfoId: lptId
        }
      });
    } catch (error) {
      console.log(error)
    }

    let commentInfo = {};
    try {
      commentInfo = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['main', 'comment', 'list'],
        data: {
          id: params.id,
          merchantInfoId,
          productType: "mdse",
          count:6
        }
      });
    } catch (error) {
      console.log(error)
    }

    let skuInfo = {};
    try {
      skuInfo = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['shop', 'detail', 'sku'],
        data: {
          merchantMsdeInfoId: params.id,
          merchantInfoId
        }
      });
    } catch (error) {
      console.log(error)
    }

    let groupInfo = {};
    try {
      groupInfo = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['group', 'selectByStatus'],
        data: {
          merchantInfoId,
          marketLptInfoId: lptId,
          modelCode: params.code
        }
      });
    } catch (error) {
      console.log(error)
    }

    commonApi.renderPage(req, res, 'group/productDetail', {
      title: '团购',
      main,
      commentInfo,
      skuInfo,
      groupInfo,
      invited,
      lptId,
      module: 'mdse',
    })
  },
  /**
   * 拼团详情
   */
  async orderDetail(req, res, next) {
    // detail
    let groupDetail = {};
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    let lptId = req.params.id || '';
    try {
      groupDetail = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['group', 'detail'],
        data: {
          merchantInfoId,
          lptId: lptId
        }
      });
    } catch (error) {
      console.log(error);
      return false;
    }

    commonApi.renderPage(req, res, 'group/orderDetail', {
      title: '团购',
      groupDetail,
      merchantInfoId,
      iswx: commonApi.isWxAli(req).isWx,
    })
  },
  /**
   * 打开我的拼团页面
   */
  async renderListPage(req, res, next) {
    let ptStatus = req.query.ptStatus || '';
    let isWx = commonApi.isWxAli(req).isWx;
    commonApi.renderPage(req, res, 'group/orderList', {
      title: '团购',
      module: 'group',
      ptStatus,
      isWx,
    })

  },
  /**
   * 异步加载我的拼团列表
   */
  async renderList(req, res, next) {
    let ptStatus = req.query.ptStatus || '';
    let myGroupList = {};
    req.body.ptStatus = ptStatus;
    try {
      myGroupList = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['group', 'list'],
        data: req.body
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    switch (myGroupList.status) {
      case 200:
        res.json(myGroupList);
        break;
      case 400:
        req.session.curUrl = req.originalUrl; //路由拦截,跳转前储存地址
        res.json(myGroupList);
        break;
      default:
        if (body.message) {
          req.session.errMsg = body.message;
          req.flash('message', body.message);
        }
        res.redirect('/error');
        break;
    }
  },
  async wxShare(req, res, next) {
    if (!req.session.member.id) {
      res.json({
        "msg": "unload",
        "flag": "error"
      });
      return false;
    }
    console.log('===========================================================================');
    console.log('164 wxAccount:', req.session.wxAccount);
    let wxAccount = req.session.wxAccount;
    let _url = req.query.url;
    // 如果缓存中已存在签名，则直接返回签名

    let accessToken = {};
    try {
      accessToken = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['main', 'wechat', 'getToken'],
        data: {
          merchantInfoId: req.session.merchantInfoId
        }
      });
    } catch (err) {
      console.log(err)
    }
    console.log('===========================================================================');
    console.log('207 accessToken:', accessToken);
    console.log('208 accessToken:', accessToken.message);

    let getticketUrl = {};
    try {
      getticketUrl = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        noLocal: true,
        url: ['main', 'wechat', 'getTicket'],
        data: {
          access_token: accessToken.message,
          type: "jsapi"
        }
      })
    } catch (err) {
      console.log(err)
    }
    console.log('===========================================================================');
    console.log('227 getticketUrl :', getticketUrl);
    let ts = createTimeStamp();
    let nonceStr = createNonceStr();
    let ticket = getticketUrl.ticket;
    let signature = calcSignature(ticket, nonceStr, ts, _url);
    cachedSignatures[_url] = {
      nonceStr: nonceStr,
      appid: wxAccount.appid,
      timestamp: ts,
      signature: signature,
      url: _url
    };
    res.json({
      nonceStr: nonceStr,
      timestamp: ts,
      appid: wxAccount.appid,
      signature: signature,
      url: _url,
      iswx: commonApi.isWxAli(req).isWx,
      openid: req.session.member.openId || ''
    });
  },
  async toOrder(req, res, next) {
    res.render('group/toOrder', {
      title: '确认下单'
    })
  },
  async orderPay(req, res, next) {
    res.render('group/orderPay', {
      title: '订单支付'
    })
  },
  async payResult(req, res, next) {
    res.render('group/payResult', {
      title: '支付结果'
    })
  },
  
  /**
   *  微信卡包
   */
  async wxCard(req, res, next) {
    if (!req.session.member.id) {
      res.json({
        "msg": "unload",
        "flag": "error"
      });
      return false;
    }
    console.log('===========================================================================');
    console.log('164 wxAccount:', req.session.wxAccount);
    let wxAccount = req.session.wxAccount;
    let _url = req.query.url;
    // let signatureObj = cachedSignatures[_url];
    // 如果缓存中已存在签名，则直接返回签名
    // if (signatureObj && signatureObj.timestamp) {
    //   let t = createTimeStamp() - signatureObj.timestamp;
    //   // 未过期，并且访问的是同一个地址
    //   // 判断地址是因为微信分享出去后会额外添加一些参数，地址就变了不符合签名规则，需重新生成签名
    //   if ( t < expireTime && signatureObj.url == _url) {
    //     res.json({
    //       nonceStr: signatureObj.nonceStr,
    //       timestamp: signatureObj.timestamp,
    //       appid: signatureObj.appid,
    //       signature: signatureObj.signature,
    //       cardSignature: signatureObj.cardSignature,
    //       iswx: commonApi.isWxAli(req).isWx,
    //       openid: req.session.member.openId || ''
    //     });
    //     console.log('182 signatureObj:', signatureObj);
    //     return false;
    //   }
    //   // 此处可能需要清理缓存当中已过期的数据
    // }
    let accessToken = {};
    try {
      // accessToken = await commonApi.apiRequest({
      //   ctx: {
      //     req,
      //     res
      //   },
      //   noLocal: true,
      //   url: ['main', 'wechat', 'token'],
      //   data: {
      //     grant_type: "client_credential",
      //     appid: wxAccount.appid,
      //     secret: wxAccount.appsecret,
      //   }
      // });
      accessToken = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['main', 'wechat', 'getToken'],
        data: {
          merchantInfoId: req.session.merchantInfoId
        }
      });
    } catch (err) {
      console.log(err)
    }
    console.log('===========================================================================');
    console.log('207 accessToken:', accessToken.message);
    let getticketUrl = {};
    try {
      getticketUrl = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        noLocal: true,
        url: ['main', 'wechat', 'getTicket'],
        data: {
          access_token: accessToken.message,
          type: "jsapi"
        }
      })
    } catch (err) {
      console.log(err)
    }
    let getticketCard = {};
    try {
      getticketCard = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        noLocal: true,
        url: ['main', 'wechat', 'getTicket'],
        data: {
          access_token: accessToken.message,
          type: "wx_card"
        }
      })
    } catch (err) {
      console.log(err)
    }
    let ts = createTimeStamp();
    let nonceStr = createNonceStr();
    let ticket = getticketUrl.ticket;
    let cardTicket = getticketCard.ticket;
    let code = req.query.code.split(',')
    let cardId = req.query.cardId.split(',')
    let cardSignature = []
    code.map(function (item, index) {
      let signatureitem = wxCardSignature(nonceStr, ts, item, cardTicket, cardId[index], req.session.member.openId)
      // console.log("nonceStr:" + nonceStr, "ts:" + ts, "code:" + item, "cardTicket:" + cardTicket, "cardId:" + cardId[index], "openid:" + req.session.member.openId, "signatureitem:" + signatureitem)
      cardSignature.push(signatureitem)
    })
    // console.log('signature:', signature)
    let signature = calcSignature(ticket, nonceStr, ts, _url);
    cachedSignatures[_url] = {
      nonceStr: nonceStr,
      appid: wxAccount.appid,
      timestamp: ts,
      signature: signature,
      cardSignature: cardSignature,
      url: _url
    };
    res.json({
      nonceStr: nonceStr,
      timestamp: ts,
      appid: wxAccount.appid,
      signature: signature,
      cardSignature: cardSignature,
      iswx: commonApi.isWxAli(req).isWx,
      openid: req.session.member.openId || ''
    });
  }
};
// 随机字符串产生函数
var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

// 时间戳产生函数
var createTimeStamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

// 计算签名
var calcSignature = function (ticket, noncestr, ts, url) {
  var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + ts + '&url=' + url;
  var shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(str);
  return shaObj.getHash('HEX');
}
// 微信卡包计算签名
var wxCardSignature = function (nonceStr, ts, code, ticket, cardId, openid) {
  // var str = nonceStr + ts + code + ticket + cardId;
  var array = [nonceStr, ts, code, ticket, cardId, openid].sort();
  var str = array.join(''); 
  // var str = newSort(array);

  console.log("wxCardSignature:" + str);
  // var str = ticket + ts + nonceStr + cardId + code + openid;
  var shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(str);
  return shaObj.getHash('HEX');
}

var newSort = function (strArr) {
  var array = Array.prototype.sort.call(strArr, function (a, b) {
    for (var i = 0; i < a.length; i++) {
      if (!a && !b) break;
      if (a.charCodeAt(i) == b.charCodeAt(i)) continue;
      return a.charCodeAt(i) - b.charCodeAt(i);
    }
  });

  return array.join('');

}
module.exports = Group;
