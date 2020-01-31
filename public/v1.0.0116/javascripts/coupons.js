$(function () {

    /**
     * 初始化DOM节点
     *
     */
    var $COUPONS = {};

    /**
     * 初始化获取列表页条件
     */
    var dropBox = $(".drop-box"),
        localUrl = location.pathname + window.location.search,
        pageSize = 6, // 每页数据条数
        filterObj = {
            currPage: 1,
            pageSize: pageSize
        }; // 定义一个对象用于存储筛选条件,默认筛选为翻页第一页
    if (from === 'member') filterObj.status = 1; //传入选择列表类型 {able:可用券 || all全部}

    /**
     * 初始化下拉加载插件；
     */
    var dropload = dropBox.dropload({
        scrollArea: window,
        loadDownFn: filterFn
    });


    if (from === 'member') {
        $COUPONS.searchTab = $('#search_tab');
        $COUPONS.tabLists = $COUPONS.searchTab.find('li');
        $COUPONS.searchTab.on('tap','li',function(){
            var _this = $(this);
            var _type = _this.data('div');
            _this.addClass('on').siblings().removeClass('on');
            filterObj.status = _type === 'all' ? '' : 1;
            couponsInit() //重置列表数据
        });
    } else {
        // filterObj.merchantInfoId = merchantInfoId;
        filterObj.merchantInfoId = merchantInfoId;
    }


    function couponsInit() {
        localUrl = location.pathname;
        filterObj.currPage = 1;
        unLockDropload();
        filterFn(dropload, 1);
    }

    /**
     * 获取当前页的数据
     * @param startPage
     */
    function filterFn(dropload, startPage) {
        console.log(localUrl);
        $.ajax({
            type: 'POST',
            url: localUrl,
            data: filterObj,
            dataType: 'json',
            success: function (data) {
                if (data !== 'error' && data[0].flag !== 'error') {
                    //检测登录状态
                    if (data[0].status === 400) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    }
                    var results = data[0].data;
                    console.log(results);
                    console.log(results.rows);

                    if (filterObj.currPage == 1) {
                        dropBox.find('ul').html(listDom(results.rows, from));
                    } else {
                        dropBox.find('ul').append(listDom(results.rows, from));
                    }
                    //filterObj.currPage = +(results.curPage) + 1;
                    filterObj.currPage += 1;

                    if (filterObj.currPage > results.pages) {
                        dropload.lock();
                        dropload.noData();
                    }
                } else {
                    dropload.lock();
                    dropload.noData();
                }
                // 每次数据加载完，必须重置
                dropload.resetload();
            },
            error: function (xhr, type) {
                // 即使加载出错，也得重置
                dropload.resetload();
            }
        });
    }

    /**
     * 解锁dropload
     */
    function unLockDropload() {
        //dropload.resetload();
        dropload.unlock();
        //dropload.noData(false);
        dropload.isData = true;

    }

    /**
     * 初始化DOM列表HTML
     * @param list
     * @param from
     * @returns {string}
     */
    function listDom(list, from) {
        var dom = '',
            len = list.length;
        list = list.reverse();
        while (len--) {
            // if (from === 'member') {
            //     dom += '<li>'
            //         + '<a href="food-order.html">'
            //         + '<span class="coupons_rmb">'
            //         + '<i class="rt_icon"></i><i class="rmb">￥</i>'
            //         + '<span class="price">100</span>'
            //         + '<span class="coupons_condition">满100使用</span>'
            //         + '<span class="text">元优惠券</span>'
            //         + '<i class="coupons_line_dots"></i>'
            //         + '</span>'
            //         + '<div class="coupons_user_limit">'
            //         + '<p>使用有效期：2015-08-08 至 2015-09-08</p>'
            //         + '<p>使用范围：全场通用</p>'
            //         + '</div></a></li>'
            // } else {
            var href = 'javascript:;';
            if (from === 'list') {
                href = '/coupon/detail?couponCode=' + list[len].code + '&m_id=' + merchantInfoId;
            } else if (from === 'order') {
                href = '/coupon/detail?couponCode=' + list[len].code + '&m_id=' + merchantInfoId;;
            }

            if (from === 'member') {
                var moduleName = {
                    'park': 'ticket',
                    'hotel': 'hotel',
                    'mdse': 'shop',
                    'route': 'route',
                    'repast': 'repast',
                    'eatery': 'repast'
                }
                isAble = true;
                // 1 未使用；2 已使用；3 已过期
                switch (parseInt(list[len].status)) {
                    case 2:
                        isAble = false;
                        dom += '<li class="used">'
                        break;
                    case 3:
                        isAble = false;
                        dom += '<li class="overdue">'
                        break;
                    default:
                        dom += '<li>'
                        switch (list[len].applyType) {
                            case 'used':
                                var productInfos = list[len].productInfos;
                                if (productInfos && productInfos.length > 0) {
                                    if (productInfos.length > 1) {
                                         href = '/?m_id=' + merchantInfoId;
                                    } else {
                                        typeof productInfos[0].productId !== 'undefined'  
                                            ? href = '/detail/' + moduleName[productInfos[0].type] + '/' + productInfos[0].productId + '/' + productInfos[0].productCode + '/?m_id=' + merchantInfoId
                                            : isAble = false;
                                    }
                                } else {
                                    isAble = false;
                                }
                                break;
                            case 'type':
                                list[len].useProductType.indexOf(',') !== -1
                                    ? href = '/?m_id=' + merchantInfoId
                                    : href = '/list/' + moduleName[list[len].useProductType] + '/?m_id=' + merchantInfoId;
                                break;
                            case 'all':
                                href = '/?m_id=' + merchantInfoId;
                                break;
                            default:
                                break;
                        }
                        break;
                }
                
                
            } else {
                dom += '<li>'
            }
            dom += '<a href="' + href + '">' +
                '<span class="coupons_rmb">';

            if (from === 'member') dom += '<i class="rt_icon"></i>';
            //优惠券类型
            //if (list[len].couponType === '0') {
            dom += '<em class="coupons_price clearfix">' +
                '<i class="rmb">￥</i>' +
                '<span class="price">' + list[len].amount + '</span></em>'
            //} 
            // else if (list[len].couponType === '1') {
            //     dom += '<em class="coupons_price clearfix">'
            //         + '<span class="price">' + (parseInt(list[len].couponValue) / 10) + '</span>'
            //         + '<i class="rmb">折</i></em>'                
            // }
            dom += '<em class="coupons_title clearfix">' +
                '<p class="text" >' + list[len].name + '</p>' +
                '<p class="coupons_condition">' +
                //useThreshold 是否是满减类型
                (list[len].useThreshold === 'T' ? ('满' + list[len].targetAmout + '元可用') : '任意金额可用') +
                '</p>' +
                '</em>' +
                '<i class="coupons_line_dots"></i></span>' +
                '<div class="coupons_user_limit">';

            //使用时限标识
            if (from === 'list') {
                //validityDateType 有效期类型（fixed：固定时期；relative：相对天数）
                switch (list[len].validityDateType) {
                    case 'fixed':
                        dom += '<p>使用有效期：' + list[len].validStartDate + ' 至 ' + list[len].validEndDate+ ' </p>';
                        break;
                    case 'relative':
                        dom += '<p>使用有效期：领取当日起 ' + list[len].relativeDay + '天后失效</p>';
                    default:
                        break;
                }
                dom += '<p><span class="coupon-btn get-coupon-btn">立即领取</span></p>';
            } 
            else if (from === 'member'){
                dom += '<p>使用有效期：' + list[len].validStartDate + ' 至 ' + list[len].validEndDate + ' </p>';
                isAble 
                    ? dom += '<p><span class="coupon-btn get-coupon-btn">立即使用</span></p>'
                    : dom += '<p><span class="coupon-btn coupons_list_bg">立即使用</span></p>'
            }
            else {
                dom += '<p>使用有效期：' + list[len].validStartDate + ' 至 ' + list[len].validEndDate + ' </p>';
            }


            // var _productFlag = '';
            // switch (list[len].productFlag) {
            //     case '0':
            //         _productFlag = '通用';
            //         break;
            //     case '1':
            //         _productFlag = '指定产品类别(' + getModule(list[len].productValue) + ')';
            //         break;
            //     case '2':
            //         _productFlag = '指定产品';
            //         break;
            // }

            // dom += '<p>使用范围：' + list[len].useProductType + '</p></div></a></li>';

            dom += '</div></a></li>'

        }
        return dom;
    }

    //判断是苹果自带safari浏览器给一个上滑操作触发dropload响应事件
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1) {
        $("html,body").animate({ "scrollTop": "100px" }, 1000);
        $("html,body").animate({ "scrollTop": 0 }, 1000);
    }
});