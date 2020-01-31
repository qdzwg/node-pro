const commonApi = require("../routes/common/common");

const Main = {

    /**
     * 首页请求数据处理;
     * @param {any} req 
     * @param {any} res 
     * @param {any} next 
     */
    async newHome(req, res, next) {
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;
        let beginTime = new Date().getTime();
        let templateCode = 'MTI20180316172401';
        let findPicInfo = {}; //轮播信息
        let listMerchantPushInfo = {}; //首页产品推荐
        let getMerchantTemplateCode = {}; //获取首页模板信息
        let templateData = {}; //模板数据
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
            templateData = await commonApi.apiRequest({
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

        if (templateData.data) {
            if (templateData.data.version === 'old') {
                templateCode = templateData.data.templateVO.code;
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
                title = templateData.data.templateVO.name || '首页';
                req.session.templateCode = null;
                let template = JSON.parse(templateData.data.templateVO.template);
                let footerDatas = {};
                let hasFooter = false;
                let pruductListDatas = [];
                let apilists = [];
                console.log('++++++++++++++++++template++++++++++++++++++')
                console.log(template)
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
                }, this)
                if (!hasFooter) {
                    req.session.footerDatas = null;
                    req.session.templateCode = 'MTI20180316172401';
                }
                console.log('++++++++++++++++++pruductListDatas++++++++++++++++++')
                console.log(pruductListDatas);
                let reqDatas = await commonApi.apiRequestAll({
                    ctx: { req, res },
                    apiList: apilists
                })

                console.log('++++++++++++++++++reqDatas++++++++++++++++++')
                console.log(reqDatas);

                let num = 0;
                pruductListDatas.map((item, index) => {
                    if (typeof item.idList === 'string') {
                        template[item.index].data.list = reqDatas[num++].data;
                    } else {
                        item.idList.map((_item) => {
                            template[item.index].data[_item.index].data = reqDatas[num++].data;
                        })
                    }
                })

                commonApi.renderPage(req, res, 'main', {
                    title: title,
                    modules: template,
                    footerDatas,
                    templateCode,
                })
                reqDatas = null;
            }
        }
        findPicInfo = null; //轮播信息
        listMerchantPushInfo = null; //首页产品推荐
        getMerchantTemplateCode = null; //获取首页模板信息
        templateData = null; //模板数据
        template = null;
        footerDatas = null;
    },

    async showNewIndex(req, res, next) {
        let merchantInfoId = req.query.m_id;
        let templateData = {};
        let templateCode = 'MTI20180316172401';
        try {
            templateData = await commonApi.apiRequest({
                ctx: {
                    req,
                    res
                },
                url: ['main', 'merchant', 'getPreViewTemplate'],
                data: {
                    merchantInfoId
                }
            });
        } catch (error) {
            throw new Error(error);
        }
        if (templateData.message) {
            let template = JSON.parse(templateData.message);
            let footerDatas = {};
            template.map((item, index) => {
                if (item.type.indexOf('Footer__') === 0) {
                    footerDatas = item;
                }
            });
            commonApi.renderPage(req, res, 'showNewIndex', {
                title: '首页预览',
                modules: template,
                showIndexfooterDatas: footerDatas,
                templateCode,
                closeLink: true
            })
        }
    }
}

module.exports = Main;