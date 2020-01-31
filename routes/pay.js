const USERTYPE = 'C'; //用户类型c端
const commonApi = require("./common/common");


exports.mainRouter = function (router, common) {
  // 支付确认页面
  router.get('/pay/:module/:orderId', function (req, res, next) {
    var module = req.params.module,
      orderNo = req.params.orderId;
    common.commonRequest({
      url: [{
        urlArr: ['order', 'detail'],
        parameter: {
          payOrderNo: orderNo
        }
      }],
      req: req,
      res: res,
      page: 'pay',
      title: '支付确认页',
      callBack: function (results, reObj) {
        reObj.module = module;
        reObj.payOrderNo = orderNo;
        reObj.is_weixn = common.is_weixn(req);
        req.session.ordertitle = results[0].data.orderDescription;
      }
    });
  });

  // 获取支付类型
  router.get('/payType/get', async function (req, res, next) {
    let { chanel = 'normal', name = '', orderNo, paySum = '', code = '' } = req.query;
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    let payType = '';
    let businessType = 'WAP';
    let isWxAli = commonApi.isWxAli(req);
    let resData = {}
    if (chanel === 'long') {
      payType = '2015'
    } else {
      if (isWxAli.isWx) {
        let getWxType = await commonApi.apiRequest({
          ctx: {
            req,
            res
          },
          url: ['main', 'merchant', 'validateZeroRateTicket'],
          data: {
            merchantInfoId: merchantInfoId,
            modelCode: code,
          }
        });
        businessType = 'WEIXIN';
        if (getWxType.status === 200 && getWxType.message === 'T') businessType = 'YXT';
      } else if (isWxAli.isAliPay) {
        businessType = 'ALI';
      }
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
          moduleCode:code
        }
      });

      payType = JSON.parse(getPayType.message)[0];
    }

    resData.payType = payType
    if (payType === '2019') {
      let params = {
        orderInfo: name
      };
      let data = {
        payOrderNo: orderNo,
        userType: USERTYPE,
        accountId: merchantInfoId,
        payType: payType, //wap支付宝支付
        paySum: paySum,
        operateId: req.session.member.id,
        extendParamJson: JSON.stringify(params)
      };
      try {
        let alipayInfo = await commonApi.apiRequest({
          ctx: {
            req,
            res
          },
          url: ['main', 'pay', 'goPay'],
          ignoreError:true,
          data: data
        });
        if (alipayInfo.status === 200 && alipayInfo.payLink) {
          let payData = JSON.parse(alipayInfo.data)
          resData.tradeNo = payData.orderNo
        } else {
          res.json({
            status: 402,
            message: alipayInfo.message
          })
          return;
        }
      } catch (error) {
        res.json({
          status: 402,
          message: error
        })
        return
      }
    } 
    res.json({
      status: 200,
      data: resData
    })

  })
  // 去支付
  router.get('/pay/:module', async function (req, res, next) {
    let orderNo = req.query.orderNo,
      paySum = req.query.paySum,
      ordertitle = req.query.name || '待支付产品',
      merchantInfoId = req.session.merchantInfoId || req.query.m_id,
      params = {},
      data = {},
      payType = req.query.payType,
      page = "";
      let isWxAli = commonApi.isWxAli(req);

      // 工行139店铺支付特殊处理
      if (merchantInfoId == '139') {
        payType = '2015'
      }

    if (isWxAli.isWx) {
      //next();
      params = {
        openId: req.session.member.openId,
        operateId: req.session.member.id,
        orderInfo: ordertitle,
        payerIp: req.session.userIp
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
        orderInfo: ordertitle,
        payerIp: req.session.userIp
      };
      data = {
        payOrderNo: orderNo,
        userType: USERTYPE,
        accountId: merchantInfoId,
        // accountId:0,
        payType: payType, //wap支付宝支付
        paySum: paySum,
        operateId: req.session.member.id,
        extendParamJson: JSON.stringify(params)
      };
      page = "pay/payAlipay";
    }
    let alipayInfo = {};
    //判断是否是yearcard支付
    req.session.ycPay = false;
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

    if (alipayInfo.payLink) {
      // console.log(page, alipayInfo)
      if (payType === '12' || payType === '17') { // 工行聚合支付特别处理
        let itemInfo = alipayInfo.data;
        itemInfo = typeof itemInfo === 'string' ? JSON.parse(itemInfo) : {};
        commonApi.renderPage(req, res, 'wxpay', {
          item: itemInfo,
          orderNo
        })
      }
      else if (payType === '70' || payType === '71' || (payType === '2015' && merchantInfoId != '139')) {
        let bankUrl = alipayInfo.data;
        res.redirect(bankUrl)
      }
      else {
        commonApi.renderPage(req, res, page, alipayInfo)
      }
    } else {
      res.redirect('/payPlat/result?out_trade_no=' + alipayInfo.data);
    }
  });

  // 智游宝阿里支付同步回调
  router.post('/payPlat/result', async function (req, res, next) {
    let merchantInfoId = req.session.merchantInfoId;
    console.log('=====================================支付回调接口/payPlat/result====================================');
    //回调结果
    let result = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'pay', 'alipayZybPayResult'],
      data: req.body
    });

    // 判断是否开启自定义支付结果页
    let getUsePage = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'merchant', 'getUsePage'],
      data: {
        pageType: "paySuccessPage",
        useRange: "wap",
        merchantInfoId:result.data.accountId || req.session.merchantInfoId
      }
    });
    
    if (getUsePage.status === 200 && typeof getUsePage.data !== 'undefined'){
      res.redirect('/vue/pay/result?m_id='+ result.data.accountId + '&payOrderNo='+ result.data.payOrderNo)
      return;
    } 
    
    if (result.status === 200 && typeof result.data.accountId !== 'undefined') merchantInfoId = req.session.merchantInfoId = result.data.accountId;
    let buyCount = 0;
    // 年卡支付结果
    if (req.session.ycPay == true) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "yearcard/ycpayResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    // 新年卡支付结果
    else if (!result.data.orderInfoJson) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "parkCard/payResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    else {
      let orderInfo = JSON.parse(result.data.orderInfoJson);
      let payOrderNo = result.data.payOrderNo;
      console.log('=====================================支付回调接口orderInfo====================================');
      console.log(orderInfo);

      orderInfo.forEach(item => {
        buyCount += Number(item.buyCount);
      });
      let idArray = [];
      if (orderInfo.length > 0) {
        orderInfo.forEach(function (item) {
          idArray.push(item.id)
        })
      }
      console.log('测试支付宝阿里支付推广----' + req.session.member.id)
      let requireArray = await getRequireArray({ result, orderInfo, merchantInfoId, buyCount, orderNo: payOrderNo, userId: req.session.member.id })
      let payDatas = await commonApi.apiRequestAll({
        ctx: {
          req,
          res
        },
        apiList: requireArray
      })
      for (var key in req.query) {
        req.query[key] = [req.query[key]];
      }

      commonApi.renderPage(req, res, "payResult", {
        title: "支付结果",
        payOrderNo,
        data: [result, ...payDatas],
        id: idArray.join(','),
        isWeixn: commonApi.isWxAli(req).isWx,
        isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
        isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
      })
    }

  });

  //智游宝微信支付回调
  router.post('/zybpay/result', async function (req, res, next) {
    console.log('=====================================支付回调接口/zybpay/result====================================');
    console.log(req.body)
    let merchantInfoId = req.session.merchantInfoId;
    //回调结果
    let result = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'wechat', 'wxPayResult'],
      data: req.body
    });
    // 判断是否开启自定义支付结果页
    let getUsePage = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'merchant', 'getUsePage'],
      data: {
        pageType: "paySuccessPage",
        useRange: "wap",
        merchantInfoId:result.data.accountId || req.session.merchantInfoId
      }
    });
    
    if (getUsePage.status === 200 && typeof getUsePage.data !== 'undefined'){
      res.redirect('/vue/pay/result?m_id='+ result.data.accountId + '&payOrderNo='+ result.data.payOrderNo)
      return;
    } 
 
    if (result.status === 200 && typeof result.data.accountId !== 'undefined') merchantInfoId = req.session.merchantInfoId = result.data.accountId;
    let buyCount = 0;
    if (req.session.ycPay == true) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "yearcard/ycpayResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    // 新年卡支付结果
    else if (!result.data.orderInfoJson) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "parkCard/payResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    else {
      let orderInfo = JSON.parse(result.data.orderInfoJson);
      let payOrderNo = result.data.payOrderNo;
      console.log('=====================================支付回调接口orderInfo====================================');
      console.log(orderInfo);
      orderInfo.forEach(item => {
        buyCount += Number(item.buyCount);
      });
      let idArray = [];
      if (orderInfo.length > 0) {
        orderInfo.forEach(function (item) {
          idArray.push(item.id)
        })
      }
      console.log('测试微信支付推广----' + req.session.member.id)
      let requireArray = await getRequireArray({ result, orderInfo, merchantInfoId, buyCount, orderNo: payOrderNo, userId: req.session.member.id })
      let payDatas = await commonApi.apiRequestAll({
        ctx: {
          req,
          res
        },
        apiList: requireArray
      })
      for (var key in req.query) {
        req.query[key] = [req.query[key]];
      }

      commonApi.renderPage(req, res, "payResult", {
        title: "支付结果",
        data: [result, ...payDatas],
        payOrderNo,
        id: idArray.join(','),
        isWeixn: commonApi.isWxAli(req).isWx,
        isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
        isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
      })
    }
  })

  //支付宝支付回调
  router.get('/payPlat/result', async function (req, res, next) {
    let payOrderNo = req.query.out_trade_no || req.session.payOrderNo;
    let merchantInfoId = req.session.merchantInfoId;
    let result = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'pay', 'result'],
      data: {
        outTradeNo: payOrderNo,
        merchantInfoId: merchantInfoId
      }
    });
    // 判断是否开启自定义支付结果页
    let getUsePage = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'merchant', 'getUsePage'],
      data: {
        pageType: "paySuccessPage",
        useRange: "wap",
        merchantInfoId:result.data.accountId || req.session.merchantInfoId
      }
    });
    
    if (getUsePage.status === 200 && typeof getUsePage.data !== 'undefined'){
      res.redirect('/vue/pay/result?m_id='+ result.data.accountId + '&payOrderNo='+ result.data.payOrderNo)
      return;
    } 
    if (result.status === 200 && typeof result.data.accountId !== 'undefined') merchantInfoId = req.session.merchantInfoId = result.data.accountId;
    if (req.session.ycPay == true) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "yearcard/ycpayResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    // 新年卡支付结果
    else if (!result.data.orderInfoJson) {
      payOrderNo = result.data.payOrderNo;
      commonApi.renderPage(req, res, "parkCard/payResult", {
        title: "支付结果",
        data: [result],
        payOrderNo
      });
      return;
    }
    else {
      let orderInfo = JSON.parse(result.data.orderInfoJson);
      payOrderNo = result.data.payOrderNo;
      let buyCount = 0;
      orderInfo.forEach(item => {
        buyCount += Number(item.buyCount);
      });
      let idArray = [];
      if (orderInfo.length > 0) {
        orderInfo.forEach(function (item) {
          idArray.push(item.id)
        })
      }
      console.log('测试浏览器支付推广----' + req.session.member.id)
      let requireArray = await getRequireArray({ result, orderInfo, merchantInfoId, buyCount, orderNo: payOrderNo, userId: req.session.member.id })
      let payDatas = await commonApi.apiRequestAll({
        ctx: {
          req,
          res
        },
        apiList: requireArray
      })
      for (var key in req.query) {
        req.query[key] = [req.query[key]];
      }

      commonApi.renderPage(req, res, "payResult", {
        title: "支付结果",
        data: [result, ...payDatas],
        payOrderNo,
        id: idArray.join(','),
        isWeixn: commonApi.isWxAli(req).isWx,
        isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
        isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
      })
    }

  })

  // 微信支付回调
  router.get('/payPlat/Notify/:result', async function (req, res, next) {
    let orderNo = req.query.orderNo,
      merchantInfoId = req.session.merchantInfoId,
      result = {},
      idArray = [],
      payDatas = {};

    try {
      result = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['member', 'order', 'getPayOrder'],
        data: {
          payOrderNo: orderNo,
          merchantInfoId,
        }
      })
    } catch (error) {
      console.log(`getPayOrder::${error}`)
    }
    if (typeof result.data === 'object') {
      // 判断是否开启自定义支付结果页
      let getUsePage = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['main', 'merchant', 'getUsePage'],
        data: {
          pageType: "paySuccessPage",
          useRange: "wap",
          merchantInfoId:result.data.accountId || req.session.merchantInfoId
        }
      });
      
      if (getUsePage.status === 200 && typeof getUsePage.data !== 'undefined'){
        res.redirect('/vue/pay/result?m_id='+ result.data.accountId + '&payOrderNo='+ result.data.payOrderNo)
        return;
      } 

      let orderInfo = JSON.parse(result.data.orderInfoJson);
      if (result.status === 200 && typeof result.data.accountId !== 'undefined') merchantInfoId = req.session.merchantInfoId = result.data.accountId;
      if (orderInfo.length > 0) {
        orderInfo.forEach(function (item) {
          idArray.push(item.id)
        })
      }
      let buyCount = 0;
      orderInfo.forEach(item => {
        buyCount += Number(item.buyCount);
      });
      // 新年卡支付结果
      if (!result.data.orderInfoJson) {
        payOrderNo = result.data.payOrderNo;
        commonApi.renderPage(req, res, "parkCard/payResult", {
          title: "支付结果",
          data: [result],
          payOrderNo
        });
        return;
      }
      let requireArray = await getRequireArray({ result, orderInfo, merchantInfoId, buyCount, orderNo, userId: req.session.member.id })
      payDatas = await commonApi.apiRequestAll({
        ctx: {
          req,
          res
        },
        apiList: requireArray
      })
      for (var key in req.query) {
        req.query[key] = [req.query[key]];
      }
    }

    commonApi.renderPage(req, res, "payResult", {
      title: "支付结果",
      data: [result, ...payDatas],
      payOrderNo: orderNo,
      id: idArray.join(','),
      isWeixn: commonApi.isWxAli(req).isWx,
      isWx: commonApi.isWxAli(req).isWx ? 'T' : 'F',
      isAli: commonApi.isWxAli(req).isAliPay ? 'T' : 'F'
    })
  });

  // 获取卡券id
  router.get('/payPlat/getCardId', async function (req, res, next) {
    let { checkNo } = req.query;
    try {
      let getCardId = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['wxCardPack', 'getCardIdByCheckNo'],
        data: {
          checkNo: checkNo,
          merchantInfoId: req.session.merchantInfoId
        }
      });
      if (getCardId) {
        res.json(getCardId)
        // res.json({
        //   status: 200,
        //   message: '获取数据成功'
        // })
      }

    } catch (error) {
      res.json({
        status: 402,
        message: '数据加载异常'
      })
    }
  });

};

function getRequireArray({ result, orderInfo, merchantInfoId, buyCount, orderNo, userId }) {
  console.log('测试支付推广----' + userId)
  let requireArray = [{
    url: ['main', 'marketing', 'findBuySendRule'],
    data: {
      code: orderInfo[0].code,
      modelType: orderInfo[0].orderType,
      buyCount: buyCount,
      payTime: result.data.payTime,
      merchantInfoId: merchantInfoId
    },
    ignoreError: true
  },
  {
    url: ['main', 'merchant', 'findPayPageAd'],
    data: {
      merchantInfoId: merchantInfoId
    },
    ignoreError: true
  },
  {
    url: ['member', 'order', 'getRecommentProduct'],
    data: {
      payOrderNo: orderNo,
      merchantInfoId: merchantInfoId,
      leagureId: ''
    },
    ignoreError: true
  },
  {
    url: ['wxCardPack', 'getWxCardOrderListByPayOrderNo'],
    data: {
      payOrderNo: orderNo,
      merchantInfoId: merchantInfoId
    },
    ignoreError: true
  }]
  // 实名制补录信息
  if (typeof result.data.realNameFaceUrl !== 'undefined' && result.data.realNameFaceUrl === 'T') {
    requireArray.push({
      url: ['order', 'getDistinctOrderDetaiModel'],
      data: {
        orderNo: orderNo,
        type: 'payOrderNo'
      },
      method: 'post',
      ignoreError: true
    })
  }

  return requireArray
}

function sleep(timer) {
  return new Promise(resolve => setTimeout(resolve, timer));
}