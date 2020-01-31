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
        getSelfPlace: $('#get_self_place')
    };

    var addressFormValidator, getByMySelf; //申明表单验证函数
    var goodsWayType = 0; //商品收货方式选择
    var totalPrice = 0; //缓存初始价格
    var hasTab = null;
    if (module !== 'ticket') formValidate(goodsWayType);

    touch.on("#cost", "tap", function () {
        var height = $ord.costDialog.height();
        $("#mask").show();
        $ord.costDialog.css("margin-top", -height * 0.5).show();
    });

    touch.on("#mask", "tap", function () {
        $("#mask,#cost-dialog").hide();
        $('#payModule').removeClass('show');
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
    }
    if (module !== "mealCoupon") {
        var btnFlag= false;
        var $payModule = $('#payModule');
        $ord.formBtn.removeClass('background-gray').on('click', function () {
            var $t = $(this);
            // var btnFlag = $t.attr('data-flag');
            var hiddenSpace = $('.hidden-space'); //出现则说明没有添加收货地址
            if (module === 'shop' && !goodsWayType && hiddenSpace.size()) {
                $('.tips p').text('您还未添加收货地址');
                $('.mask,.tips').show();
                return false;
            }
            if (!btnFlag && validator.form()) {
                $ord.formBtn.removeClass('background-base').addClass('background-gray');
                var speadCode = getCookie('spread_code_'+merchantInfoId)
                // $t.attr('data-flag', true);
                btnFlag= true;
                var amounts = $("input[name='amounts']").val();
                var _url = "/order/" + module + "?" + $ord.form.serialize() +'&speadCode='+speadCode ;
                if (module === 'shop') _url = _url + '&goodsWayType=' + goodsWayType + '&hasTab=' + hasTab;
                $.post(_url, {}, function (data) {
                    // $t.attr('data-flag', false);
                    $ord.formBtn.removeClass('background-gray').addClass('background-base');
                    if (data[0].status == "400") {
                        window.location.href = '/login?m_id=' + merchantInfoId;                  
                    } else if (data[0].status == "200") {
                        if (merchantInfoId === '229') {
                            window.location.href = '/pay/' + module + '?orderNo=' + data[0].data.payOrderNo + '&name=' + data[0].data.orderDescription + '&paySum=0&m_id=' + merchantInfoId;
                        } else {
                            $payModule.find('.price').text(data[0].data.paySum.toFixed(2))
                            var orderInfo = typeof data[0].data.orderInfoJson === 'string' ? JSON.parse(data[0].data.orderInfoJson) : [];
                            var moduleCode = [];
                            if (orderInfo.length > 0) {
                                orderInfo.forEach(function (item) {
                                    moduleCode.push(item.code)
                                })
                            }
                            $payModule.find('#goPayBtn').data('href', '/pay/' + module + '?orderNo=' + data[0].data.payOrderNo+'&code='+ moduleCode + '&name=' + data[0].data.orderDescription
                                + '&paySum=' + data[0].data.paySum.toFixed(2) + '&m_id=' + merchantInfoId)
                            $payModule.addClass('show');
                            $('#mask').show();
                        }       
                    } else {
                        if (data instanceof Array && data[0].message) {
                            $(".tips p").text(data[0].message);
                            $('.mask,.tips').show();
                        } 
                        btnFlag = false;
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
    // 支付切换
    if ($ord.payModule.size() > 0) {
        $ord.payModule.find('li').on('tap',function(){
            var $this = $(this)
            $ord.payModule.find('.select-icon').removeClass('icon-yuanxingxuanzhongfill').addClass('icon-yuanxingweixuanzhong')
            $this.hasClass('longCard') ? $('#goPayBtn').data('chanel','long') : $('#goPayBtn').data('chanel','normal')
            $this.find('.select-icon').removeClass('icon-yuanxingweixuanzhong').addClass('icon-yuanxingxuanzhongfill')
        })

        $('#goPayBtn').on('tap',function(){
            let payUrl = $(this).data('href')
            let payChanel = $(this).data('chanel')
            if (payChanel === 'long') payUrl += '&chanel='+ payChanel 
            window.location.href = payUrl
        })

    }

    // 日历选择
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
            var $persionOrderItem = $('#tikcetOrderList .persion-order-item');
            var needface = $persionOrderItem.data('needface') || 'F';

            if (typeof isRealName !== 'undefined' && isRealName === 'T') {
                intiUser(+_min, needface);
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
                                intiUser(+_value, needface);
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
    function intiUser(num, needface) {
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
                '</li>';

            if (needface === 'T') {
                _userDom += '<li><label class="lab-title" for>人脸照</label>'
                    +'    <div class="order-item order-face realNameFace">'
                    +'        <div class="order-face-icon"><i class="xx-icon icon-camera"></i></div><span>人脸图片用于入园对比（必传）</span>'
                    +'    </div><input class="order-text order-faceUrl" name="faceUrl' + i +'" type="text" hidden>'
                    +'</li>';
            }

            _userDom +=  '</ul><div class="page-line"></div>';
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

    if (typeof isWx !== 'undefined' && isWx === 'T') {
        checkWxFans()
        touch.on('#reloadQr', 'tap', checkWxFans)
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
                    console.log(data.message);
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