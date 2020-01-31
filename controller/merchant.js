const commonApi = require("../routes/common/common");
const conJson = require("../routes/common/config.json");

const Merchant = {
    /**
     * 列表页数据处理
     */
    async list(req, res, next) {
        const module = req.params.module;
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let isSpecial = req.query.isSpecial || '';  // T 特权链接
        const [modelName = ''] = [req.query.modelName]; //搜索信息

        if ( process.env.NODE_ENV && module === 'ticket') {
            let queryString = '';
            for (let key in req.query) {
                var thisValue = req.query[key];
                queryString += `&${key}=${thisValue}`
            }
            res.redirect(`//${req.headers.host}/vue/list/ticket?${queryString}`);
            return;
        }

        let title = commonApi.pageTitle(module) + '列表';
        let datas = {
            title,
            module,
            merchantInfoId,
            marketDisAccount: req.session.marketDisAccount
        };
        if (module === 'hotel') {
            try {
                let [hotelLevel, hotelType] = await commonApi.apiRequestAll(
                    {
                        ctx: { req, res },
                        apiList: [
                            {
                                url: ["main", "changeList"],
                                data: {
                                    key: 'hotelLevel',
                                    merchantInfoId
                                },
                                ignoreError: true
                            },
                            {
                                url: ["hotel", 'list', "sourchType"],
                                data: {
                                    merchantInfoId
                                },
                                ignoreError: true
                            }
                        ]
                    }
                )
                datas.hotelLevel = hotelLevel;
                datas.hotelType = hotelType;

            } catch (error) {
                console.log('getSysParamByKey接口异常')
            }
        }
        else if (module === 'route') {
            let searchLabel = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['route', 'list', 'searchLabel'],
                data: {
                    merchantInfoId,
                }
            });
            datas.searchLabel = searchLabel;
        }
        
        // try {
        //     templateData = await commonApi.apiRequest({
        //         ctx: { req, res },
        //         url: ['main', 'merchant', 'getMerchantTemplateCustom'],
        //         data: {
        //             merchantInfoId: merchantInfoId
        //         }
        //     });
        // } catch (error) {
        //     throw new Error('模板信息获取错误');
        // }

        // if (templateData.data) {
        //     req.session.templateVersion = templateData.data.version; //版本
        //     if (templateData.data.version === 'old') {
        //         req.session.templateCode = templateData.data.templateVO.code;
        //         req.session.footerDatas = null;
        //     } else {
        //         let template = JSON.parse(templateData.data.templateVO.template);
        //         let hasFooter = false;
        //         template.forEach((item, index) => {
        //             if (item.type.indexOf('Footer__') === 0) {
        //                 hasFooter = true;
        //                 req.session.footerDatas = item;
        //                 req.session.templateCode = null;
        //             }
        //         })
        //         if (!hasFooter) {
        //             req.session.footerDatas = null;
        //             req.session.templateCode = 'MTI20180316172401';
        //         }
        //     }
        // }
        let bottomData = {};
        try {
            bottomData = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getUsePage'],
                data: {
                    merchantInfoId,
                    pageType: 'navigationPage',
                    useRange: 'wap'
                }
            });
        } catch (error) {
            console.log('getUsePage获取数据出错');
        }
        let footerData = bottomData.data ? JSON.parse(bottomData.data.content) : [];
        let ifshowFoot = false;
        if (footerData && footerData.range) {
            // footerData.range.forEach(function (item, index) {
            //     if (item == 'orderpage') {
            //         ifshowFoot = true
            //     }
            // });
            ifshowFoot = true;
            datas.footerData = footerData;
        }
        if (module === 'order') {
            if (!req.session.member) {
                res.redirect('/login?m_id=' + merchantInfoId);
                return;
            }
            datas.orderStatus = req.query.orderStatus || ''; //初始订单状态;
            datas.module = 'order';
            // datas.footerData = footerData;
            datas.isWx = commonApi.isWxAli(req).isWx ? 'T' : 'F';
            datas.isAli = commonApi.isWxAli(req).isAliPay ? 'T' : 'F';
        }
        if (module === 'strategy') {
            let strategylist = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['strategy', 'list', 'pagelist'],
                data: {
                    currPage: 1,
                    pageSize: 2,
                    merchantInfoId
                }
            });
            if (strategylist.data.rows.length == 1) {
                res.redirect('/detail/strategy/' + strategylist.data.rows[0].id + '?m_id=' + merchantInfoId);
                return false;
            }
        }
        //公园年卡]
        if (module === 'yearcard') {
            let cardList = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['yearcard', 'list', 'pagelist'],
                data: {
                    status: 'T',
                    currPage: 1,
                    pageSize: 6,
                    merchantInfoId
                }
            });
            if (cardList.data.rows.length == 1) {
                res.redirect('/detail/yearcard/' + cardList.data.rows[0].id + '?m_id=' + merchantInfoId);
                return false;
            }
        }

        if (module === 'theater') {
            let listDatas = await commonApi.apiRequest({
                ctx: { req, res },
                url: [module, 'list', 'pagelist'],
                data: {
                    currPage: 1,
                    pageSize: 6,
                    merchantInfoId,
                    orderType: 'default'
                }
            });
            if (listDatas.data.rows.length === 1) {
                res.redirect('/detail/' + module + '/' + listDatas.data.rows[0].id + '/page/?m_id=' + merchantInfoId);
                return false;
            }
        }

        datas.templateCode = req.session.templateCode;
        datas.modelName = modelName;
        datas.ifshowFoot = ifshowFoot;
        if (!!isSpecial) Object.assign(datas, { isSpecial });
        commonApi.renderPage(req, res, 'list', datas)
    },

    /**
     * ajax 动态加载产品列表
     */
    async pageList(req, res, next) {
        const module = req.params.module; //定义模块信息
        console.log(req.body);
        req.body.merchantInfoId = req.query.m_id || req.session.merchantInfoId; // url || redis 获取商户id

        let url = null, orderStatus = req.query.orderStatus;
        //配置接口地址
        switch (module) {
            case 'order':
                url = ['member', 'order', 'pagelist'];
                req.session.orderStatus = req.body.orderStatus || req.query.orderStatue || '';
                break;
            case 'commentList':
                url = ['main', 'comment', 'list'];
                break;
            default:
                url = [module, 'list', 'pagelist'];
                break;
        }

        if (orderStatus == "0" && module === "order") {
            url = ['member', 'order', 'payorder'];
            req.body.payStatus = 0;
        }
        //年卡状态参数处理
        if (module === 'yearcard') {
            req.body.status = 'T'
        }
        //产品参数处理
        switch (module) {
            case 'hotel':
                req.session.beginDate = req.body.beginDate;
                req.session.endDate = req.body.endDate;
                req.session.numDays = req.body.numDays;
                break;
            case 'shop':
                console.log(req.body);
                break;

            case 'theater':
                req.body.orderType = 'default';
                break;
            case 'order':
                req.body.leaguerId = req.session.member.id;

                break;
            default:
                break;
        }
        //请求列表信息
        let lists = await commonApi.apiRequest({
            ctx: { req, res },
            url,
            data: req.body
        });

        console.log('================加载列表===============');

        res.send(lists);

    },

    async commentList(req, res, next) {
        let { module, id } = req.params;
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let cmmentList = null;
        let moduleConfig = {
            ticket: "park",
            shop: "mdse",
            repast: "eatery"
        };
        try {
            cmmentList = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['main', 'comment', 'list'],
                data: {
                    id: id,
                    merchantInfoId,
                    productType: moduleConfig[module] || module,
                    leaguerId: req.session.member.id
                }
            });
        } catch (error) {
            console.log('获取getcomment接口异常!' + error)
            cmmentList = {
                status: 402,
                data: []
            }
        }
        cmmentList.title = '评论列表';
        commonApi.renderPage(req, res, 'commentList', cmmentList)
    }

};

module.exports = Merchant;