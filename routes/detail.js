const commonApi = require("../routes/common/common");
exports.mainRouter = function (router, common) {
  // 详情页
  router.get("/detail/:module/:id(\\d+)/:code", async function (req, res, next) {
    const module = req.params.module,
      id = req.params.id,
      idconfig = {
        ticket: "merchantParkInfoId",
        hotel: "merchantHotelInfoId",
        shop: "merchantMsdeInfoId",
        group: "merchantMsdeInfoId",
        strategy: "merchantStrategyId"
      },
      moduleConfig = {
        ticket: "park",
        shop: "mdse",
        repast: "eatery"
      },
      merchantInfoId = req.query.m_id || req.session.merchantInfoId,
      isSpecial = req.query.isSpecial || "F"; // 特殊权限

    let code = req.params.code;
    if (process.env.NODE_ENV && module === 'ticket') {
      let queryString = '';
      for (let key in req.query) {
        var thisValue = req.query[key];
        queryString += `&${key}=${thisValue}`
      }
      res.redirect(`//${req.headers.host}/vue/detail/ticket?id=${id}&productCode=${code}${queryString}`);
      return;
    }

    let beginDate = ""; // | 当前时间 | 线路用

    let mainParameter = {
      [idconfig[module] || "id"]: id,
      merchantInfoId,
      isSpecial,
      // 下面为精准推荐参数
      payOrderNo: req.query.payOrderNo && req.query.payOrderNo !== "undefined" ? req.query.payOrderNo : "",
      recommendFlag: req.query.recommendFlag ? req.query.recommendFlag : "",
      leaguerId: req.session.member.id
    };

    var handArr = [
      {
        urlArr: ["main", "merchant", "getCorpCode"],
        parameter: { merchantInfoId },
      },
      {
        urlArr: ["main", "merchant", "showQyTab"],
        parameter: {
          merchantInfoId,
          leaguerInfoId:req.session.member.id || ''
        }
      }
    ]


    if (module === "mealCoupon") {
      handArr.push({
          urlArr: ["repast", "detail", "mealCoupon"],
          parameter: mainParameter
        });
    } else if (module === "strategy") {
      handArr.push({
          urlArr: [module, "detail", "main"],
          parameter: mainParameter
        })
    } else {
      handArr.push({
          urlArr: [module, "detail", "main"],
          parameter: mainParameter
        },
        {
          urlArr: ["main", "comment", "list"],
          parameter: {
            id,
            leaguerId: req.session.member.id,
            merchantInfoId: merchantInfoId,
            productType: moduleConfig[module] || module,
            count: 5
          }
        })
    }

    if (module === "shop") {
      var isMember = false; // 是否为会员商品
      var skuInfo = await commonApi.apiRequest({
        ctx:{req,res},
        url:["shop", "detail", "sku"],
        data: {
          merchantMsdeInfoId: id,
          merchantInfoId: merchantInfoId,
          isSpecial
        }
      })

      console.log(skuInfo)
      if (skuInfo.status === 200 && req.session.member.id) {
        let skuArray = skuInfo.data;
        let memberPrice = skuArray.map((sku) => {
          return `${sku.modelCode}:${sku.sellPrice}`
        })

        let memberPriceReq = await commonApi.apiRequest({
          ctx:{req,res},
          url:['member','discount'],
          data:{
            merchantInfoId,
            codePrice: memberPrice.join(',')
          }
        })

        console.log(memberPriceReq )
        if (memberPriceReq.status === 200 && memberPriceReq.message) {
          let resMemberPrice = memberPriceReq.message.split(',')
          resMemberPrice.forEach((mem,index) => {
            let _mem = mem.split(':');
            if (_mem[1] != skuArray[index].sellPrice) {
              isMember = true;
              skuArray[index].isMember = true;
              skuArray[index].memberPrice = _mem[1];
            }
            else {
              skuArray[index].isMember = false;
            }
          })
          skuInfo.data = skuArray;
          skuInfo.isMember = isMember;
        }
      }

    } else if (module === "route") {
      let nowDate = new Date();
      let beginYear = nowDate.getFullYear();
      let beginMonth = nowDate.getMonth() + 1;
      let beginDay = nowDate.getDate();
      let endMonth = beginMonth + 4;
      let endYear = beginYear;
      if (endMonth > 12) {
        endMonth -= 12;
        endYear = beginYear + 1;
      }
      beginDate = beginYear + "-" + change(beginMonth) + "-" + change(beginDay);
      handArr.push({
        urlArr: ["route", "detail", "listCalendarPriceMap"],
        parameter: {
          id: id,
          beginMonth: beginYear + "-" + change(beginMonth),
          endMonth: endYear + "-" + change(endMonth),
          merchantInfoId: merchantInfoId,
          isSpecial
        }
      });
    } else if (module === "ticket") {
      handArr.push({
        urlArr: ["route", "detail", "getRouteByMerchantParkInfoId"],
        parameter: {
          merchantInfoId: merchantInfoId,
          merchantParkInfoId: id,
          isSpecial
        }
      });
    }
    if (module === "mealCoupon") {
      var renderPage = "detail/mealCoupon";
    } else if (module === "theater") {
      var renderPage = "theater/theaterDetail";

      // try {
      //   const theaterMonth = await commonApi.apiRequest({
      //     ctx:{req,res,next},
      //     url: ['theater', 'detail','ableMonth'],
      //     data:{
      //       merchantInfoId,
      //       showCode:
      //     }
      //   })
      // } catch (error) {

      // }


    } else {
      var renderPage = module === "group" ? "group/productDetail" : "detail";
    }
    common.commonRequest({
      url: handArr,
      req: req,
      res: res,
      page: renderPage,
      title:
        merchantInfoId === "229"? "博物馆详情"  : common.pageTitle(module) + "详情",
      callBack: function (results, reObj) {
        reObj.module = module;
        reObj.merchantInfoId = merchantInfoId;
        reObj.isSpecial = isSpecial;

        if (results instanceof Array && results.length > 2) {
          if (results[0].status === 200 && results[0].data) {
            req.session.marketDisAccount = results[0].data.marketDisAccount;
          }
          if (results[1].status === 200 && results[1].message) {
            req.session.showWholeMarket = results[1].message;
          }
          results.splice(0,2)
        }

      
        if (module !== "guide" && module !== "strategy" && module !== "rentCar") {
          if (results[0].data) {
            req.session.location = {
              location: results[0].data.latitudeLongitude,
              address: results[0].data.addr
            };

            req.session.content = results[0].data.content;
            req.session.orderNotice = results[0].data.orderNotice;
          }

          if (module === "hotel") {
            results[0].data.beginDate = req.session.beginDate;
            results[0].data.endDate = req.session.endDate;
            results[0].data.numDays = req.session.numDays;
          } else if (module === "route") {
            reObj.beginDate = beginDate;
            if (results[2] && results[2].data) {
              let showDateArray = [];
              if (results[2].data.length > 0) {
                let dateArray = results[2].data[0].clCalendarDayVos;
                for (var i = 0, lens = dateArray.length; i < lens; i++) {
                  let thisSalePrice = dateArray[i].salePrice;
                  if (!thisSalePrice) {
                    for (var j = 1; j < results[2].data.length; j++) {
                      if (results[2].data[j].clCalendarDayVos[i].salePrice) {
                        thisSalePrice =
                          results[2].data[j].clCalendarDayVos[i].salePrice;
                        break;
                      }
                    }
                  }
                  showDateArray.push({
                    date: dateArray[i].date,
                    stock: dateArray[i].stock,
                    salePrice: thisSalePrice
                  });
                }
              }
              reObj.showDateArray = showDateArray;
            }
          } else if (module === "shop") {
            results.push(skuInfo)
          }
        }
      }
    });
  });

  //票型列表
  router.get("/detail/ticketItems", function (req, res, next) {
    req.session.ticketDate = req.query.playDate;
    common.commonRequest({
      url: [
        {
          urlArr: ["ticket", "detail", "productItems"],
          parameter: req.query
        }
      ],
      req: req,
      res: res,
      isAjax: true,
      callBack: function (results, reObj) {
        req.session.productItems = results[0].datas;
      }
    });
  });

  //房型列表
  router.get("/detail/roomItems", function (req, res, next) {
    req.session.beginDate = req.query.beginDate;
    req.session.endDate = req.query.endDate;
    req.session.numDays = req.query.numDays;
    delete req.query.numDays;
    //req.query.corpCode="cgb2cfxs";
    req.query.beginDate = req.query.beginDate + " 00:00:00";
    req.query.endDate = req.query.endDate + " 00:00:00";
    common.commonRequest({
      url: [
        {
          urlArr: ["hotel", "detail", "productItems"],
          parameter: req.query
        }
      ],
      req: req,
      res: res,
      isAjax: true,
      callBack: function (results, reObj) {
        req.session.productItems = results[0].datas;
      }
    });
  });

  // 分时预约
  router.get('/detail/timeReserveList', async function (req, res, next) {
    const { externalCode, startTime, endTime } = req.query;
    const merchantInfoId = req.session.merchantInfoId;
    let getTimeReserveList = await commonApi.apiRequest({
      ctx: {
        req,
        res
      },
      url: ['order', 'timeReserveList'],
      method: 'POST',
      data: {
        merchantInfoId,
        externalCode,
        startTime,
        endTime
      }
    });
    res.json(getTimeReserveList)
  })

  // 跟团游日历
  router.get("/routeDetail/:id/:code", async function (req, res, next) {
    let routeId = req.params.id;
    let productCode = req.params.code;
    let selectedDate = req.query.selectedDate; //选中日历
    let merchantInfoId = req.query.m_id;
    let monthFloorPrice = {}; //月最低价
    let calanderDate = {}; //日历信息
    let nowDate = new Date();
    let beginYear = nowDate.getFullYear();
    let beginMonth = nowDate.getMonth() + 1;
    let MonthSteep = 4; //月份间隔
    let beginDay = nowDate.getDate();
    let endMonth = beginMonth + MonthSteep;
    let endYear = beginYear;
    if (endMonth > 12) {
      endMonth -= 12;
      endYear = beginYear + 1;
    }
    beginDate = beginYear + "-" + change(beginMonth) + "-" + change(beginDay);
    try {
      calanderDate = await commonApi.apiRequest({
        ctx: { req, res },
        url: ["route", "detail", "listCalendarPriceMap"],
        data: {
          id: routeId,
          beginMonth: beginYear + "-" + change(beginMonth),
          endMonth: endYear + "-" + change(endMonth),
          merchantInfoId: merchantInfoId
        }
      });

      let MonthArray = [];
      let MonthPriceArray = [];
      if (calanderDate.data) {
        let handleCalendar = calanderDate.data[0].clCalendarDayVos;
        let nowIndex = 0;
        for (var a = 0; a < handleCalendar.length; a++) {
          if (handleCalendar[a].date === beginDate) {
            nowIndex = a;
          }
        }

        for (let i = 0; i < MonthSteep; i++) {
          let curMonth = (beginMonth + i) % 12 || 12;
          let stringMonth = change(curMonth);
          let MonthPeice = [];

          MonthArray.push(curMonth);
          for (let x = nowIndex; x < handleCalendar.length; x++) {
            if (handleCalendar[x].date.indexOf(stringMonth) === 5) {
              let thisSalePrice = handleCalendar[x].salePrice;
              if (!thisSalePrice && calanderDate.data.length > 1) {
                for (let j = 1; j < calanderDate.data.length; j++) {
                  if (calanderDate.data[j].clCalendarDayVos[x].salePrice) {
                    thisSalePrice =
                      calanderDate.data[j].clCalendarDayVos[x].salePrice;
                    break;
                  }
                }
              }
              if (thisSalePrice && handleCalendar[x].stock)
                MonthPeice.push(thisSalePrice);
            }
          }
          MonthPriceArray.push(MonthPeice);
          console.log(MonthPriceArray);
        }
        for (let i = 0; i < MonthArray.length; i++) {
          monthFloorPrice[MonthArray[i]] =
            MonthPriceArray[i].length > 0
              ? Math.min(...MonthPriceArray[i])
              : null;
        }
      }
    } catch (error) {
      throw new Error(`listCalendarPriceMap error::${error}`);
    }

    commonApi.renderPage(req, res, "route/routeChoiceDate", {
      title: "日期选择",
      routeId,
      productCode,
      calanderDate,
      selectedDate,
      monthFloorPrice
    });
  });

  // 相亲详细页
  router.get("/detail/:page", function (req, res, next) {
    var page = req.params.page;
    commonApi.renderPage(req,res,"detail/" + page,{
      data: page === "productItems" ? req.session.content : req.session[page],
      title: "详情"
    })
  });

  router.get("/theater/select", async function (req, res, next) {
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const { areaData, showName, sessionName, startTime } = req.session;
    const { areaCode, areaName, ticketCode } = req.query;
    if (!areaData) {      // 登录失效
      req.session.curUrl = '/list/theater?m_id=' + merchantInfoId;
      res.redirect('/login?m_id=' + merchantInfoId);
    }

    let seatsData = Object.assign(areaData, { startTime, showName, sessionName, areaCode, areaName });
    req.session.areaData = seatsData;
    try {
      let seatsInfo = await commonApi.apiRequest({
        ctx: { req, res },
        url: ["theater", "detail", "seats"],
        data: Object.assign(areaData, { ticketCode, sessionName, areaCode, merchantInfoId })
      });

      if (seatsInfo.data && seatsInfo.status === 200) {
        commonApi.renderPage(req, res, "theater/seatDetail", {
          title: '选择座次',
          seatsInfo,
          seatsData,
          sessionName,
          showName
        });
      } else {
        return next();
      }
    } catch (error) {
      throw new Error("/theater/select 出错了");
    }
  });

  router.post("/theater/lockStock", async function (req, res, next) {
    const areaData = req.session.areaData; // {playDate,sessionCode,theaterCode,areaCode,showCode,showModelCode}
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    if (!areaData) {      // 登录失效
      req.session.curUrl = '/list/theater?m_id=' + merchantInfoId;
      res.json({
        status: 400,
        message: '登录失效啦,快去登录吧'
      })
    }

    const seatsData = req.body; // {seats,ttList,merchantInfoId}
    seatsData.ttlist = seatsData.ttlist ? JSON.parse(seatsData.ttlist) : [];
    seatsData.seats = seatsData.seats ? JSON.parse(seatsData.seats) : [];
    let seats = [];

    req.session.seatsData = seatsData;

    for (var i = 0, les = seatsData.seats.length; i < les; i++) {
      seats.push({
        status: seatsData.seats[i].status,
        fid: seatsData.seats[i].fid,
        scol: seatsData.seats[i].sCol,
        srow: seatsData.seats[i].sRow,
        snRow: seatsData.seats[i].snRow,
        relRow: seatsData.seats[i].relRow,
        colRow: seatsData.seats[i].colRow,
        seatName: seatsData.seats[i].seatName,
        ticketId: seatsData.seats[i].ticketId,
      });
    }

    req.session.seatsOrderData = Object.assign(
      {
        ttList: JSON.stringify(seatsData.ttlist),
        seats: JSON.stringify(seats),
        orderType: "theater_ticket",
        leaguerId: req.session.member.id,
        theatreCode: areaData.theaterCode,
        price: seatsData.price,
        amount: seatsData.amounts,
      },
      areaData
    );

    res.json({
      status: 200,
      message: '数据已保存'
    })
  });

  // 剧院日历
  router.get('/theaterDetail/calendar', async function (req,res,next){
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const showCode = req.query.showCode || '';
    let month = req.query.month || '';

    if (!month) {
      let theaterAbleMouth = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['theater', 'detail', 'ableMonth'],
        data: {
          showCode,
          merchantInfoId
        }
      });

      if (typeof theaterAbleMouth !== 'undefined' && theaterAbleMouth.status === 200) {
        month = theaterAbleMouth.message;
      }
    }


    if (month) {
      let theaterCalendar = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['theater', 'detail', 'theaterCalendar'],
        data: {
          showCode,
          merchantInfoId,
          month: month // 2019-xx-xx
        }
      });

      res.json(theaterCalendar)

    } else {
      res.json({
        status:402,
        message:'三个月之内都没有场次信息'
      })
    }
  })

  router.get("/showMap", function (req, res, next) {
    var location = req.query.location,
      address = req.query.address;
      commonApi.renderPage(req,res,'detail/location',{
        data: { location, address },
        title: "详情"
      })
  });

  //信息缓存
  router.post("/cache/:mold", async function (req, res, next) {
    let mold = req.params.mold;
    let paramsData = JSON.parse(req.body.parmdata);
    let itemArray = null;
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    if (mold !== "route") {
      itemArray = paramsData.item.filter(function (item) {
        return Number(item.num) > 0;
      });
      paramsData.item = itemArray;
    } else {
      let totalPrice = 0;
      paramsData.item.forEach(item => {
        totalPrice += (Number(item.num) || 0) * (Number(item.price) || 0);
      });
      paramsData.totalPrice = totalPrice.toFixed(2);

      // 跟团游是否可下单判断
      let modelCodes = [];
      let moduleCode = paramsData.moduleCode
      for (let i = 0; i < paramsData.item.length; i++) {
          let thisItem = paramsData.item[i];
          modelCodes.push({[moduleCode]:thisItem.num})
      }
      let routeValidate = await commonApi.apiRequest({
          ctx: {
              req,
              res
          },
          url: ['route', 'detail', 'validateroute'],
          data: {
              startTime:paramsData.playDate,
              endTime:paramsData.playDate,
              // idCard:'',
              // mobile:'',
              orderType:'route',
              modelCodes:JSON.stringify(modelCodes),
          },
          method: "POST"
      });
      if (routeValidate && routeValidate.status !== 200) {
          res.status(200).json([routeValidate]);
          return false;
      }
    }

    if (mold === "ticket") {
      let modulecodes = [];
      for (let i = 0; i < paramsData.item.length; i++) {
        let thisItem = paramsData.item[i];
        modulecodes.push(thisItem.modelCode)
      }

      let ticketValidate = await commonApi.apiRequest({
        ctx: {
          req,
          res
        },
        url: ['ticket', 'detail', 'validateTicketStockPrice'],
        data: {
          merchantInfoId,
          codes: modulecodes.join(','),
          playDate: paramsData.playDate
        }
      });
      if (ticketValidate && ticketValidate.status !== 200) {
        res.status(200).json([ticketValidate]);
        return false;
      }

    } else {
      let realNameArray = [],
        otherArrray = [];
      for (let i = 0; i < paramsData.item.length; i++) {
        let thisItem = paramsData.item[i];
        thisItem.isRealName
          ? realNameArray.push(thisItem)
          : otherArrray.push(thisItem);
      }
      paramsData.item = otherArrray.concat(realNameArray);
    }


    req.session.cacheInfo = paramsData;

    if (mold === "cart") {
      var cartparameter = {
        merchantInfoId: req.session.merchantInfoId,
        userID: req.session.member.id,
        merchantInfoName: "111",
        merchantMdseInfoId: req.session.cacheInfo.item[0].merchantMsdeInfoId,
        productCode: req.session.cacheInfo.productCode,
        productName: req.session.cacheInfo.productName,
        salePrice: req.session.cacheInfo.item[0].sellPrice,
        productAmount: req.session.cacheInfo.item[0].num,
        specParam: req.session.cacheInfo.item[0].specParam,
        mdseDetailId: req.session.cacheInfo.item[0].msdeDetailId,
        selled: req.session.cacheInfo.item[0].selled,
        price: req.session.cacheInfo.item[0].price,
        priceShow: req.session.cacheInfo.item[0].priceShow,
        stockNum: req.session.cacheInfo.item[0].stockNum,
        num: req.session.cacheInfo.item[0].num,
        wapUrl: req.session.cacheInfo.wapUrl,
        modelCode: req.session.cacheInfo.item[0].modelCode,
        sellPrice: req.session.cacheInfo.item[0].sellPrice,
        prodFrom: req.session.cacheInfo.item[0].prodFrom
      };
      console.log(cartparameter);
      common.commonRequest({
        url: [
          {
            urlArr: ["main", "cart", "add"],
            parameter: cartparameter,
            method: "get"
          }
        ],
        req: req,
        res: res,
        isAjax: true
      });
    } else {
      res.json([{ status: 200 }]);
    }
  });


  router.get("/detail/strategy/:id/", function (req, res, next) {
    common.commonRequest({
      url: [
        {
          urlArr: ["strategy", "detail", "main"],
          parameter: {
            merchantStrategyId: req.params.id
          }
        }
      ],
      req: req,
      res: res,
      page: "detail",
      title: common.pageTitle("strategy") + "详情",
      callBack: function (results, reObj) {
        reObj.module = "strategy";
      }
    });
  });

  router.post("/detail/getQyyxPromoteBar", function (req, res, next) {
    let merchantInfoId = req.body.m_id || req.session.merchantInfoId;
    let businessType = req.body.module;
    let businessId = req.body.businessId;
    let id = req.body.id;
    // switch (businessType) {
    //     case "ticket":
    //         businessType = "park";
    //         break;
    //     case "shop":
    //         businessType = "mdse";
    //         break;
    //     case "theater":
    //         businessType = "theate";
    //         break;
    //     default:
    //         break;
    // }

    switch (businessType) {
      case "ticket":
          businessType = "0";
          break;
      case "room":
          businessType = "1";
          break;
      case "repast":
          businessType = "2";
          break;
      case "zyx":
          businessType = "3";
          break;
      case "route":
          businessType = "28";
          break;
      case "mdse":
      case "shop":
          businessType = "29";
          break;
      case "car":
          businessType = "12";
          break;
      case "theater":
          businessType = "30";
          break;
      case "park":
          businessType = "25";
          break;
      case "hotel":
          businessType = "26";
          break;
      case "eatery":
          businessType = "27";
          break;
      default:
          break;
    }
 
    common.commonRequest({
      url: [
        {
          // urlArr: ["main", "merchant", "getQyyxPromoteBar"],  //旧的
          urlArr: ["main", "merchant", "getQyyxPromoteCode"],
          parameter: {
            merchantInfoId,
            businessId,
            id,
            businessType
          },
          method: "GET"
        }
      ],
      req: req,
      res: res,
      isAjax: true
    })


  });

  router.post("/detail/placeByPlayDate", function (req, res, next) {
    common.commonRequest({
      url: [
        {
          urlArr: ["theater", "detail", "placeByPlayDate"],
          parameter: req.body,
          method: "GET"
        }
      ],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //获取演出区域信息
  router.get('/theater/show', function (req, res, next) {
    let query = req.query;
    req.session.areaData = req.query;
    query.merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    common.commonRequest({
      url: [{
        urlArr: ['theater', 'detail', 'getShowArea'],
        parameter: query
      }],
      req: req,
      res: res,
      title: '区域信息',
      page: 'theater/showDetail',
      callBack: function (results, reObj) {
        reObj.tcode = req.query.theaterCode;
        if (results[0].status == 200 && results[0].data && results[0].data.showResponseDto) {
          let showSessionInfo = results[0].data.showResponseDto.showSessionInfos.showSessionInfo;
          let minPrice = results[0].data.minPrice
          let aArr = [], ticketPrices = [];
          let cArr = [];
          for (let i = 0; i < showSessionInfo.length; i++) {
            if (req.query.sessionCode && (req.query.sessionCode == showSessionInfo[i].sessionCode)) {
              let canSale = showSessionInfo[i].canSales && showSessionInfo[i].canSales.canSale ? showSessionInfo[i].canSales.canSale : [];
              ticketPrices = canSale;
              // reObj.canSale = showSessionInfo[i].canSales.canSale;
              reObj.sessionName = showSessionInfo[i].sessionName;
              reObj.startTime = showSessionInfo[i].startTime;
              reObj.showName = showSessionInfo[i].showName;
              reObj.theaterName = showSessionInfo[i].theaterName;
              reObj.palyDate = showSessionInfo[i].palyDate;
              req.session.showName = showSessionInfo[i].showName;
              req.session.sessionName = showSessionInfo[i].sessionName;
              req.session.startTime = showSessionInfo[i].startTime;
              req.session.theaterName = showSessionInfo[i].theaterName;
              // 该遍历有误，不知为何这个写
              // for (let j = 0; j < canSale.length; j++) {
              //   let bArr = [];
              //   for (let k = 0; k < canSale[j].ticketList.length; k++) {
              //     let num = parseFloat(canSale[j].ticketList[k].showTicketModel.price);
              //     bArr.push(num);
              //   }
              //   if (bArr.length) {
              //     aArr.push(bArr);
              //   }
              // }
              //   for (let j = 0; j < canSale.length; j++) {
              //       let bArr = [];
              //       for (let k = 0; k < canSale[j].ticketList.showTicketModel.length; k++) {
              //           let num = parseFloat(canSale[j].ticketList.showTicketModel[k].price);
              //           bArr.push(num);
              //       }
              //       if (bArr.length) {
              //           aArr.push(bArr);
              //       }
              //   }
                for (let j = 0; j < canSale.length; j++) {
                    canSale[j].ticketPrices = {
                        lowPrice: minPrice[showSessionInfo[i].sessionCode+canSale[j].areaCode],
                    }
                }
            }
          }
          // aArr = [[1,3,6,8],[2,5,7,1],[9,6],[1]];

          // aArr.forEach((item, index) => {
          //   let obj = {};
          //   item = sortArr(item);
          //   obj = {
          //     lowPrice: item[0],
          //     highPrice: item[item.length - 1]
          //   }
          //   cArr.push(obj)
          // });
          // for (let i = 0; i < cArr.length; i++) {
          //   for (let j = 0; j < ticketPrices.length; j++) {
          //     ticketPrices[j].ticketPrices = cArr[i];
          //   }
          // }
          // 为什么放在循环外面？除非showSessionInfo的长度一直是1，否则数据遍历的有问题
          reObj.canSale = ticketPrices;
          console.log(ticketPrices);
        }
      }
    });
  });

  //获取座位分布图
  router.post('/theater/theaterPlaceByCode', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['theater', 'detail', 'theaterPlaceByCode'],
        parameter: req.body,
        method: 'GET'
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //套票子频道
  router.post('/detail/comboChild', function(req, res, next){
    common.commonRequest({
      url: [{
        urlArr: ['hotel', 'detail', 'listFamilyTicketByDetailShow'],
        parameter: req.body
      }],
      req: req,
      res: res,
      isAjax: true
    });
  })
};

function change(t) {
  if (t < 10) {
    return "0" + t;
  } else {
    return t;
  }
}

//数组排序
// function sortArr(arr){
//   let index = Math.floor(arr.length/2), leftArr = [], rightArr = [], temp = arr.splice(index, 1);
//   if(arr.length<=1){
//     return arr;
//   }
//   for(let i = 0; i < arr.length; i++){
//     if(arr[i] < temp){
//       leftArr.push(arr[i]);
//     }else{
//       rightArr.push(arr[i]);
//     }
//   }
//   return sortArr(leftArr).concat(temp, sortArr(rightArr));
// }
function sortArr(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
