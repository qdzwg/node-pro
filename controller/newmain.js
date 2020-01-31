const commonApi = require("../routes/common/common");
const newMain = {

    /**
     * 首页请求数据处理;
     * @param {any} req
     * @param {any} res
     * @param {any} next
     */

    // async newHome(req, res, next) {
    //     let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
    //     req.session.curUrl = req.originalUrl; //路由拦截,跳转前储存地址
    //     res.redirect(`//${req.headers.host}/vue${req.originalUrl}`)
    // },
    async newHome(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        if (process.env.NODE_ENV) {      
            req.session.curUrl = req.originalUrl; //路由拦截,跳转前储存地址
            return res.redirect(`//${req.headers.host}/vue${req.originalUrl}`)
        }       

        let beginTime = new Date().getTime();
        let newtemplateData = {};
        if (typeof merchantInfoId === 'string' && (merchantInfoId.trim() === "undefined" || isNaN(merchantInfoId))) {
            merchantInfoId = '';
        }
        if (!merchantInfoId) {
            let getSelfDomainUrl = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getSelfDomainUrl'],
                data: {
                    domain: req.host
                },
                ignoreError: true
            });
            if (typeof getSelfDomainUrl !== 'undefined' && getSelfDomainUrl.status === 200) {
                res.redirect(getSelfDomainUrl.message);
            } else {
                return next();
            }
            getSelfDomainUrl = null;
        }
        try {
            newtemplateData = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getUsePage'],
                data: {
                    merchantInfoId,
                    pageType: 'mianPage',
                    useRange: 'wap'
                }
            });
        } catch (error) {
            console.log(error)
        }
        if (newtemplateData.status == 200 && newtemplateData.data) {
            let title = newtemplateData.data.renovationPageName, pageBackground = newtemplateData.data.renovationPageBack, pageBackFlag = newtemplateData.data.pageBackFlag, renovationPageDescribe = newtemplateData.data.renovationPageDescribe;
            let moduleDatas = JSON.parse(newtemplateData.data.content);
            //兼容老版本自定义首页数据
            let comList = [];
            let flag = true; //用来判断是老版本是新版本
            moduleDatas.forEach((item, index) => {
                let obj = {};
                if (item.type == "Banner__swiper1") {
                    flag = false;
                    //轮播图-banner1 老版本中的外链转换成自定义外链
                    obj.type = "banner1";
                    obj.imgFill = "fill";
                    obj.list = item.data.map((it, index) => {
                        return {
                            picAddr: it.picAddr,
                            title: it.title,
                            linkUrl: "customlink",
                            customLinkurl: item.picLink,
                            customLinkurlType: "http",
                            customPageId: "",
                            customPageName: ""
                        };
                    });
                    comList.push({
                        category: "banner",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Bill__normal") {
                    //轮播图-banner2
                    flag = false;
                    obj.type = "banner2";
                    obj.imgFill = "fill";
                    obj.list = item.data.map((it, index) => {
                        return {
                            picAddr: it.picAddr,
                            title: it.title,
                            linkUrl: "customlink",
                            customLinkurl: item.picLink,
                            customLinkurlType: "http",
                            customPageId: "",
                            customPageName: ""
                        };
                    });
                    comList.push({
                        category: "banner",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Nav__normal") {
                    //导航1
                    flag = false;
                    obj.type = "navigation1";
                    obj.lineNum = "4";
                    obj.backgroundColor = "#fff";
                    obj.textColor = "#000";
                    obj.list = item.data.map((it, i) => {
                        return {
                            picAddr: it.picAddr,
                            title: it.title,
                            linkUrl: it.businessType,
                            customLinkurl: "",
                            customPageId: "",
                            customPageName: "",
                            customLinkurlType: "http"
                        };
                    });
                    comList.push({
                        category: "navigation",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Nav__normal2") {
                    //导航2
                    flag = false;
                    obj.type = "navigation2";
                    obj.backgroundColor = "#fff";
                    obj.lineNum = "4";
                    obj.textColor = "#000";
                    obj.list = item.data.map((it, i) => {
                        return {
                            picAddr: it.picAddr,
                            title: it.title,
                            linkUrl: it.businessType,
                            customLinkurl: "",
                            customPageId: "",
                            customPageName: "",
                            customLinkurlType: "http"
                        };
                    });
                    comList.push({
                        category: "navigation",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Search__normal") {
                    //  { "type": "search1", "height": 33, "textColor": "#413838", "position": "left",
                    // "hostWordList": [ { "hotWord": "" } ], "placeholder": "", "backgroundColor": "#fff", "borderColor": "#cbcbcb" }
                    //搜索框
                    flag = false;
                    obj.type = "search1";
                    obj.height = 33;
                    obj.textColor = "#413838";
                    obj.position = "left";
                    obj.hostWordList = [{ hotWord: "" }];
                    obj.placeholder = "";
                    obj.backgroundColor = "#fff";
                    obj.borderColor = "#cbcbcb";
                    comList.push({
                        category: "search",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "ProductList__normal") {
                    //产品分组
                    flag = false;
                    obj.type = "productGroup1";
                    obj.menuType = "type1";
                    obj.pageInteraction = "type1";
                    obj.listType = "type1";
                    obj.list = item.data;
                    comList.push({
                        category: "productGroup",
                        hideBottom: false,
                        data: obj
                    });
                } else if (
                    item.type == "Product__normal" ||
                    item.type == "Product__normal2"
                ) {
                    //产品
                    //  { "listType": "type1", "productTagShow": true,
                    //  "productTag": "", "tagUrl": "", "list": []
                    flag = false;
                    obj.listType = "type1";
                    obj.productTagShow = true;
                    obj.productTag = "type1";
                    obj.tagUrl = "";
                    obj.list = item.data.list;
                    comList.push({
                        category: "product",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Header__logo") {
                    // console.log("asdad")
                    //头部
                    // "name": "", "textColor": "#999",
                    //  "introduction": "", "tel": "", "logoUrl": "", "backUrl": ""
                    flag = false;
                    obj.name = item.data.name;
                    obj.textColor = "#999";
                    obj.introduction = item.data.intro;
                    obj.tel = item.data.tel;
                    obj.logoUrl = item.data.logoUrl;
                    obj.backUrl = "";
                    comList.push({
                        category: "shopinfo",
                        hideBottom: false,
                        data: obj
                    });
                } else if (item.type == "Footer__normal") {
                    //老版本的头尾都不要
                    flag = false;
                }
            });

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
                console.log(error);
            }
            let footerData = null;
            let ifshowFoot = false;
            if (bottomData.data && bottomData.data.content)
                footerData = JSON.parse(bottomData.data.content);

            if (footerData && footerData.range) {
                footerData.range.forEach(function (item, index) {
                    if (item == 'homepage') {
                        ifshowFoot = true
                    }
                });
            }
            if (flag) {
                commonApi.renderPage(req, res, 'newmain', {
                    title: title,
                    merchantInfoId: merchantInfoId,
                    pageBackground: pageBackground,
                    pageBackFlag: pageBackFlag,
                    renovationPageDescribe: renovationPageDescribe,
                    newtemplateData: moduleDatas,
                    footerData: footerData,
                    module: 'index',
                    ifshowFoot: ifshowFoot
                });
            } else {
                commonApi.renderPage(req, res, 'newmain', {
                    title: title,
                    merchantInfoId: merchantInfoId,
                    pageBackground: pageBackground,
                    pageBackFlag: pageBackFlag,
                    renovationPageDescribe: renovationPageDescribe,
                    newtemplateData: comList,
                    footerData: footerData,
                    module: 'index',
                    ifshowFoot: ifshowFoot
                });
            }
        } else {
            let templateCode = 'MTI20180316172401';
            let templateInfo = {};
            let findPicInfo = {};
            let listMerchantPushInfo = {};
            let getMerchantTemplateCode = {};
            try {
                templateInfo = await commonApi.apiRequest({
                    ctx: {
                        req,
                        res
                    },
                    url: ['main', 'merchant', 'getMerchantTemplateCustom'],
                    data: {
                        merchantInfoId
                    }
                });
            } catch (error) {
                throw new Error(error);
            }
            if (templateInfo.data) {
                if (templateInfo.data.version === 'old') {
                    templateCode = templateInfo.data.templateVO.code;
                    req.session.templateCode = templateCode;
                    req.session.footerDatas = null;
                    //获取首页数据
                    try {
                        [findPicInfo, listMerchantPushInfo] = await commonApi.apiRequestAll({
                            ctx: { req, res, next },
                            apiList: [{
                                url: ['main', 'findPicInfo'],
                                data: {
                                    merchantInfoId,
                                    adType: "main_page_top,main_page_fix"
                                }
                            }, {
                                url: ['main', 'merchant', 'listMerchantPushInfo'],
                                data: {
                                    merchantInfoId,
                                    templementId: templateCode
                                },
                                ignoreError: true
                            }]
                        });

                    } catch (error) {
                        console.error(`首页获取模板信息::${error}`);
                    }
                    let endTime = new Date().getTime();
                    console.log('(timeDigest-total,' + req.originalUrl + ',' + (endTime - beginTime) + ')');
                    commonApi.renderPage(req, res, 'test', {
                        title: '首页',
                        data: [findPicInfo, listMerchantPushInfo, getMerchantTemplateCode],
                        templateCode
                    })

                } else {
                    title = templateInfo.data.templateVO.name || '首页';
                    req.session.templateCode = null;
                    let template = JSON.parse(templateInfo.data.templateVO.template);
                    let footerDatas = {};
                    let hasFooter = false;
                    let pruductListDatas = [];
                    let apilists = [];

                    template.map((item, index) => {
                        if (item.type.indexOf('Footer__') === 0) {
                            footerDatas = item;
                            hasFooter = true;
                            req.session.footerDatas = footerDatas;
                            req.session.templateCode = null;
                        }
                        if (item.type.indexOf('Product__') === 0) {
                            if (item.data.list.length > 0) {
                                let idList = [];
                                item.data.list.map((_item) => {
                                    idList.push(_item.productId);
                                });
                                apilists.push({
                                    url: ['main', 'merchant', 'listMerchantProduct'],
                                    data: {
                                        merchantInfoId,
                                        id: idList.join(',')
                                    }
                                });
                                pruductListDatas.push({
                                    index: index,
                                    idList: idList.join(',')
                                });
                            }
                        }
                        else if (item.type.indexOf('ProductList__') === 0) {
                            if (item.data.length > 0) {
                                let producListIds = [];
                                item.
                                    data.map((_item, index) => {
                                        if (_item.data.length > 0) {
                                            let idList = [];
                                            _item.data.map((__item) => {
                                                idList.push(__item.productId);
                                            })
                                            apilists.push({
                                                url: ['main', 'merchant', 'listMerchantProduct'],
                                                data: {
                                                    merchantInfoId,
                                                    id: idList.join(',')
                                                }
                                            });
                                            producListIds.push({
                                                index,
                                                idList: idList.join(',')
                                            })
                                        }
                                    })
                                pruductListDatas.push({
                                    index: index,
                                    idList: producListIds
                                })
                            }
                        }
                    }, this);
                    if (!hasFooter) {
                        req.session.footerDatas = null;
                        req.session.templateCode = 'MTI20180316172401';
                    }
                    let reqDatas = await commonApi.apiRequestAll({
                        ctx: { req, res },
                        apiList: apilists
                    })

                    let num = 0;
                    pruductListDatas.map((item, index) => {
                        if (typeof item.idList === 'string') {
                            template[item.index].data.list = reqDatas[num++].data;
                        } else {
                            item.idList.map((_item) => {
                                template[item.index].data[_item.index].data = reqDatas[num++].data;
                            })
                        }
                    });
                    commonApi.renderPage(req, res, 'main', {
                        title: title,
                        modules: template,
                        footerDatas,
                        templateCode
                    })
                    reqDatas = null;
                }
            }
        }
    },

    async custompage(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId, id = req.query.id;

        if (process.env.NODE_ENV) {
            req.session.curUrl = req.originalUrl; //路由拦截,跳转前储存地址
            let queryString = [];
            for (let key in req.query) {
                var thisValue = req.query[key];
                queryString.push(`${key}=${thisValue}`)
            }
            queryString = queryString.join('&')
            res.redirect(`//${req.headers.host}/vue/custompage?${queryString}`);
            return;
        }
        
        let customData = {};
        let seo = {
            keywords:'关键词',
            description:'描述',
            title:'标题'
        }
        
        try {
            customData = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getRenovationById'],
                data: {
                    merchantInfoId,
                    id: req.query.id
                }
            });
        } catch (error) {
            console.log(error);
        }

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
            console.log(error);
        }

        if (customData.status == 200 && customData.data) {
            let title = customData.data.renovationPageName, pageBackground = customData.data.renovationPageBack, pageBackFlag = customData.data.pageBackFlag, renovationPageDescribe = customData.data.renovationPageDescribe;
            let customDatas = JSON.parse(customData.data.content);
            let footerData = JSON.parse(bottomData.data.content);
            let ifshowFoot = false;
            if (footerData && footerData.range) {
                footerData.range.forEach(function (item, index) {
                    if (item == 'custompage') {
                        ifshowFoot = true
                    }
                });
            }
            commonApi.renderPage(req, res, 'customPage', {
                title: title,
                seo:seo,
                merchantInfoId: merchantInfoId,
                pageBackground: pageBackground,
                pageBackFlag: pageBackFlag,
                renovationPageDescribe: renovationPageDescribe,
                newtemplateData: customDatas,
                footerData: footerData,
                module: 'custompage',
                ifshowFoot: ifshowFoot
            });
        }

    }
}

module.exports = newMain;
