$(function () {
    /**
     * 绑定DOM节点；
     */
    var $ord = {
        form: $('#form'),
        formBtn: $('.formBtn'),
        goMyIndex: $('.goMyIndex'),
        goIndex: $('.goIndex'),
        beginDate: $('input[name=beginDate]'),
        endDate: $('input[name=endDate]'),
        price: $('#price'),
        infoAddress: $('#infoAddress'),
        expressPrice: $('#express_price'),
        totalPrice: $('#totalprice'),
        costDialog: $("#cost-dialog"),
        getGoodsTypeList: $('.getGoodsTypeList'),
        addressError: $('.address-error'), //goods module
        getSelfPlace: $('#get_self_place'),
        payModule: $('#payModule')
    };

    var addressFormValidator, getByMySelf; //申明表单验证函数
    var goodsWayType = 0; //商品收货方式选择
    var totalPrice = 0; //缓存初始价格
    var hasTab = null;

    if (module !== 'ticket') formValidate(goodsWayType);
    if (module === 'shop') {
        hasTab = $('#selectTypeTab').find('li').size();   //判断是否存在切换按钮
        addAdressForm(); //开启地址填写表单验证
        if (hasTab === 1) {
            goodsWayType = 1;
        } else if (hasTab > 1) {  //hasTab：0无自提选择，1快递和自提都有 
            $('#selectTypeTab li').on('tap', function () {   // 切换配送方式
                var _this = $(this);
                goodsWayType = parseInt(_this.attr('data-index'));

                _this.addClass('on').siblings().removeClass('on');
                $ord.getGoodsTypeList.hide();
                $ord.getGoodsTypeList.eq(goodsWayType).show();

                if (goodsWayType) {
                    formValidate(goodsWayType);
                    $ord.totalPrice.html(totalPrice);
                    totalprice();
                    $ord.expressPrice.hide();
                } else {
                    formValidate(goodsWayType);
                    addPosttagePrice();
                    $ord.expressPrice.show();
                }
            });
        }
        function closeGoodsLayer() {
            $('#addressLayer').removeClass('show');
            $('.layerContent').hide();
        }

        function showGoodsLayer() {
            $('#addressLayer').addClass('show');
            $('#layerContent').show();
            $('#newAddress').hide();
        }

        function getAddressList(currPage, pageSize) {
            var addressUrl = '/address/list?currPage=' + currPage + '&pageSize=' + pageSize;
            $.get(addressUrl, function (res) {
                console.log(res);
                if (res.indexOf('no-data') !== -1) {
                    $('.address-select').find('.show-space').removeClass('show-space').addClass('hidden-space');
                }
                else if (res.indexOf('login-logo') !== -1) {
                    window.location.href = '/login?m_id=' + merchantInfoId;
                    return;
                }
                $('#layerContent .listWrap').html(res);
            });
        }

        // 地址弹出层
        $('.address-select').click(function () {
            var currPage = 0;
            var pageSize = 10;
            getAddressList(currPage, pageSize);
            $ord.goMyIndex.hide();
            $ord.goIndex.hide();
            showGoodsLayer();
        });
        $('.addressLayer-colse').click(function () {
            $ord.goMyIndex.show();
            $ord.goIndex.show();
            closeGoodsLayer();
        });

        // 添加地址
        $('.addNewItem .addrNews').click(function () {
            $('#layerContent').hide();
            $('#newAddress').show();
            $('#addressForm')[0].reset();
            $('select[name=province]').trigger('change');
            $('#addressForm input[name=id]').remove();
            $('#addressForm input[name=leaguerId]').remove();
        });
        // 保存地址
        $('#saveAddress').click(function () {
            if (addressFormValidator.form()) {
                var $areaName = $('#areaName');
                var selects = $areaName.find('select');
                var areaStr = '';
                selects.each(function (item) {
                    areaStr += $(this).find('option:selected').text();
                })
                $areaName.find('input[name=areaName]').val(areaStr);
                var formData = $('#addressForm').serialize();
                var addressUrl = '/address/save';
                $.ajax({
                    url: addressUrl,
                    data: formData,
                    type: 'POST',
                    beforeSend: function (xhr) {
                        $.showLoading();
                    },
                    complete: function (xhr, status) {
                        $.hideLoading();
                    },
                    success: function (res) {
                        console.log(res)
                        if (res[0].status === 200) {
                            var currPage = 0;
                            var pageSize = 10;
                            getAddressList(currPage, pageSize);
                            $('.address-select').find('.hidden-space').removeClass('hidden-space').addClass('show-space');
                            $('#newAddress .cancelBtn').trigger('click');
                        }
                        else {
                            $('.tips p').text(res[0].message);
                            $('.mask,.tips').show();
                        }
                    },
                    error: function (err) {
                        $.hideLoading();
                        console.log(err)
                    }

                })
            }

        });

        // 选择地址
        $('#layerContent').on('click', '.addressItem', function () {
            var item = $(this).data('itemobj');
            closeGoodsLayer();
            getPostage(item.areaCode);
            $('#addressInfo').text(item.linName + " " + item.likPhone)
            $('#addressDetail').text(item.areaName + item.addressDetail);
            $('input[name=areaCode]').val(item.areaCode);
            $('input[name=buyerName]').val(item.linName);
            $('input[name=buyerMobile]').val(item.likPhone);
            $('.address-select input[name=buyerAddr]').val(item.areaName + item.addressDetail);
        });

        // 编辑地址
        $('#layerContent').on('click', '.editIcon', function (e) {
            e.stopPropagation();
            var item = $(this).parent().data('itemobj');
            $('#layerContent').hide();
            $('#newAddress').show();
            $('input[name=title]').val(item.title);
            $('input[name=linName]').val(item.linName);
            $('input[name=likPhone]').val(item.likPhone);
            $('input[name=addressDetail]').val(item.addressDetail);
            $('input[name=zipCode]').val(item.zipCode);
            var areaCodeArray = item.areaCode.split(',');
            $('select[name=province]').val(areaCodeArray[0]).trigger('change');
            $('select[name=city]').val(areaCodeArray[1]).trigger('change');
            $('select[name=area]').val(areaCodeArray[2]);

            if ($('#addressForm input[name=id]').length > 0) {
                $('#addressForm input[name=id]').val(item.id)
            } else {
                $('#addressForm').append('<input type="hidden" value="' + item.id + '" name="id" />');
            }
            if ($('#addressForm input[name=leaguerId]').length > 0) {
                $('#addressForm input[name=leaguerId]').val(item.leaguerId)
            } else {
                $('#addressForm').append('<input type="hidden" value="' + item.leaguerId + '" name="leaguerId" />')
            }
        });

        //删除地址
        $('#layerContent').on('click', '.deleteIcon', function (e) {
            e.stopPropagation();
            var item = $(this).parent().data('itemobj');
            if (confirm('确认删除此地址？')) {

                $.post('/address/delete', {
                    leaguerAddressId: item.id
                }, function (res) {
                    if (res[0].status === 200) {
                        var currPage = 0;
                        var pageSize = 10;
                        getAddressList(currPage, pageSize);
                    }
                })
            }

        });

        // 取消编辑/新增地址
        $('#newAddress .cancelBtn').click(function () {
            $('#layerContent').show();
            $('#newAddress').hide();
        });

        var orD = {
            _user: $('.get_express'),
            _getExpress: $('#get_express'),
            _getType: $('#get_type'),
            _getSelf: $('#get_self'),
            _mask: $('#mask'),
            _takeLayer: $('#take_layer'),
            _target: $('#target')
        };

        $ord.getSelfPlace.click(function () {
            orD._mask.show();
            orD._takeLayer.show();
        });
        $(".mask,.close-take").click(function () {
            orD._mask.hide();
            orD._takeLayer.hide();
        });

        var _a = $(".take-tit a");
        _a.click(function () {
            orD._mask.hide();
            orD._takeLayer.hide();
            $ord.getSelfPlace.val($(this).parent().siblings(".take-add").find("p").html());
        });

    }
    else {
        //餐饮数量处理20180809zwg
        if (module === "mealCoupon") {
            var numDom = $(".numbernum"), mealTotal = 0, singlePrice = '';
            numDom.numSpinner({
                min: numDom.data("min"),
                max: numDom.data("max"),
                onChange: function (evl, value) {
                    var coupHandPriceText = $('.couponHandlePrice').text();
                    singlePrice = $("#mealCouponPrice").text();
                    mealTotal = operation.accMul(singlePrice, value);
                    $("#mealTotal, #totalprice").text(mealTotal);
                    $("#mealCouponNum").text(value);
                    $("input[name='amounts']").val(value);
                    $("#paySum").val(mealTotal);
                    if (value > 0) {
                        if (coupHandPriceText != '') {
                            var $choiceCoupons = $('#choiceCoupons')
                                , $couponInfo = $('#couponInfo')
                                , amount = $couponInfo.data('amount')  // 优惠券金额
                                , target = $couponInfo.data('target') || 0;  // 满多少可以减

                            if (parseFloat(mealTotal) > parseFloat(target)) {
                                var ccoupHandPrice = coupHandPriceText.split('- ')[1].split(' =')[0];
                                ccoupHandPrice = mealTotal < amount ? mealTotal : amount;
                                var finnalPrice = operation.accSub(ccoupHandPrice, mealTotal);
                                $('.couponHandlePrice').text('- ' + ccoupHandPrice + ' =');
                                $ord.totalPrice.val(finnalPrice)
                                $('#payPrice').text(finnalPrice);
                            } else {
                                $couponInfo.text('优惠活动信息')
                                    .data({
                                        'amount': 0,
                                        'target': 0
                                    })
                                $choiceCoupons.find('span').text('优惠券选择');
                                $('input[name=couponCode]').val(''); //优惠券码
                                $('.couponHandlePrice').text('');
                                totalprice()
                                $('#payPrice').text('');
                            }
                        }
                        mealCouponSum()
                    } else {
                        $ord.formBtn.addClass('background-gray').unbind("click");
                    }
                }
            });
            singlePrice = $("#mealCouponPrice").text();
            var val = $(".numbernum").val();
            mealTotal = operation.accMul(singlePrice, val);
            $("#mealTotal, #totalprice").text(mealTotal);
            $("#paySum").val(mealTotal);
            $("#mealCouponNum").text(val);
            $("input[name='amounts']").val(val);
            if (val <= 0) {
                $ord.formBtn.addClass('background-gray').unbind("click");
            } else {
                mealCouponSum();
            }
            function mealCouponSum() {
                // var btnFlag = false;
                $ord.formBtn.removeClass('background-gray').unbind('click').on('click', function () {
                    var $t = $(this);
                    // var btnFlag = $t.attr('data-flag');                    
                    // if (!btnFlag && validator.form()) {
                    if (validator.form()) {
                        // $t.attr('data-flag', true);
                        // btnFlag = true;
                        var spreadCode = getCookie('spread_code_'+merchantInfoId);
                        var _url = "/order/" + module + "?" + $ord.form.serialize() +'&spreadCode='+spreadCode;
                        $.post(_url, {}, function (data) {
                            if (data[0].status == "400") {
                                window.location.href = '/login?m_id=' + merchantInfoId;
                            } else if (data[0].status == "200") {
                                // window.location.href = '/pay/' + module + '/' + data[0].data.payOrderNo + '?m_id=' + merchantInfoId;
                                $ord.payModule.find('.price').text(data[0].data.paySum.toFixed(2))
                                // var orderInfo = typeof data[0].data.orderInfoJson === 'string' ? JSON.parse(data[0].data.orderInfoJson) : [];  
                                $ord.payModule.find('#goPayBtn').data('query','?orderNo=' + data[0].data.payOrderNo +'&code='+ data[0].modelCodes + '&name='+ data[0].data.orderDescription
                                + '&paySum=' + data[0].data.paySum.toFixed(2) + '&m_id=' + merchantInfoId)    
                                $ord.payModule.addClass('show');
                                $('#mask').show();
                            } else {
                                if (data[0].status) {
                                    $('.tips p').text(data[0].message);
                                    $('.mask,.tips').show();
                                }
                                // btnFlag = false;
                            }
                        });
                    }
                });
            }
        }
        //结束餐饮数量处理
    }

    // 支付切换
    if ($ord.payModule.size() > 0) {
        $ord.payModule.find('li').on('tap',function(){
            var $this = $(this)
            $ord.payModule.find('.select-icon').removeClass('icon-yuanxingxuanzhongfill').addClass('icon-yuanxingweixuanzhong')
            $this.hasClass('longCard') ? $('#goPayBtn').data('chanel','long') : $('#goPayBtn').data('chanel','normal')
            $this.find('.select-icon').removeClass('icon-yuanxingweixuanzhong').addClass('icon-yuanxingxuanzhongfill')
        })

        $('#goPayBtn').on('tap',function(){
            var query = $(this).data('query')
            var payChanel = $(this).data('chanel')
            query += '&chanel='+ payChanel 
            $.get('/payType/get'+ query).success(function(res){
                $("#mask,#cost-dialog").hide();
                $ord.payModule.removeClass('show'); 
                if (res.status === 200) {
                    if (res.data.payType === '2019') {
                        ap.tradePay({
                            tradeNO: res.data.tradeNo
                          }, function(res){
                              if (res.resultCode == 9000 || res.resultCode== 8000) {
                                window.location.href = '/payPlat/Notify/1' + query
                              } else {
                                window.location.href = '/payPlat/Notify/0' + query
                              }
                          });
                    } else {
                        query += '&payType='+res.data.payType
                        window.location.href = '/pay/' + module + query
                    }
                } else {
                    if (typeof res.message !== 'undefined' && res.message.indexOf('重复订单号') === 0) {
                        res.message = '暂时不支持重新发起支付，请重新下单'
                    }
                    $('.tips p').text('支付失败，请重试');
                    $('.mask,.tips').show();
                }  
            })

            
        })

    }
    

    $(".mnSelect").select({
        title: "请选择证件类型",
        items: [{
            title: '大陆居民身份证',
            value: 'id'
        }, {
            title: '港澳台通行证',
            value: 'pass'
        }, {
            title: '护照',
            value: 'passport'
        }],
        onOpen: function () {
            $('#pay-mask').show()
        },
        onClose: function () {
            $('#pay-mask').hide()
        },
        onChange: function (cal) {
            console.log(cal);
            var $thisLi = $(this)[0].$input.parents('li');
            var $thisUl = $thisLi.parents('ul');
            var value = cal.values;
            if (!value) return
            var name = '身份证';
            switch (value) {
                case 'id':
                    name = '身份证';
                    $thisUl.find('.realNameFace').parents('li').show();
                    break;
                case 'pass':
                    name = '港澳台';
                    $thisUl.find('.realNameFace').parents('li').show();
                    break;
                case 'passport':
                    name = '护照';
                    $thisUl.find('.realNameFace').parents('li').hide();
                    $thisUl.find('input.order-faceUrl').val('').trigger('change');
                    break;
                default:
                    break;
            }
            $thisLi.find('.input_select').text(name);
            $thisLi.find('.typeName').val(value).trigger('change');

            if (value === 'id') {
                $thisLi.find('.buyerIdNo__id').show().val('');
                $thisLi.find('.buyerIdNo__oc').hide().next('label.error').remove();
            } else {
                $thisLi.find('.buyerIdNo__oc').show().val('');
                $thisLi.find('.buyerIdNo__id').hide().next('label.error').remove();
            }

        }
    });

    touch.on("#cost", "tap", function () {
        var height = $ord.costDialog.height();
        $("#mask").show();
        $ord.costDialog.css("margin-top", -height * 0.5).show();
    });
    touch.on("#mask", "tap", function () {
        $("#mask,#cost-dialog").hide();
        $ord.payModule.removeClass('show'); // 关闭支付弹框
    });

    var tprice = 0;
    var $ticketLists = $(".ticket-list").find("li");
    if ($ticketLists.length > 0) {
        $(".ticket-list").find("li").each(function () {
            tprice = operation.accAdd(tprice, operation.accMul($(this).find(".product-price").text(), $(this).find(".product-num").text()));
            tprice = tprice < 0 ? 0 : tprice;
        });
        $("#totalprice").text(tprice.toFixed(2));
        $("#paySum").val(tprice.toFixed(2));
        $ord.payModule.find('.pay-sealPrice .price').text(tprice.toFixed(2));
    }
    if (module !== "mealCoupon") {
        $ord.formBtn.removeClass('background-gray').on('click', function () {
            // var btnFlag = $t.attr('data-flag');
            var hiddenSpace = $('.hidden-space'); //出现则说明没有添加收货地址
            if (module === 'shop' && !goodsWayType && hiddenSpace.size()) {
                $('.tips p').text('您还未添加收货地址');
                $('.mask,.tips').show();
                return false;
            } 
            
            if (validator.form()) {
                $ord.formBtn.removeClass('background-base').addClass('background-gray');
                // $t.attr('data-flag', true);
                var spreadCode = getCookie('spread_code_'+merchantInfoId);
                var _url = "/order/" + module + "?" + $ord.form.serialize() +'&spreadCode='+ spreadCode;
                if (module === 'shop') _url = _url + '&goodsWayType=' + goodsWayType + '&hasTab=' + hasTab;
                $.post(_url, {}, function (data) {
                    // $t.attr('data-flag', false);
                    $ord.formBtn.removeClass('background-gray').addClass('background-base');
                    if (data[0].status == "400") {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    } else if (data[0].status == "200") {
                        if (merchantInfoId === '229') {
                            window.location.href = '/pay/' + module + '?orderNo=' + data[0].data.payOrderNo +'&name=' + data[0].data.orderDescription + '&paySum=0&m_id=' + merchantInfoId;
                        } else {
                            // http://lixp.sendinfo.com.cn/pay/ticket?orderNo=O2019032210314000126053&paySum=0&m_id=78
                            // var orderInfo = typeof data[0].data.orderInfoJson === 'string' ? JSON.parse(data[0].data.orderInfoJson) : [];
                           
                            var allPrice = data[0].data.paySum.toFixed(2);
                            // if (module === 'shop') {
                            //     var $express = $('#express_price').find('span.c-price');
                            //     if ($express.size()){
                            //         allPrice = (data[0].data.paySum + (+$express.text())).toFixed(2)
                            //     }
                            // }
                            $ord.payModule.find('.price').text(allPrice)
                            $ord.payModule.find('#goPayBtn').data('query', '?orderNo=' + data[0].data.payOrderNo +'&code='+ data[0].modelCodes +'&name=' + data[0].data.orderDescription + '&paySum=' + allPrice + '&m_id=' + merchantInfoId)
                            $ord.payModule.addClass('show');
                            $('#mask').show();
                            // window.location.href = '/pay/' + module + '/' + data[0].data.payOrderNo + '?m_id=' + merchantInfoId;
                        }
                    } else {
                        if (data instanceof Array && data[0].message) {
                            $(".tips p").text(data[0].message);
                            $('.mask,.tips').show();
                        }
                    }
                });
            } else {
                var $errorList = $('label.error');
                $ord.formBtn.removeClass('background-gray').addClass('background-base');
                if ($errorList.length > 0) {
                    var top = ($errorList.eq(0).offset().top - 100);
                    if (top < 0) top = 0;
                    $(window).scrollTop(top);
                }
            }
        });
    }


    // 日历选择
    var calendarDates = $("#calendar").data('dates');
    var initDom = function (date, tag) {
        console.log(date);
        var _price = 0,
            _stock = 0;
        if (!date) {
            if (tag) {
                $('#calendarTogg').unbind('click');
            }
            initNumber(0);
            return;
        }

        if (module === 'hotel') {
            var _a = date[0].currDate,
                _b = date[date.length - 1].currDate,
                _c;

            date.pop();
            _c = date.length;

            for (var i = 0; i < date.length; i += 1) {
                _price += date[i].currPrice;
            }

            if (date.length > 1) {
                _stock = (date.reduce(function (prev, cur, index, array) {
                    return {
                        stock: Math.min(prev.leftSum || prev.stock, cur.leftSum)
                    };
                })).stock
            } else {
                _stock = date[0].leftSum
            }

            $ord.beginDate.val(_a);
            $ord.endDate.val(_b);
            $('#calendarTogg').text(_a + ' 至 ' + _b + '  ' + _c + '晚');
        } else if (module === 'traffic') {
            minNum = date.minNum;
            maxNum = date.maxNum;
            if (date.stockPriceMap.length) {
                _price = date.stockPriceMap[0].price;
                _stock = date.stockPriceMap[0].stock
            } else {
                $('.traffic-select').parent().html("暂无票型").css('color', '#f66')
            }
            $('input[name=id]').val(date.frequencyId);
        } else {
            _price = date.currPrice;
            _stock = date.leftSum;
            $('#calendarTogg span').text(date.currDate);
            $ord.beginDate.val(date.currDate);
            $ord.endDate.val(date.currDate);
        }

        if (_price) {
            $ord.price.text(_price);
            initNumber(_stock, date);
        } else {
            $ord.price.text('暂无价格');
            $ord.formBtn.addClass('background-gray').unbind('click');
        }

    };
    $("#calendar").calendar({
        multipleMonth: 3,
        settingdata: calendarDates,
        multipleSelect: module === 'hotel' ? true : false,
        click: function (dates) {
            initDom(module === 'hotel' ? dates : dates[0]);
            $("#calendar").hide();
        }
    });
    $('#calendarTogg').on('click', function () {
        $("#calendar").show();
    });

    // 下单页隐藏联系人信息重新输入
    var changeInputs = $('.changeInput,.order-item .icon-iconfont-xie');
    changeInputs.click(function () {
        var $this = $(this)
            , $thisInput = $this.parents('.order-item').find('input');

        if (!$this.hasClass('changeInput')) {
            $this = $this.parents('.order-item').find('.changeInput');
        }

        if (!$this.hasClass('changeInput') || $this.css('display') === 'none') {
            $thisInput.focus();
        } else {
            $thisInput.removeClass('hide').focus();
            $this.hide()
        }

    });

    // $('.order-item input').focus(function(){
    //     $(this).next("i").removeClass("icon-iconfont-xie").addClass("icon-iconfont-pxchaxian");
    // })
    // .blur(function(){
    //     $(this).next("i").removeClass("icon-iconfont-pxchaxian").addClass("icon-iconfont-xie");
    // })

    function localTime(t) {
        var _a = t.split('-');
        return new Date(_a[0], +_a[1] - 1, _a[2]).getTime();
    }

    // 初始化订单，默认为库存第一天
    if (module === 'ticket' || module === 'combo' || module === 'repast' || module === 'qr' || module === 'shop') {
        //initDom(calendarDates[0], 1);
    } else if (module === 'hotel') {
        // var reAr = [], _be = localTime(beginDate), _en = localTime(endDate);
        // calendarDates.map(function (item, index) {
        //     var _a = localTime(item.currDate.substr(0, 10));
        //     console.log(_a + "," + _be);
        //     if (_be <= _a && _a <= _en) {
        //         reAr.push(item);
        //     }
        // });
        //initDom(reAr);
    } else if (module === 'traffic') {
        var _a = $('.traffic-select').find("option:eq(0)").data('stock');
        //initDom(_a);
    } else {
        // if (!$ord.price.text()) {
        //     $ord.price.html('暂无价格');
        //     $ord.formBtn.addClass('background-gray').unbind('click');
        // } else {
        //     initNumber(stock);
        // }
    }

    // 初始化加減框
    function initNumber(stock, date) {
        var _min = minNum || 1,
            _max = maxNum || false;

        if (!stock || +_min > +stock) {
            $("#numbernum").html('库存不足');
            $ord.formBtn.addClass('background-gray').unbind('click');
        } else {
            if (isRealName === 'T') {
                intiUser(+_min);
            }
            if (module === 'hotel') {
                initOrderList(date, +_min)
            }
            var _dmin = _min,
                _dmax,
                _minx = {
                    min: _dmin,
                    onChange: function (evl, value) {
                        var _value = parseInt(value);
                        if (smz == 0) {
                            return;
                        }
                        if ($("#route-list").length > 0) {
                            routetotalprice();
                        } else {
                            if (isRealName === 'T') {
                                intiUser(+_value);
                            }
                            if (module === 'hotel') {
                                initOrderList(date, _value);
                            }
                            if (module === 'shop') {
                                var _areaCode = $ord.infoAddress.find('select').eq(1).val().split(',')[0];
                                getPostage(_areaCode, _value);
                                addPosttagePrice(_value);
                            } else {
                                totalprice(_value);
                            }

                        }

                    }
                };

            if (_max) {
                _dmax = Math.min(+_max, +stock);
            } else {
                _dmax = stock;
            }
            if (_dmax) {
                _minx.max = _dmax;
            }
            $('input[name=num]').val(_dmin);
            totalprice(_dmin);
            $("#numbernum").html($('<input>', {
                type: 'tel',
                value: _dmin,
                name: 'amount',
                class: 'numbernum'
            })).find('.numbernum').numSpinner(_minx);

            $ord.formBtn.removeClass('background-gray').on('click', subForm);
        }
    }

    function initOrderList(date, num) {
        var _d = '';

        date.map(function (item, index) {
            _d += '<li>' + item.currDate +
                '<span class="fr price">' +
                '<em>￥</em>' +
                '<strong>' + item.currPrice + '</strong>  * ' +
                '<strong>' + num + '</strong>' +
                '</span>' +
                '</li>';
        });
        $('#cost-dialog #costList').html(_d);
    }

    // 实名制
    function intiUser(num) {
        var _userDom = '';

        for (var i = 1; i < num; i += 1) {
            _userDom += '<ul class="order-list myorder-list">' +
                '<li>' +
                '<label for="" class="lab-title">游客' + (i + 1) + '</label>' +
                '<div class="order-item">' +
                '<input id=linkName' + i + ' type="text" name="linkMans" value="" placeholder="请填写姓名"  class="order-text">' +
                '<i class="font-icon fr icon-iconfont-xie"></i>' +
                '</div>' +
                '</li>' +
                '<li>' +
                '<label for="" class="lab-title">身份证</label>' +
                '<div class="order-item">' +
                '<input id=linkCard' + i + ' type="text" name="idNos" value="" placeholder="请填写身份证" class="order-text card_box">' +
                '<i class="font-icon fr icon-iconfont-xie"></i>' +
                '</div>' +
                '</li>' +
                '</ul><div class="page-line"></div>';
        }
        $('#userAuth').html(_userDom);
    }

    // 交通选择票型
    $('.traffic-select').on('change', function () {
        var _a = $(this).find("option:checked").data('stock');
        initDom(_a);
    });

    totalPrice = parseFloat($ord.totalPrice.text() || 0)
    //获取默认的邮费
    var areaCode = $('#areaCode').val();
    if (areaCode) {
        getPostage(areaCode)
    }

    /**
     * 获取邮费
     * 
     * @param {string} areaCode 地址code
     */
    function getPostage(areaCode, number) {
        $.get('/order/getPostage?areaCode=' + areaCode)
            .success(function (data) {
                if (data[0].status == 200) {
                    console.log("邮费" + data[0].data);
                    var _string = data[0].data ?
                        '<em class="c-price">￥</em><span class="c-price">' + data[0].data + '</span>' :
                        '包邮';
                    $ord.expressPrice.html(_string);
                    addPosttagePrice()
                }

            })
    }

    /**
     * 计算邮费
     */
    function addPosttagePrice() {
        var _expressPrice = parseFloat($ord.expressPrice.find('span').text() || 0);
        var _payPrice = parseFloat($('#payPrice').text() || 0);
        $ord.totalPrice.html(operation.accAdd(_expressPrice, totalPrice));
        totalprice();
    }

    /**
     * 表单验证
     */
    function formValidate(goodsWayType) {
        var rules = {
            realNames: {
                required: true,
                maxlength: 10
            },
            realIds: {
                required: true
            },
            //提货人
            buyerName: {
                required: true,
                maxlength: 10
            },
            //提货手机号
            buyerMobile: {
                required: true,
                isMobile: true
            },
            //身份证
            buyerIdNo: {
                required: isNeedIdCard === 'T',
                isIdCardNo: true
            },
            //自提地址
            buyerAddr: {
                required: goodsWayType,
            },
            realName: {
                required: true,
                maxlength: 10
            },
            idCard: {
                required: true,
                isIdCardNo: true
            }
        }

        validator = $ord.form.validate({
            ignore: ":hidden",
            rules: rules
        });

    }

    function addAdressForm() {
        addressFormValidator = $('#addressForm').validate({
            rules: {
                // title: {
                //     required: true,
                //     maxlength: 10,
                // },
                linName: {
                    required: true,
                    han: true,
                    maxlength: 10,
                },
                addressDetail: {
                    required: true,
                    maxlength: 50
                },
                likPhone: {
                    required: true,
                    isMobile: true
                },
                zipCode: {
                    required: false,
                    isZipCode: true
                }
            }
        });
    }
    if (typeof isWx !== 'undefined' && isWx === 'T') {
        checkWxFans()
        touch.on('#reloadQr', 'tap', checkWxFans);
    } 
    
    // 是否关注公众号
    function checkWxFans() {
        $.ajax({
            url: '/check/isFans?m_id=' + merchantInfoId,
            beforeSend: function (xhr) {
                $.showLoading();
            },
            complete: function (xhr, status) {
                $.hideLoading();
            },
            success: function (data) {
                if (data.status !== 200) {
                    console.log(data.message)
                    $('#wxQr,#wxQrMask').hide();
                } else {
                    if (data.result && data.result.qrUrl) {
                        $('#wxQr,#wxQrMask').show();
                        $('#wxQr img').attr('src', data.result.qrUrl);
                        $('#wxTitle').html(data.result.name)
                    }
                    else {
                        $('#wxQr,#wxQrMask').hide();
                    }
                }
            },
            error: function (err) {
                console.log(err)
            }

        })
    }

    // ipone 兼容处理
    $('input.order-text').on('blur', iosBlur)
    function iosBlur() {
        var ua = window.navigator.userAgent;
        //$alert('浏览器版本: ' + app + '\n' + '用户代理: ' + ua);
        // alert(ua.match(/\(i[;]+;( U;)? CPU.+Mac OS X/))
        if (ua.match(/(iPad).*OS\s([\d_]+)/) || ua.match(/(iPhone\sOS)\s([\d_]+)/)) {
            //ios系统
            var currentPosition, timer;
            var speed = 1;
            timer = setInterval(function () {
                currentPosition =
                    document.documentElement.scrollTop || document.body.scrollTop;
                currentPosition -= speed;
                window.scrollTo(0, currentPosition); //页面向上滚动
                currentPosition += speed;
                window.scrollTo(0, currentPosition); //页面向下滚动
                clearInterval(timer);
                // alert("失去焦点")
                console.log("失去焦点")
            }, 100);
        }
    }

      //首先，设置cookie值，使到不同的页面刷新拖拽的按钮位置不会变
      function setCookie(name, value, expires) {
        // var oDate = new Date();
        // oDate.setDate(oDate.getDate() + expires);
        document.cookie = name + '=' + value;
    }
    function getCookie(name) {
        var arr = new Array();
        arr = document.cookie.split("; ");
        var i = 0;
        for (i = 0; i < arr.length; i++) {
            arr2 = arr[i].split("=");
            if (arr2[0] == name) {
                return arr2[1];
            }
        }
        return '';
    }
    function removeCookie(name) {
        setCookie(name, '随便什么值，反正都要被删除了', -1);
    }
});