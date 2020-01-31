const Main = require('../controller/main');
const newMain = require('../controller/newmain');
const Login = require('../controller/login');
const Group = require('../controller/group');
const commonApi = require("./common/common");

exports.mainRouter = function (router, common) {
  // 首页
  // router.get(['/', 'index'], Main.newHome);
  router.get(['/', 'index'], newMain.newHome);

  //自定义页
  router.get('/custompage', newMain.custompage);

  //测试老版本店铺（在没有兼容老版本数据的情况下 测试人员测试所用）
  router.get('/oIndex', Main.newHome);

  // 静态测试页面
  router.get('/test/camera', async function (req, res) {
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    commonApi.renderPage(req, res, 'camera', {
      merchantInfoId
    })
  });
  router.get('/test/index', async function (req, res) {
    common.commonRequest({
      url: [{
        urlArr: ['main', 'merchant', 'test'],
        parameter: {}
      }],
      req: req,
      res: res,
      page: 'aliOpen'
    });

  });

  //  首页预览
  router.get('/showNewIndex', Main.showNewIndex);

  //保存用户访问记录
  router.get('/main/saveVisitRecord', function (req, res, next) {
    let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    common.commonRequest({
      url: [{
        urlArr: ['member', 'saveVisitRecord'],
        parameter: {
          merchantInfoId,
          leaguerId: req.session.member.id
        }
      }],
      req: req,
      res: res,
      isAjax: true
    });

  });

  //重定向新地址
  router.get('/redirctNewUrl', function (req, res, next) {
    let newUrl = decodeURIComponent(req.query.reUrl);
    res.redirect(newUrl);
  })

  // vue数据保存
  router.get('/merchant/api/node/changeInfo', async function (req, res, next) {
    const  { merchantInfoId, marketDisAccount, token , leaguerId, adr} = req.query;

    try {
      console.log('---------------------------------vue保存数据--------------------------------------')
      let updateInfo = '';
      if (merchantInfoId && merchantInfoId !== 'undefined') {
        req.session.merchantInfoId = merchantInfoId;
        updateInfo += 'merchantInfoId-';
        console.log(req.session.merchantInfoId)
      }
      if (marketDisAccount) {
        req.session.marketDisAccount = req.query.marketDisAccount;
        updateInfo += 'marketDisAccount-';
        console.log(req.session.marketDisAccount)
      }

      // 用户本机ip
      if (adr) {
        updateInfo +='adr-';
        req.session.userIp = adr
      }
      
      if (token && (token !== req.session.token)) {
        req.session.token = token;
        console.log(req.session.token)
        updateInfo +='token,';
        let member = await commonApi.apiRequest({
          ctx: { req, res },
          url: ['member', 'info'],
          data: {
              leaguerId : leaguerId,
              merchantInfoId:merchantInfoId ||res.session.merchantInfoId,
          }
        })
        if (typeof member !== 'undefined' && member.status === 200) {
            req.session.member = member.data;
            console.log(req.session.member)
            updateInfo += 'member,';
            res.json({
              status: 200,
              message: '保存数据'+updateInfo+'成功'
            })
        } else {
          console.log(req.session.token)
          res.json({
            status: 200,
            message: '保存数据'+updateInfo+'成功'
          })
        }
        
      } else {
        res.json({
          status: 200,
          message: '保存数据'+updateInfo+'成功'
        })
      }

    } catch (error) {
      res.json({
        status: 402,
        message: error
      })
    }
  });

  // 登陆页面
  router.get('/login', Login.login);

  //第三方授权回调处理
  router.get('/authLogin', Login.authLogin);

  //支付宝授权回调错误处理
  router.get('/authLogin/aliLoginFail', Login.aliLoginFail);

  //注册
  router.get('/register', Login.register);

  //查看用户协议
  router.get('/register/protocol', function (req, res, next) {
    commonApi.renderPage(req,res,page,{
      title: '注册协议'
    })
  });


  /**
   * 用户注册来源
   * WEIXIN：微信
   * ALI：支付宝（阿里）
   * PC:pc端
   * WAP：wap端
   */
  router.get('/signIn', function (req, res, next) {
    req.query.channl = 'WAP';
    req.query.merchantInfoId = req.query.m_id;
    delete req.query.m_id;

    common.commonRequest({
      url: [{
        urlArr: ['member', 'register'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //登录
  router.get('/leaguerLogin', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'main'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });
  //手机号快捷登录
  router.get('/phoneNumberLogin', function (req, res, next) {
    req.query.channl = 'WAP';
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'leaguerMobileLogin'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });


  // 发送验证码
  router.post('/checkCode', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'sendCheckCode'],
        parameter: req.body
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  // 获取图片验证码
  router.get('/getImageCode', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'setImageCode'],
        parameter: req.query,
        method:"GET"
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });



  // 注销用户
  router.get('/loginOut', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'logout']
      }],
      req: req,
      res: res,
      isAjax: true,
      callBack: function (results, reqs, resp, handTag) {
        res.cookie('token','');
        req.session.destroy()
      }
    });
  });

  //忘记密码
  router.get('/forgetPassword', function (req, res, next) {
    let merchantInfoId = req.query.m_id;
    commonApi.renderPage(req,res,"pwd1",{
      title:'忘记密码',
      merchantInfoId,
    })
  });

  //核对验证码是否正确
  router.get('/checkPhoneCode', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'checkPhoneCode'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //打开重置密码页面
  router.get('/resetPassword', function (req, res, next) {
    let merchantInfoId = req.query.m_id;
    commonApi.renderPage(req,res,'pwd2',{
      title: '忘记密码',
      id: req.query.id,
      merchantInfoId
    })
  });

  //设置新密码
  router.get('/setNewPassword', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'resetPwd'],
        parameter: req.query,
        method: "POST"
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //无密登录
  router.get('/fastregByAccount', function (req, res, next) {
    req.query.channl = 'WAP';
    common.commonRequest({
      url: [{
        urlArr: ['member', 'login', 'fastregByAccount'],
        parameter: req.query
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //错误处理
  router.get('/error', function (req, res, next) {
    commonApi.renderPage(req, res, 'error', {
      title: "错误页",
      message: req.flash('message').toString(),
    })
  });

  router.get('/error404', function (req, res) {
    commonApi.renderPage(req, res, 'error404', {
      title: "404",
      message: req.flash('message').toString(),
    })
  });

  // 团购
  router.get('/group/detail/:id/:code', Group.detail);

  // 团购订单详情
  router.get('/group/orderDetail/:id', Group.orderDetail);

  //微信分享
  router.get("/group/wxshare", Group.wxShare);
  //微信卡包
  router.get("/group/wxCard", Group.wxCard);

  // 团购订单列表
  router.get('/group/orderList', Group.renderListPage);
  router.post('/group/orderList', Group.renderList);

  // 下单确认
  router.get('/group/toOrder', Group.orderPay);

  // 订单支付
  router.get('/group/orderPay', Group.payResult);
  // 订单支付
  router.get('/group/payResult', Group.toOrder);


  // 获取收货地址
  router.get('/address/list', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['main', 'address', 'list'],
        parameter: req.query
      }],
      req: req,
      res: res,
      page: 'address/ajaxList',
    });
  });

  router.post('/address/save', function (req, res, next) {

    req.body.areaCode = `${req.body.province},${req.body.city},${req.body.area}`;
    delete req.body.province;
    delete req.body.city;
    delete req.body.area;

    common.commonRequest({
      url: [{
        urlArr: ['main', 'address', 'save'],
        parameter: req.body
      }],
      req: req,
      res: res,
      isAjax: true,
      callBack: function (results, reqs, resp, handTag) {
        console.log(results)
      }
    });
  });

  router.post('/address/delete', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['main', 'address', 'delete'],
        parameter: req.body
      }],
      req: req,
      res: res,
      isAjax: true,
      callBack: function (results, reqs, resp, handTag) {
        console.log(results)
      }
    });
  });

  router.get('/totalPerson', function (req, res, next) {
    common.commonRequest({
      url: [{
        urlArr: ['member', 'totalPerson'],
        parameter: {
          merchantInfoId: req.session.merchantInfoId
        }
      }],
      req: req,
      res: res,
      isAjax: true
    });
  });

  //跳转中控验证
  // router.get('/gotoPublic', function(req, res, next){
  //     common.commonRequest({
  //         url:[{
  //             urlArr: ['main','gotoPublic'],
  //             parameter: {
  //                 merchantId: req.query.merchantId
  //             }
  //         }],
  //         req: req,
  //         res: res,
  //         isAjax:true
  //     })
  // });
  // 获取店铺信息
  router.get('/wxshare/getMerchantInfo', async function (req, res, next) {
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const getMerchantInfo = await commonApi.apiRequest({
      ctx: { req, res, next },
      url: ["main", "merchant", "getMerchantInfoById"],
      data: {
        merchantInfoId,
      }
    });

    res.json(getMerchantInfo);
  });
  // 获取微信分享签名
  router.get('/wxshare/getWxSignature', async function (req, res, next){
    const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    const getWxSignature = await commonApi.apiRequest({
      ctx: {req,res,next},
      url: ["main", "merchant", "getWxSignature"],
      data: {
        merchantInfoId,
        url:req.query.url
      }
    });

    res.json(getWxSignature);
  });




    //判断是否全员
    router.post('/checkUserPromoter', function (req,res,next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'merchant', 'checkUserPromoter'],
                parameter: {
                    leaguerId: req.session.member.id || ''
                }
            }],
            method: 'post',
            req: req,
            res: res,
            isAjax: true
        });
    });
    //是否开启全员注册 || 全员绑定账号
    router.post('/getCorpConfig',function (req,res,next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'merchant', 'getCorpConfig'],
                parameter: {
                    leaguerId: req.session.member.id || '',
                    leaguerInfoId: req.session.member.id || ''
                }
            }],
            method: 'post',
            req: req,
            res: res,
            isAjax: true
        });
    });

    //全员一键注册
    router.post('/createUserAuth', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'merchant', 'createUserAuth'],
                parameter: {
                    // accType:3
                }
            }],
            method: 'post',
            req: req,
            res: res,
            isAjax: true
        });
    });
    //绑定全员账号--页面
    router.get('/marketing', function (req, res, next) {
        const merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        if (!req.session.member.id) {
            req.session.curUrl = req.originalUrl;
            res.redirect('/login?m_id=' + merchantInfoId);
            return false;
        }
        req.session.curUrl = req.originalUrl;
        commonApi.renderPage(req,res,'bindMarketing',{
            data: {  },
            title: "绑定"
        })
    });
    //绑定全员账号--绑定
    router.post('/bindUserAuth', function (req, res, next) {
        common.commonRequest({
            url: [{
                urlArr: ['main', 'merchant', 'bindUserAuth'],
                parameter: {
                    accName: req.body.accName,
                    accPwd: req.body.accPwd,
                    // accType:3
                }
            }],
            method: 'post',
            req: req,
            res: res,
            isAjax: true
        });
    });


};