const commonApi = require("./common/common");
const needle = require('needle');
// const qn = require('qn');
// const upload = require('./upload/multerUtil');
// const config = require('./upload/config').qiniu_config;
// const serverURL = require('./upload/config').serverUrl;
const Config = require('../config/index');
const jsSHA = require('jssha');

exports.mainRouter = function (router, common) {

  router.get('/order/:module/:id',async function (req, res, next) {
    let id = req.params.id,
      infoIds = req.query.infoIds,
      module = req.params.module,
      cacheInfo = req.session.cacheInfo,
      query = req.query,
      idList = '',
      modelCodes = '',
      parameter = {},
      lptId = 0,
      idName = '';
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    //没有缓存数据去重新登录
    if (module === 'theater') {
      cacheInfo = {
        nodata: true
      };
      // reObj.seatsData = req.session.seatsData;
      // reObj.areaData = req.session.areaData;
      if (!req.session.seatsData || !req.session.areaData) {
        res.redirect(`/list/${module}?m_id=${merchantInfoId}`);
        return false;
      }
    } else if (module !== "mealCoupon") {
      if (!cacheInfo) {
        res.redirect(`/list/${module}?m_id=${merchantInfoId}`);
        return false;
      }
      for (var i = 0, len = cacheInfo.item.length; i < len; i++) {
        idList += cacheInfo.item[i].id + ",";
        if (module === 'shop')
          modelCodes += cacheInfo.item[i].modelCode.split('-')[0] + ',';
      }
    } else {
      cacheInfo = {
        nodata: true
      };
      if (module === "mealCoupon") idList = query.couponId + ",";
    }

    switch (module) {
      case 'ticket':
        idName = 'merchantParkInfoId';
        parameter = {
          merchantParkTicketIds: idList,
          playDate: cacheInfo.playDate
        };
        break;
      case 'hotel':
        idName = 'merchantHotelInfoId';
        parameter = {
          merchantHotelRoomIds: idList,
          beginDate: cacheInfo.beginDate + ' 00:00:00',
          endDate: cacheInfo.endDate + ' 00:00:00',
        };
        break;
      case 'shop':
        idName = 'merchantMsdeInfoId';
        lptId = req.query.lptid;
        parameter = {
          merchantMsdeInfoId: id,
        };
        break;
      default:
        break;
    }
    var urlArr = [];
    if (module === 'mealCoupon') {
      urlArr = [{
        urlArr: ["repast", "detail", "main"],
        parameter: {
          id: id,
          merchantInfoId,
        }
      }, {
        urlArr: ["repast", "detail", "mealCoupon"],
        parameter: {
          id: query.couponId,
          merchantInfoId,
        }
      }, {
        urlArr: ["main", "cart", "list"],
        parameter: {
          merchantInfoId,
          userID: req.session.member.id,
          merchantInfoName: "1"
        }
      }]
    } else if (module === 'route') {
      urlArr = [{
        urlArr: [
          [module], "detail", "main"
        ],
        parameter: {
          id: id,
          merchantInfoId,
        }
      }]
    } else if (module !== 'theater') {
      urlArr = [{
        urlArr: [module, 'detail', 'main'],
        parameter: {
          [idName]: id
        }
      }, {
        urlArr: [module, 'order', 'main'],
        parameter: parameter
      }];
    }

    if (module === 'shop') {
      urlArr.shift();
      urlArr.shift();
      urlArr.push({
        urlArr: ['main', 'address', 'list'],
        parameter: {
          currPage: 0,
          pageSize: 1,
          merchantInfoId,
        }
      });

      urlArr.push({
        urlArr: ['member', 'order', 'getMerchantMdseDetailByCode'],
        parameter: {
          merchantInfoId,
          modelCodes: modelCodes,
        }
      });

      if (id.indexOf(',') === -1) {
        urlArr.push({
          urlArr: [module, 'order', 'selfPlace'],
          parameter: {
            merchantInfoId,
            mdseId: infoIds || id
          }
        });

      }
    } else {
      urlArr.push({
        urlArr: ['member', 'user', 'getInfoLists'],
        parameter: {
          merchantInfoId,
          leaguerId: req.session.member.id
        }
      })

    }
    if (module === 'ticket') {
      urlArr.push({
        urlArr: ['main', 'marketing', 'idCardServiceEnable'],
        parameter: {
          merchantId: merchantInfoId,
        },
        ignoreError: true,
        method: 'post'
      })
    }

    try {    
      let  getShowWholeMarket = await commonApi.apiRequest(
        {
          ctx: { req, res },
          url: ["main", "merchant", "showQyTab"],
          ignoreError:true,
          data: {
              merchantInfoId,
              leaguerInfoId:req.session.member.id
          }
        }
      );
      if (getShowWholeMarket.status === 200, getShowWholeMarket.message) {
        req.session.showWholeMarket = getShowWholeMarket.message;
      }
    } catch (error) {
      console.error(error)
    }

    common.commonRequest({
      url: urlArr,
      req: req,
      res: res,
      page: (module === 'ticket' || module === 'theater') ? 'newOrder' : 'order',
      title: merchantInfoId === '229' ? '预约订单' : common.pageTitle(module) + '订单',
      callBack: function (results, reObj) {
        if (module === 'theater') {
          reObj.seatsData = req.session.seatsData;
          reObj.areaData = req.session.areaData;
          // reObj.seatsOrderData = req.session.seatsOrderData;
          // reObj.cacheInfo = {};
        }

        reObj.cacheInfo = cacheInfo;
        reObj.member = req.session.member;
        reObj.module = module;
        reObj.isWx = commonApi.isWxAli(req).isWx ? 'T' : 'F';
        reObj.isAli = commonApi.isWxAli(req).isAliPay ? 'T' : 'F';
        if (module !== 'shop') {
          reObj.idList = idList;
        } else {
          reObj.lptId = lptId;
        }
        reObj.flag = req.query.flag;
        reObj.orderMold = req.query.mold;
      }
    });
  });
  // 省市区获取
  router.get('/order/getAdress', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['shop', 'order', 'address'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //获取邮费信息
  router.get('/order/getPostage', function (req, res, next) {
    let cacheInfo = req.session.cacheInfo;
    let areaCode = req.query.areaCode;
    let cityCode = areaCode.split(',')[1];
    let firstCode = cityCode.substring(0, 2);

    //直辖市选取省代码 
    switch (firstCode) {
      case '11':
        cityCode = "110000";
        break;
      case '12':
        cityCode = "120000";
        break;
      case '31':
        cityCode = "310000";
        break;
      case '50':
        cityCode = "500000";
        break;
      default:
        break;
    }

    let skuList = '';
    cacheInfo.item.map(item => {
      skuList += `${item.modelCode}-${item.num},`;
    })

    common.commonRequest({
      url: [{
        urlArr: ['shop', 'order', 'getPostage'],
        parameter: {
          areaCode: cityCode,
          modelCodes: skuList
        }
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });


  //订单提交
  router.post('/order/:module', async function (req, res, next) {
    var module = req.params.module,
      parameter = req.query,
      member = req.session.member;
    if (module == "logistics") {
      next();
      return false;
    }

    parameter.modelCodes = typeof parameter.modelCodes == "string" ? parameter.modelCodes : parameter.modelCodes.join(",");
    parameter.amounts = typeof parameter.amounts == "string" ? parameter.amounts : parameter.amounts.join(",");
    if (parameter.realNames) {
      parameter.realNames = typeof parameter.realNames == "string" ? parameter.realNames : parameter.realNames.join(",");
    }
    if (parameter.realIds) {
      parameter.realIds = typeof parameter.realIds == "string" ? parameter.realIds : parameter.realIds.join(",");
    }
    parameter.leaguerId = member.id;

    //是否参加活动
    if (parameter.couponCode) {
      parameter.marketingType = 1;
    } else if (parameter.groupCode) {
      parameter.marketingType = parameter.groupCode;
    } else {
      parameter.marketingType = 0;
    }
    switch (module) {
      case 'ticket':
        parameter.orderType = 'park';
        if (parameter.FsyyTimes) {
          var fsyyArray = [];
          if (typeof parameter.FsyyTimes === 'string') {
            fsyyArray.push(JSON.parse(parameter.FsyyTimes));
          } else {
            for (let i = 0, len = parameter.FsyyTimes.length; i < len; i++) {
              fsyyArray.push(JSON.parse(parameter.FsyyTimes[i]))
            }
          }
          parameter.FsyyTimes = JSON.stringify(fsyyArray);
        }
        break;
      case 'mealCoupon':
        parameter.orderType = 'eatery';
        break;
      case 'route':
        parameter.orderType = 'route';
        let tips = [];
        let lvArray = parameter.lvString ? JSON.parse(parameter.lvString) : []
        delete parameter.lvString;
        for (let key in parameter) {
          if (/^lv/.test(key)) {
            keyArray = key.split('_');
            let realKey = keyArray[0] ;
            let realIndex = keyArray[1];
            let thisItem = lvArray[realIndex]
            if (!parameter[key] && parameter[key] !== 0 && thisItem.isRequired) {
              return res.send([{
                status: 402,
                message:`${thisItem.title}为必传内容`
              }])
            }
            tips.push({
              title:thisItem.title, 
              type:realKey,
              tips:parameter[key]
            })
            delete parameter[key];
          }
        }
        parameter.tips = JSON.stringify(tips);
        break;
      case 'shop':
        parameter.orderType = 'mdse';
        if (!parameter.goodsWayType) {
          let areaCode = parameter.areaCode;
          let cityCode = areaCode.split(',')[1];
          let firstCode = cityCode.substring(0, 2);

          //直辖市选取省代码 
          switch (firstCode) {
            case '11':
              cityCode = "110000";
              break;
            case '12':
              cityCode = "120000";
              break;
            case '31':
              cityCode = "310000";
              break;
            case '50':
              cityCode = "500000";
              break;
            default:
              break;
          }

          parameter.areaCode = cityCode;
        }

        if (!Number(parameter.hasTab)) {
          delete parameter.hasTab;
          break;
        }
        parameter = handleShopData(parameter);
        break;
      case 'theater':
        let seatsInfo = null;
        let seatsOrderData = req.session.seatsOrderData || {};
        try {
          seatsInfo = await commonApi.apiRequest({
            ctx: {
              req,
              res
            },
            url: ["theater", "order", "lockStock"],
            method: "POST",
            data: Object.assign({
              buyerName: parameter.buyerName,
              idCard: parameter.buyerIdNo
            }, seatsOrderData)
          });

        } catch (error) {
          throw new Error("/theater/lock 出错了");
        }

        if (seatsInfo && seatsInfo.status !== 200) {
          return res.send([{
            state: 402,
            message: seatsInfo ? seatsInfo.message : '锁票失败'
          }])

        }
        parameter.marketingType = 1;
        parameter.orderType = 'theater_ticket';
        break;
      default:
        parameter.orderType = module;
        break;
    }

    //parameter.marketingType = parameter.couponCode ? 1 : 0;
    parameter.promoteCode = req.query.spreadCode || '';
    parameter.mkSpreadCode = req.session['mkSpreadCode_'+ req.session.merchantInfoId] || '';
    parameter.merchantInfoId = req.session.merchantInfoId;

    console.log(parameter)
    let orderInfo = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['order', 'saveOrder'],
      method: "post",
      data: parameter
    });

    if (parameter.orderflag == "cart" && orderInfo.status == "200") {
      let removeCart = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['main', 'cart', 'delete'],
        data: {
          mdseDetailIds: typeof parameter.msdeDetailIds != "string" ? parameter.msdeDetailIds.join(",") : parameter.msdeDetailIds,
          userID: req.session.member.id,
          merchantInfoId: req.session.merchantInfoId
        }
      });
    }
    orderInfo.modelCodes = parameter.modelCodes
    res.send([orderInfo]);
  });

  // 订单详细页
  router.get('/orderDetail/:page', function (req, res, next) {
    var page = req.params.page;
    commonApi.renderPage(req, res, 'order/' + page, {
      data: req.session[page],
      title: '订单'
    })
  });

  // 退款详情
  router.get('/order/refundDetail', async (req, res, next) => {
    var orderCode = req.query.orderCode;
    let refundDetail = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['member', 'order', 'refundDetail'],
      data: {
        orderCode: orderCode,
        merchantInfoId: req.session.merchantInfoId
      }
    });
    let skuInfo = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['member', 'order', 'getMerchantMdseDetailByCode'],
      data: {
        modelCodes: refundDetail.data.skuCode,
        orderCode: orderCode,
        merchantInfoId: req.session.merchantInfoId
      }
    });
    let mInfo = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'merchant', 'getMerchantInfo'],
      data: {
        merchantInfoId: req.session.merchantInfoId
      }
    });
    if (refundDetail && skuInfo && mInfo) {
      commonApi.renderPage(req, res, 'member/order/refundDetail', {
        title: "退款详情",
        data: refundDetail,
        mInfo: mInfo,
        skuInfo: skuInfo,
        id: req.query.id
      })
    }
  })

  // 发货单页面
  router.get('/order/logistics', async (req, res, next) => {
    var orderRefundNo = req.query.orderRefundNo;
    let expressInfo = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'express'],
      data: {
        merchantInfoId: req.session.merchantInfoId
      }
    });
    commonApi.renderPage(req, res, 'member/order/logistics', {
      title: "退货",
      merchantInfoId: req.session.merchantInfoId,
      orderRefundNo: orderRefundNo,
      expressInfo: expressInfo,
      orderCode: req.query.orderCode,
      id: req.query.id
    })
  }).post('/order/logistics', async (req, res, next) => {
    var params = req.query;
    params.merchantInfoId = req.session.merchantInfoId;
    let retreatSendGoods = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      method: "post",
      url: ['member', 'order', 'retreatSendGoods'],
      data: params
    });
    res.send([retreatSendGoods]);
  })
  //获取区域编码
  router.get('/order/getAreaCode', async (req, res, next) => {
    let merchantInfoId = req.query.m_id;
    common.commonRequest({
      url: [{
        urlArr: ['shop', 'order', 'address'],
        parameter: {
          merchantInfoId
        }
      }],
      req: req,
      res: res,
      isAjax: true
    });
  })

  router.get('/order/newOrder', function (req, res, next) {
    commonApi.renderPage(req, res, 'newOrder', {})
  })

  // 人脸识别路由
  router.post('/order/updata/aiBeeFace', async function (req, res, next) {
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    let photo = req.body.photo;
    let submitFaceData = {};
    try {
      submitFaceData = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        method: "post",
        url: ['main', 'face'],
        data: {
          merchantInfoId,
          photo,
          cropImg: true
        }
      });

    } catch (error) {
      res.status(200).send({
        status: 402,
        message: '获取数据错误'
      });
      return false;
    }

    if (submitFaceData.status === 200) {
      if (submitFaceData.data.error_no !== 0) {
        res.send({
          status: 402,
          message: submitFaceData.data.error_msg
        });
        return false;
      }

      var data = submitFaceData.data.data.croppedImage;
      upBase64Img(res, data)

    } else {
      res.status(200).send({
        status: 402,
        message: '获取数据错误'
      });
    }
  })


  // 身份证拍照路由
  router.post('/order/updata/idcard', async function (req, res, next) {
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    let image = req.body.photo;
    let submitFaceData = {};
    try {
      submitFaceData = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        method: "post",
        url: ['main', 'marketing', 'idCardDentificate'],
        data: {
          merchantInfoId,
          image,
          cropImg: true
        }
      });

    } catch (error) {
      res.status(200).send({
        status: 402,
        message: '获取数据错误'
      });
      return false;
    }

    res.json(submitFaceData)
  })

  //人脸识别补录
  router.post('/order/updata/reAddAiBeeFace', async function (req, res, next) {
    let merchantInfoId = req.body.m_id || req.session.merchantInfoId;
    let {
      faceUrl,
      payOrderNo
    } = req.body;
    let addFaceData = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      method: "post",
      url: ['member', 'order', 'addFaceUrl'],
      data: {
        merchantInfoId,
        faceUrl,
        payOrderNo,
      }
    });
    res.status(200).send(addFaceData)
  })

  // 实名制人脸识别
  router.post('/order/updata/realname', async function (req, res, next) {
    // { idCardNo1: faceUrl1, idCardNo2: faceUrl2 }
    let {
      idcard,
      faceUrlPath,
      orderNo,
      type
    } = req.body;
    let merchantInfoId = req.body.m_id || req.session.merchantInfoId;
    let faceUrls = JSON.stringify({
      [idcard]: faceUrlPath
    })
    let addFaceData = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      method: "post",
      url: ['order', 'orderDetaiModelAddFaceUrl'],
      data: {
        merchantInfoId,
        faceUrls: faceUrls,
        orderNo: orderNo,
        type: type
      }
    });
    res.status(200).send(addFaceData)
  })

  // 图片文件上传
  router.post('/order/updata/imgFile', async function (req, res, next) {
    upBase64Img(res, req.body.photo)
  })

  // 核对是否需要关注二维码
  router.get('/check/isFans', async function (req, res, next) {
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const [getByMerchantId, selectServiceUse] = await commonApi.apiRequestAll({
      ctx: { req, res },
      apiList: [{
        url: ['main', 'marketing', 'getByMerchantId'],
        data: {
          merchantInfoId
        }
      },
      {
        url: ['member', 'invoices', 'selectServiceUse'],
        data: {
          merchantInfoId,
          serviceType: 'wxAttractFans'
        }
      }
      ]
    })

    if (getByMerchantId.status === 200 && selectServiceUse.status === 200) {
      if (getByMerchantId.data && getByMerchantId.data.status === 'T' && selectServiceUse.data && selectServiceUse.data.wxAttractFans) {
        const userFollowCheck = await commonApi.apiRequest({
          ctx: {
            req,
            res
          },
          url: ['main', 'marketing', 'userFollowCheck'],
          data: {
            merchantInfoId
          }
        });

        if (userFollowCheck && userFollowCheck.status === 200) {
          if (!userFollowCheck.checkFlag) {
            const getWxPublicUrl = await commonApi.apiRequest({
              ctx: {
                req,
                res
              },
              url: ['main', 'marketing', 'getWxPublicUrl'],
              data: {
                merchantInfoId
              }
            });
            if (getWxPublicUrl && getWxPublicUrl.status === 200) {
              res.status(200).json(getWxPublicUrl);
              return false;
            } else {
              res.status(200).json({
                status: 402,
                message: getWxPublicUrl && getWxPublicUrl.message ? getWxPublicUrl.message : '获取getWxPublicUrl数据错误'
              });
              return false;
            }

          } else {
            res.status(200).json({
              status: 402,
              message: '用户已关注'
            });
            return false;
          }
        } else {
          res.status(200).json({
            status: 402,
            message: userFollowCheck && userFollowCheck.message ? userFollowCheck.message : '获取userFollowCheck数据失败'
          });
          return false;
        }
      } else {
        res.status(200).json({
          status: 402,
          message: '店铺未开通吸粉特权'
        });
        return false;
      }
    } else {
      res.status(200).json({
        status: 402,
        message: '获取getByMerchantId数据失败'
      });
      return false;
    }
  })

  // 获取公众号的二维码
  router.get('/check/getwxqr', async function (req, res, next) {
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const getWxPublicUrl = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['main', 'marketing', 'getWxPublicUrl'],
      data: {
        merchantInfoId
      }
    });

    if (getWxPublicUrl && getWxPublicUrl.status === 200) {
      res.status(200).json(getWxPublicUrl)
    } else {
      res.status(200).json({
        status: 402,
        message: getByMerchantId && getByMerchantId.message ? getByMerchantId.message : '获取getWxPublicUrl数据失败'
      })
    }
  })
};

function upBase64Img(res, base64) {
  needle('post', Config.baseURL + '/admin/api/ui/uplodeBase64', base64, { json: true })
    .then(function (response) {
      console.log(response.body)
      res.json(response.body)
    })
    .catch(function (err) {
      console.log(err)
      res.status(200).send({
        status: 402,
        message: '获取数据错误'
      });
    })
}

/**
 * 处理商品数据
 * 
 * @param {any} data 
 */
function handleShopData(data) {
  // goodsWayType
  let _obj = data,
    i = Number(data.goodsWayType);
  _obj.buyerAddr = _obj.buyerAddr instanceof Array ? _obj.buyerAddr[i] : _obj.buyerAddr;
  _obj.buyerMobile = _obj.buyerMobile instanceof Array ? _obj.buyerMobile[i] : _obj.buyerMobile;
  _obj.buyerName = _obj.buyerName instanceof Array ? _obj.buyerName[i] : _obj.buyerName;
  i
    ?
    delete _obj.areaCode :
    delete _obj.receiveTime;
  delete _obj.goodsWayType;
  return _obj;
}


function calcSignature(body, ts) {
  var str = JSON.stringify(body) + ts + "JvfD4SIzL7nm9od9fmosLkVakUoq1tqd";
  var shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(str);
  return shaObj.getHash('HEX');
}