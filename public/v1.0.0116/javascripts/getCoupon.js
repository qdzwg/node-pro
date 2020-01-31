$(function () {
    var $CP = {
        couponsListLayer: $('#couponListLayer'),
        goLogin: $('#goLogin'),
        mask: $('#mask'),
        couponList: $('#couponList'),
        couponInfo: $('#couponInfo'),
        choiceCoupons: $('#choiceCoupons'),
        cancleCouponChoice: $('#cancleCouponChoice'),
        couponHandlePrice: $('.couponHandlePrice'),
        inputCouponCode: $('input[name=couponCode]'),
        inputCouponCheckCode: $('input[name=couponCheckCode]'),
        totalprice: $('#totalprice'),
        orderList: $('#orderList'),
        payPrice: $('#payPrice')
    };

    var listAbelCoupons = []; //缓存优惠券列表信息;
    var orderListInfos = []; //订单信息
    if (typeof cacheInfo === 'object')
        orderListInfos = cacheInfo.item;
    // else
    //     var mealCode = $CP.choiceCoupons.data('code').data('code'), mealPrice = $('#mealCouponPrice').text(); 
    //     orderListInfos = mealCode + '-' + mealPrice;
    /** 
     * 关闭优惠券列表
     */
    touch.on('#layer_close', 'tap', function () {
        $CP.couponsListLayer.removeClass('show');
    });

    /**
     * 展示可选优惠券列表
     */
    var settleModelCodeTotalPrice = []; //合并相同code 对应产品价格
    touch.on($CP.choiceCoupons, 'tap', function () {
        // var isInit = parseInt($CP.choiceCoupons.data('init'));
        var modelCodes = $CP.choiceCoupons.data('code') || '';
        var page = $CP.choiceCoupons.data('module') || '';
        var usedCoupon = $CP.inputCouponCode.val() || '';
        var UseCouponsAllPrice = null;
        if (module === 'mealCoupon') {
            if ($('.numbernum').val() > 0) {
                UseCouponsAllPrice = operation.accMul($('#mealCouponPrice').text(), $('.numbernum').val());
                var modelCodeArray = [], hasCode = false;
                modelCodeArray.push(modelCodes + '-' + UseCouponsAllPrice);
                for (var i = 0; i < settleModelCodeTotalPrice.length; i++) {
                    if (settleModelCodeTotalPrice[i].code === modelCodes) {
                        hasCode = true;
                        settleModelCodeTotalPrice[i].prices = UseCouponsAllPrice
                    }
                }
                if (!hasCode) {
                    settleModelCodeTotalPrice.push({
                        code: modelCodes,
                        prices: UseCouponsAllPrice
                    })
                }
            } else {
                alert('请选择购买的餐券数量！');
                return;
            }
        }
        else if (module === 'route') {
            UseCouponsAllPrice = +$('#totalprice').text();
            var modelCodeArray = [];
            modelCodeArray.push(modelCodes + '-' + UseCouponsAllPrice);
            settleModelCodeTotalPrice.push({
                code: modelCodes,
                prices: UseCouponsAllPrice
            })
        }
        else if (page && page === 'order') {
            var orderCouponsAllPrice = +$('#totalprice').text();

            if (!orderCouponsAllPrice) {
                $.alert('价格为0.00，不能使用优惠券');
                return;
            }
            var modelCodeArray = [modelCodes + '-' + orderCouponsAllPrice]
            settleModelCodeTotalPrice = [];
            settleModelCodeTotalPrice.push({
                code: modelCodes,
                prices: orderCouponsAllPrice
            })
        }
        else {
            var modelCodeArray = unique(modelCodes.split(','));
            for (var i = 0; i < modelCodeArray.length; i++) {
                var productCode = '', UseCouponsAllPrice = 0;
                for (var j = 0; j < orderListInfos.length; j++) {
                    productCode = module === 'shop'
                        ? orderListInfos[j].productCode
                        : productsInfo[j].modelCode
                    if (modelCodeArray[i] === productCode) {
                        switch (module) {
                            case 'shop':
                                UseCouponsAllPrice += (productsInfo[j].sellPrice * (+orderListInfos[j].num));
                                break;
                            case 'ticket':
                                UseCouponsAllPrice += (productsInfo[j].priceSettle * (+orderListInfos[j].num));
                                break;
                            case 'hotel':
                                UseCouponsAllPrice += (orderListInfos[j].prices * (+orderListInfos[j].num));
                                break;
                            default:
                                break;
                        }
                    }
                }
                settleModelCodeTotalPrice.push({
                    code: modelCodeArray[i],
                    prices: UseCouponsAllPrice
                })
                modelCodeArray[i] = modelCodeArray[i] + '-' + UseCouponsAllPrice;
            }
        }


        //如果已经加载列表不做重复加载
        // if (isInit && module !== 'mealCoupon') {
        //     $CP.couponsListLayer.addClass('show');
        //     return false;
        // }

        $.get('/coupon/useAble', {
            merchantInfoId: merchantInfoId,
            moldCodes: modelCodeArray.join(','),
        })
            .success(function (data) {
                var datas = data[0];
                switch (datas.status) {
                    case 400:
                        $CP.goLogin.show();
                        $CP.mask.show();
                        break;
                    case 200:
                        listAbelCoupons = datas.data;
                        $CP.choiceCoupons.data('init', 1);
                        $CP.couponList.html(appendCoupons(listAbelCoupons, usedCoupon));
                        bindCouponsTap();
                        $CP.couponsListLayer.addClass('show');
                    default:
                        break;
                }
            })
            .error(function () {
                $('.tips p').text('哎呀！出错了');
                $('.mask,.tips').show();
            })
    })

    /**
     * 领取优惠券
     */
    touch.on('#getCouponBtn', 'click', function () {
        var _this = $(this);
        var couponCode = _this.data('code');
        var ismjs = _this.data('get');
        $.ajax({
            url: '/coupon/get?m_id=' + merchantInfoId + '&couponCode=' + couponCode,
            beforeSend: function (xhr) {
                $.showLoading();
            },
            complete: function (xhr, status) {
                $.hideLoading();
            },
            success: function (data) {
                console.log(data);
                var datas = data[0];
                if (datas.status === 200) {
                    if (ismjs == "mjs") { // 买即送
                        var payOrderNo = _this.data('no');   
                        Msg.open('领取成功！')
                        setTimeout(function(){
                            window.location.href = '/payPlat/result?out_trade_no='+ payOrderNo
                        }, 500);
                    } else {
                        window.location.href = '/coupon/get/result?couponCode=' + couponCode + '&m_id=' + merchantInfoId;
                    }
                } else if (datas.status === 400) {
                    window.location.href = '/login?m_id=' + merchantInfoId;
                } else {
                    $('.tips p').text(datas.message);
                    $('.mask,.tips').show();
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    })

    touch.on('#cancleLayer', 'tap', function () {
        $CP.goLogin.hide();
        $CP.mask.hide();
    })

    /**
     * 取消优惠券的使用
     */
    touch.on($CP.cancleCouponChoice, 'tap', function () {
        $CP.couponInfo.text('优惠活动信息');
        $CP.choiceCoupons.find('span').text('优惠券选择');

        //页面上存储优惠券信息
        $CP.couponInfo.data('cut', 0);

        $CP.inputCouponCode.val(''); //优惠券码
        $CP.couponHandlePrice.text('');
        totalprice()
        $CP.couponList.find('li').removeClass('normal');
        $CP.couponsListLayer.removeClass('show');
        $CP.payPrice.html('');
    })

    /**
     * 绑定可用优惠券点击事件
     */
    function bindCouponsTap() {
        var $List = $CP.couponList.find('li');
        $List.on('tap', function () {
            var _this = $(this);
            var applyType = _this.data('type');
            var len = parseInt(_this.data('index'));
            var currentCouponInfo = listAbelCoupons[len];
            var couponLimit = currentCouponInfo.useThreshold === 'T'
                ? '满' + currentCouponInfo.targetAmout + '元可用'
                : '无金额门槛';

            $List.removeClass('normal');
            _this.addClass('normal');

            $CP.couponInfo.text(couponLimit);
            $CP.couponsListLayer.removeClass('show');
            $CP.choiceCoupons.find('span').text(currentCouponInfo.name);
            $CP.couponInfo.data({     //用于餐饮优惠券金额存储
                "amount": currentCouponInfo.amount,
                "target": currentCouponInfo.targetAmout
            })

            //页面上存储优惠券信息  
            // $CP.couponInfo.attr('data-f', currentCouponInfo.targetAmout);
            // $CP.couponInfo.attr('data-v', currentCouponInfo.amount);

            $CP.inputCouponCode.val(currentCouponInfo.code); //优惠券码
            $CP.inputCouponCheckCode.val(currentCouponInfo.verifyCode); //优惠券核销码 

            //处理价格显示
            // var totalPrice = totalprice();
            var handlePriceResult = handleCouponsPrice(applyType, currentCouponInfo);
            $CP.couponInfo.data('cut', handlePriceResult.cutPrice); //记录减免价格
            //显示处理详情
            var handlePriceString = '- ' + handlePriceResult.cutPrice + ' ='
            handlePriceResult.cutPrice
                ? $CP.couponHandlePrice.text(handlePriceString)
                : $CP.couponHandlePrice.text('');

            var finallyPrice = ((+$CP.totalprice.text()) - handlePriceResult.cutPrice).toFixed(2);
            $('input[name=totalPrice]').val(finallyPrice);
            $CP.payPrice.text(finallyPrice)
        })
    }

    /**
     * 处理选中优惠券的价格
     * @param {Object} couponInfo 
     */
    function handleCouponsPrice(type, couponInfo) {
        var UseCouponsAllPrice = 0;
        var handlePrice = 0;
        settleModelCodeTotalPrice = uniqueArrObj(settleModelCodeTotalPrice);
        switch (type) {
            case 'all':
            case 'type':
                // if(couponInfo.useThreshold == 'F'){
                //     settleModelCodeTotalPrice.forEach(function(item, index){              
                //         UseCouponsAllPrice += item.prices;           
                //     })            
                //     handlePrice = UseCouponsAllPrice > couponInfo.amount ? couponInfo.amount : UseCouponsAllPrice;
                // }else{
                //     var jqcouponPrice = 0;
                //     settleModelCodeTotalPrice.forEach(function(item, index){
                //         if(item.prices >= couponInfo.targetAmout){
                //             jqcouponPrice = item.prices - couponInfo.targetAmout
                //         }
                //     })
                // }
                settleModelCodeTotalPrice.forEach(function (item, index) {
                    UseCouponsAllPrice += item.prices;
                })
                handlePrice = UseCouponsAllPrice > couponInfo.amount ? couponInfo.amount : UseCouponsAllPrice;
                break;
            case 'used':
                for (var i = 0; i < uniqueArrObj(settleModelCodeTotalPrice).length; i++) {
                    for (var j = 0; j < unique(couponInfo.productInfos).length; j++) {
                        if (settleModelCodeTotalPrice[i].code == couponInfo.productInfos[j].productCode) {
                            UseCouponsAllPrice += settleModelCodeTotalPrice[i].prices;
                        }
                    }
                }
                handlePrice = UseCouponsAllPrice > couponInfo.amount ? couponInfo.amount : UseCouponsAllPrice;
                break;
        }
        // settleModelCodeTotalPrice.forEach(function (item, index) {
        //     if (typeof couponInfo.productCode === 'undefined' || item.code === couponInfo.productCode)  UseCouponsAllPrice = item.prices;         
        // })

        // if (couponInfo.useThreshold === 'F' || couponInfo.useThreshold === 'T' && UseCouponsAllPrice >= (couponInfo.targetAmout || 0)) {
        //     handlePrice = UseCouponsAllPrice > couponInfo.amount
        //         ? couponInfo.amount
        //         : UseCouponsAllPrice;                 
        // } 


        return {
            cutPrice: handlePrice.toFixed(2)
        }

    }
});

/**
 * 优惠券类型
 * @param {*类型} status 
 */
function productFlag(status) {
    switch (parseInt(status)) {
        case 0:
            return '通用';
            break;
        case 1:
            return '指定产品类别';
            break;
        case 2:
            return '指定产品';
            break;
        default:
            break;
    }
}

/**
 * 可以使用的优惠券列表
 * @param {*优惠券列表数据} list 
 */
function appendCoupons(list, useCouponCode) {

    var len = list.length
        , dom = '';

    //没有数据返回提示信息
    if (!len) {
        dom = '<div class="no-data n-nbm"><i class="xx-icon icon-iconfont-gantanhaom"></i><p>暂无信息</p></div>';
        return dom;
    }

    list.reverse();
    console.log(list);
    while (len--) {
        // href = '/coupon/detail?couponCode=' + list[len].couponCode;
        var liClass = useCouponCode && list[len].code === useCouponCode ? "normal" : "";
        dom += '<li class="' + liClass
            + '" data-index=' + len + ' data-type=' + list[len].applyType + ' data-camount = ' + list[len].amount + '>'
            + '<span class="coupons_rmb"><i class="rt_icon"></i>';
        //优惠券类型
        dom += '<em class="coupons_price clearfix">'
            + '<i class="rmb">￥</i>'
            + '<span class="price">' + list[len].amount + '</span></em>'

        dom += '<em class="coupons_title clearfix">'
            + '<p class="text" >' + list[len].name + '</p>'
            + '<p class="coupons_condition">'
            + (list[len].useThreshold === 'T' ? ('满' + list[len].targetAmout + '元可用') : '任意金额可用')
            + '</p>'
            + '</em>'
            + '<i class="coupons_line_dots"></i></span>'
            + '<div class="coupons_user_limit">';

        //使用时限标识   
        dom += '<p>使用有效期：' + list[len].validStartDate + ' 至 ' + list[len].validEndDate + ' </p>';
    }
    return dom;
}


/**
 *数组去重
 * @param {Array} arr
 * @returns newArray
 */
function unique(arr) {
    var newArr = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
        if (newArr.indexOf(arr[i]) == -1 && arr[i] !== '') {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

//数组对象去重
function uniqueArrObj(arr) {
    var result = [];
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        if (!obj[arr[i].code]) {
            result.push(arr[i]);
            obj[arr[i].code] = true;
        }
    }
    return result;
}