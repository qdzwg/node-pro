const commonApi = require("../routes/common/common");

const Csearch = {
    /**
     * 聚合搜索数据处理
     */
    async list(req,res,next){
       
        let merchantInfoId = req.query.m_id || req.session.merchantInfoId;

        const modelName = req.query.modelName ==='undefined'?'':req.query.modelName;  //搜索信息

        // const [modelName = ''] = [req.query.modelName]; //搜索信息
        let templateData = {};
        let title = '聚合搜索';
        let datas = {
            title,
            module,
            merchantInfoId,
            marketDisAccount: req.session.marketDisAccount,
            showWholeMarket: req.session.showWholeMarket

        };
        try {
            templateData = await commonApi.apiRequest({
                ctx: { req, res },
                url: ['main', 'merchant', 'getMerchantTemplateCustom'],
                data: {
                    merchantInfoId: merchantInfoId
                }
            });
        } catch (error) {
            throw new Error('模板信息获取错误');
        }
        if (templateData.data) {
            req.session.templateVersion = templateData.data.version; //版本
            if (templateData.data.version === 'old') {
                req.session.templateCode = templateData.data.templateVO.code;
                req.session.footerDatas = null;
            } else {
                let template = JSON.parse(templateData.data.templateVO.template);
                let hasFooter = false;
                template.forEach((item, index) => {
                    if (item.type.indexOf('Footer__') === 0) {
                        hasFooter = true;
                        req.session.footerDatas = item;
                        req.session.templateCode = null;
                    }
                })
                if (!hasFooter) {
                    req.session.footerDatas = null;
                    req.session.templateCode = 'MTI20180316172401';
                }
            }
        }
        let searchTabs = await commonApi.apiRequest({
            ctx: { req, res },
            url:['csearch','getSearchType'],
            data: {                
                merchantInfoId: merchantInfoId
            }
        });
        datas.searchTabs = searchTabs.data;
        datas.templateCode=req.session.templateCode;
        datas.modelName = modelName;  
        datas.redir = hasMerchantInfoId(req.session.curUrl, merchantInfoId) || './?m_id=' + merchantInfoId  

        commonApi.renderPage(req, res, 'csearch', datas);
    },

    /**
     * ajax 动态加载产品列表
     */
    async pageList(req, res, next) {       
        console.log(req.body);
        req.body.merchantInfoId = req.query.m_id || req.session.merchantInfoId; // url || redis 获取商户id
        let url = ['csearch','getSearchResult'];  
        if(req.body.type == 'all'){
            delete req.body.type;
        }
        if(req.body.type != 'hotel'){
            if(req.body.beginDate){
                delete req.body.beginDate;
            }
            if(req.body.endDate){
                delete req.body.endDate;
            }
            if(req.body.numDays){
                delete req.body.numDays;
            }
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

};

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


module.exports = Csearch;