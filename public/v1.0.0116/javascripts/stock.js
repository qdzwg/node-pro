$(function () {
    var $orderInfoContent = $('#orderInfoContent')
        , $orderInfoPrice = $orderInfoContent.find('.product-price')
        , $orderInfoTime = $('#calendarTogg')
        , $orderInfoNum = $('#tikcetOrderList .persion-info-warp__number')
        , $calendarBox = $('#calendar-box')
        , $calendar = $('#calendar')
        , $totalprice = $('#totalprice')
        , $submitBtn = $('#pOrderSubmit')
        , $realNameLists = $('#realNameLists')
        , $payModule = $('#payModule')
        ;

    // 优惠券
    var $couponList = $('#couponList'),
        $couponsListLayer = $('#couponListLayer'),
        $couponInfo = $('#couponInfo'),
        $choiceCoupons = $('#choiceCoupons'),
        $couponHandlePrice = $('.couponHandlePrice'),
        $payPrice = $('#payPrice'),
        $inputCouponCode = $('input[name=couponCode]');

    var ttotalP = 0.00;
    var $faceTarget = null;
    $('.numbernum').val(0);
    // if ($orderInfoPrice.text() !== '暂无可售' && typeof +$orderInfoPrice.text() === 'number') {
    //     ttotalP = operation.accMul($orderInfoPrice.text(), $('.numbernum').val()).toFixed(2);
    // }
    $("input[name='paySum']").val(ttotalP);
    $totalprice.text(ttotalP.toFixed(2));
    initNumbers();

    //日历库存
    var mdate = new Date();
    var todayDate = mdate.getFullYear() + "-" + change(mdate.getMonth() + 1) + "-" + change(mdate.getDate());
    if (typeof selectedDate === 'undefined' || !selectedDate) selectedDate = todayDate;

    $orderInfoTime.unbind('click').on('click', function () {
        $.get('/ticketStock?month=' + calenderMonth + '&m_id=' + merchantInfoId + '&id=' + ticketid + '&module=' + module, {}, function (data) {
            if (data[0].status == 200 && data[0].data) {
                var calanderDate = data[0].data;
                var options = {};
                if (module === 'ticket') {
                    options = {
                        selecteday: selectedDate,
                        stratday: mdate.getFullYear() + "-" + change(mdate.getMonth() + 1) + "-" + change(mdate.getDate()),
                        settingdata: calanderDate,
                        multiselect: false,
                        onClick: function (evl, date, price, ticket) {
                            var numberDom = $('<input type=tel class="numbernum" data-val=0 value=0 data-min="0" data-max=' + (ticket == true ? "9999" : ticket) + '><input name="amounts" type="hidden" value="0">')
                            $orderInfoTime.find('span').text(date);
                            $orderInfoNum.html(numberDom);
                            $orderInfoPrice.text(price);
                            selectedDate = date;
                            $('input[name=startTime]').val(date);
                            $('#tikcetOrderList').find('.time-box').empty().hide();
                            $('#tikcetOrderList').find('input[name=FsyyTimes]').val();
                            initNumbers(1);
                            cancleCoupons()
                            setTimeout(function () {
                                $calendarBox.removeClass("calendar-show");
                            }, 300);
                            $totalprice.html(operation.accMul($('.numbernum').val(), $orderInfoPrice.text()).toFixed(2));
                        }
                    };
                }
                else {
                    options = {
                        multipleMonth: 3,
                        multipleSelect: true,
                        settingdata: calanderDate,
                        showMonth: false,
                        click: function () {

                        }
                    }
                }
                $calendar.calendar(options);
                $calendarBox.addClass("calendar-show");
            }
            else if (data[0].status === 402) {
                $.alert(data[0].message);
            }
        })
    });

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

    // 表单提交
    $submitBtn.unbind('click').on('click', function () {
        var $thisBtn = $(this);
        var $tikcetOrderList = $('#tikcetOrderList');
        if ($thisBtn.hasClass('background-gray')) return;

        var parmdata = {};
        if (module === 'ticket') {
            $(".numbernum").each(function () {
                var $this = $(this);
                if (!$this.is(":hidden") && +$this.val()) {
                    var $numberWarp = $this.parents('.persion-info-warp__number')
                        // , stockCode = $numberWarp.data('stockcode')
                        , isFsyy = $numberWarp.data('isfsyy')
                        , hasStock = isFsyy && isFsyy === 'T';
                    if (hasStock) {
                        var ableSelectedTimes = $tikcetOrderList.find('.time-box span.able');
                        var $selectedTime = $tikcetOrderList.find('.time-box span.selected');
                        if (ableSelectedTimes.length > 0) {
                            parmdata.code = $tikcetOrderList.find('input[name=modelCodes]').val();
                            parmdata.startTime = $selectedTime.data('start');
                            parmdata.endTime = $selectedTime.data('end');
                            $tikcetOrderList.find('input[name=FsyyTimes]').val(JSON.stringify(parmdata));
                        } else {
                            $('.tips p').text('当前游玩日期没有可选时间段，换个日期试试');
                            $('.tips,#mask').show();
                            isAble = false
                        }
                    }
                }
            });

            var completeFaceData = true;

            $('.realNameFace').each(function(){
                var $this = $(this);
                if(!$this.is(':hidden')) {
                    if (!$this.next().val())  {
                        $.alert('人脸信息不能为空');
                        completeFaceData = false;
                    }
                }   
            });
            if (!completeFaceData)  return;
        }
        if (validator.form()) {
            var _url = "/order/" + module + "?" + $('#form').serialize();
            $.ajax({
                url: _url,
                type: 'POST',
                beforeSend: function (xhr) {
                    $.showLoading();
                    $submitBtn.removeClass('background-base').addClass('background-gray');
                },
                complete: function (xhr, status) {
                    $.hideLoading();
                    $submitBtn.removeClass('background-gray').addClass('background-base');
                },
                success: function (data) {
                    if (data[0].status == "400") {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    } else if (data[0].status == "200") {
                        if (merchantInfoId === '229') {
                            window.location.href = '/pay/' + module + '?orderNo=' + data[0].data.payOrderNo + '&paySum=0&m_id=' + merchantInfoId;
                        } else {
                            $payModule.find('.price').text(data[0].data.paySum.toFixed(2))
                            $payModule.find('#goPayBtn').data('href', '/pay/' + module + '?orderNo=' + data[0].data.payOrderNo + '&name=' + data[0].data.orderDescription
                                + '&paySum=' + data[0].data.paySum.toFixed(2) + '&m_id=' + merchantInfoId)
                            $payModule.addClass('show');
                            $('#mask').show();
                        }
                    } else {
                        if (data instanceof Array && data[0].message) {
                            $.alert(data[0].message)
                        }
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })

        } else {
            var $errorList = $('label.error');
            $submitBtn.removeClass('background-gray').addClass('background-base');
            if ($errorList.length > 0) {
                var top = ($errorList.eq(0).offset().top - 100);
                if (top < 0) top = 0;
                $(window).scrollTop(top);
            }
        }
    });

    function cancleCoupons() {
        $couponInfo.text('优惠活动信息');
        $choiceCoupons.find('span').text('优惠券选择');

        //页面上存储优惠券信息
        $couponInfo.data('cut', 0);

        $inputCouponCode.val(''); //优惠券码
        $couponHandlePrice.text('');
        totalprice()
        $couponList.find('li').removeClass('normal');
        $couponsListLayer.removeClass('show');
        $payPrice.html('');
    }
    window.cancleCoupons = cancleCoupons;
});
function change(t) {
    if (t < 10) {
        return "0" + t;
    } else {
        return t;
    }
}

function initNumbers(status) {
    if (typeof isRealName !== 'undefined' && isRealName === 'T') {
        var currentIndex = 0;
        var $realNameLists = $('#realNameLists');
        var thisCode = $realNameLists.data('code');
        realNameObj = []; // 重置；
        realNameObj.push({
            code: thisCode,
            list: []
        });
        var oldRealNameLists = $realNameLists.find('ul');
        var oldNums = oldRealNameLists.length || 0;
        for (var i = 0; i < oldNums; i++) {
            $("#realName_0_" + (oldNums - i - 1)).rules('remove')
            $("#idCard_0_" + (oldNums - i - 1)).rules('remove')
            $("#idCard_0_" + (oldNums - i - 1) + '_oc').rules('remove') // 其他证件
            oldRealNameLists.eq(oldNums - i - 1).remove();
        }
    }


    var $pOrderSubmit = $('#pOrderSubmit');
    $(".numbernum").numSpinner({
        min: $(".numbernum").data("min"),
        max: $(".numbernum").data("max"),
        disabled: !!$(".numbernum").attr('disabled'),
        onChange: function (evl, value) {
            var $evl = $(evl);
            var oldVal = $evl.data('val');
            if ($('input[name=couponCode]').val()) {
                cancleCoupons()
            }

            value = +value;
            var tPrice = +$('.product-price').text();
            var totalPrice = operation.accMul(tPrice, value).toFixed(2);
            if (isNaN(totalPrice)) totalPrice = 0.00;
            var timesBox = $evl.parents('#tikcetOrderList').find('.time-box'); // 分时预约的时间容器
            var $numberBox = $evl.parents('.persion-info-warp__number'); // 时间选择器容器
            var needface = $numberBox.data('needface');
            $('input[name="amounts"]').val(value);
            $('#totalprice').html(totalPrice);
            $("input[name='paySum']").val(totalPrice);
            if (+oldVal === 0 && +value > 0) {
                var noticeLayer = $evl.parents('#tikcetOrderList').find('.notice-layer');
                var isFsyy = $numberBox.data('isfsyy');
                if (noticeLayer.length > 0) {
                    var cloneLayer = noticeLayer.clone(true);
                    cloneLayer.addClass('noticeLayer');
                    $('body').append(cloneLayer);
                    $('.noticeLayer').show();
                    $('#noticeMask').show();
                }
                if (isFsyy && isFsyy === 'T') {
                    if (!timesBox.find('span').size() && !timesBox.find('p').size()) {
                        var thisTime = $('.order-calendar__time').find('span').text();
                        try {
                            $.ajax({
                                type: "GET",
                                async: false,
                                url: '/detail/timeReserveList?externalCode=' + $numberBox.data('external') + '&startTime=' + thisTime + '&endTime=' + thisTime,
                                success: function (body) {  //function1()
                                    if (body && body.status === 200 && body.data.length > 0) {
                                        timesBox.html(getTimeReserveList(body.data));
                                        timesBox.find('span.able').unbind('click').click(function () {
                                            $(this).addClass('selected').siblings().removeClass('selected');
                                        })
                                        $evl.data('val', value);
                                    } else {
                                        timesBox.html('<p class="c-price">当前游玩日期没有可选时间段，换个日期试试</p>');
                                        console.log('获取时间段数据错误');
                                        $evl.val(0);
                                        $evl.data('val', 0);
                                    }
                                },
                                failure: function (result) {
                                    console.log('Failed');
                                },
                            });
                            timesBox.show();
                        } catch (error) {
                            console.log(error)
                            timesBox.html('<p class="c-price">当前游玩日期没有可选时间段，换个日期试试</p>');
                            console.log('获取时间段数据错误');
                            $evl.val(0);
                            $evl.data('val', 0);
                        }

                    } else if (timesBox.find('span').size()) {
                        timesBox.show();
                        $evl.data('val', value);
                    } else {
                        $evl.val(0);
                        $evl.data('val', 0);
                    }
                } else {
                    $evl.data('val', value);
                }

            } else if (+oldVal > 0 && +value === 0) {
                timesBox.hide();
                $evl.data('val', 0);
            }
            else {
                $evl.data('val', value);
            }

            if (typeof isRealName !== 'undefined' && isRealName === 'T') {
                var $realNameItems = $realNameLists.find('ul');
                var nowNums = $realNameItems.length || 0;
                var steepNums = 0; // 实际数量差距
                steepNums = Math.abs(nowNums - value);
                if (nowNums > value) {
                    for (var i = 0; i < steepNums; i++) {
                        $("#realName_0_" + (nowNums - i - 1)).rules('remove')
                        $("#idCard_0_" + (nowNums - i - 1)).rules('remove')
                        // $("#idCard_0_" + (nowNums - i - 1)+'_oc').rules('remove')
                        $realNameItems.eq(nowNums - i - 1).next().remove();
                        $realNameItems.eq(nowNums - i - 1).remove();
                        currentIndex--;
                        realNameObj[0].list.splice(currentIndex, 1);
                        $('input[name=realNames]').val(JSON.stringify(realNameObj))
                    }
                }
                else if (value > nowNums) {
                    for (var j = 0; j < steepNums; j++) {
                        $realNameLists.append(addRealNameUser(nowNums + j, needface));

                        realNameObj[0].list.push({
                            name: '',
                            idNo: '',
                            idcardType: 'id',
                            faceUrl:''
                        })
                        currentIndex++;
                        // formValidate(false, pOrderRealNameRules)
                        $("#realName_0_" + (nowNums + j)).rules('add', {
                            required: true,
                            maxlength: 10
                        })
                        $("#idCard_0_" + (nowNums + j)).rules('add', {
                            required: true,
                            isIdCardNo: true
                        })
                        $("#idCard_0_" + (nowNums + j)+'_oc').rules('add', {
                            required: true,
                            maxlength: 17
                        })

                        // 证件类型选择
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

                        // if (needface === 'T') {
                        //     // 实名制部分人脸录入 
                        //     $('.realNameFace').live('click',function(){
                        //         $faceTarget = $(this).hasClass('realNameFace') ? $(this) : $(this).parents('.realNameFace');
                        //         $("#select_btn").trigger('click');
                        //     })
                        // }

                        // 打开人脸录入
                        // $('.openLinkBook').live('click',function(e){
                        //     e.stopPropagation();
                        //     var $this = $(this);
                        //     $faceTarget = $this.parents('.order-input-list'); // ul
                        //     $('#mask').fadeIn(100);
                        //     $('#userEditer').css('bottom', 0); 
                        // })
                        
                    }
                }

            }

            if (!value) {
                $pOrderSubmit.removeClass('background-base').addClass('background-gray');
            }
            else if ($pOrderSubmit.hasClass('background-gray')) {
                $pOrderSubmit.removeClass('background-gray').addClass('background-base');
            }
        }
    });

    

    // 购票提醒，点击同意
    $('.notice-layer .agree').click(function () {
        var currentLi = $('#tikcetOrderList');
        var isFsyy = currentLi.find('.persion-info-warp__number').data('isfsyy');
        if (isFsyy && isFsyy === 'T') {
            currentLi.find('.time-box').show();
        }
        $('.noticeLayer').remove();
        $('#noticeMask').hide();
    })

    // 购票提醒，点击不同意
    $('.notice-layer .disagree').click(function () {
        var currentLi = $('#tikcetOrderList');
        var isFsyy = currentLi.find('.persion-info-warp__number').data('isfsyy');
        var totalNum = 0, totalPrice = 0;
        $('.noticeLayer').remove();
        currentLi.find('.numbernum').val(0).data('val', 0);
        if ($('#realNameLists').length > 0) {
            $('#realNameLists').html('');
        }

        $(".numbernum").each(function () {
            var $that = $(this);
            totalNum = operation.accAdd(totalNum, $that.val());
            totalPrice = operation.accAdd(totalPrice, operation.accMul($that.val(), $that.parents('#tikcetOrderList').find(".product-price").text()));
        });
        
        $('#totalprice').text(totalPrice);

        totalNum > 0
            ? $pOrderSubmit.removeClass('background-gray').addClass('background-base')
            : $pOrderSubmit.removeClass('background-base').addClass('background-gray');
        $('#noticeMask').hide();

        if (isFsyy && isFsyy === 'T') {
            currentLi.find('.time-box').hide();
        }
    })

}


function addRealNameUser(n, needface) {
    var realName = '';
    realName += '<ul class="order-list myorder-list order-input-list">'
        + '<li class="title">'
        + '<div class="order-item order-realname-title">游玩人' + (n + 1) + '</div>'
        + '<div class="order-calendar__icon openLinkBook" > <i class="xx-icon icon-lianxiren order-calendar-icon"></i><span>选择</span></div>'
        + '</li>'
        + '<li style="width:' + (hasIdCardCamera === 'T' ? '80%':'')+'"><label for="" class="lab-title">姓名</label>'
        + '<div class="order-item"><input id="realName_0_' + n + '" name="realName_0_' + n + '" type="text" value="" placeholder="须与证件上一致" class="order-text order-name">'
        + '</div>'
        + '</li>'
        // + '<li><label for="" class="lab-title">身份证</label>'
        // + '<div class="order-item"><input id="idCard_0_' + n + '" name="idCard_0_' + n + '" type="text" value="" placeholder="请填写身份证号" class="order-text order-idcard">'
        // + '<i class="xx-icon fr icon-iconfont-xie"> </i></div>'
        // + '</li>'
        +  '<li style="overflow:auto">'
        +  '<div class="chooseType card-type-label">'
        +  '<span class="mnSelect">'
        +  '<em class="input_select">身份证</em><i class="xx-icon icon-xiangyoujiantou"></i>'
        +  '<input  name="idcardType_0_'+ n +'" type="hidden" value="passport" class="order-text typeName">'
        +  '</span></div>'
        +  '<div class="order-item">'
        + '<input type="text" id="idCard_0_' + n + '" name="idCard_0_'+n+'" placeholder="请填写身份证号" value="" class="order-text order-idcard buyerIdNo__id" >'
        + '<input type="text" id="idCard_0_' + n + '_oc" name="idCard_0_' + n +'_oc" placeholder="请填写证件号" value="" style="display: none;" class="order-text order-idcard buyerIdNo__oc">'
        +  '</div></li>';

    if (needface === 'T') {
        realName += '<li><label class="lab-title" for>人脸照</label>'
            + '    <div class="order-item order-face realNameFace">'
            + '        <div class="order-face-icon"><i class="xx-icon icon-camera"></i></div><span>人脸图片用于入园对比（必传）</span>'
            + '    </div><input class="order-text order-faceUrl" name="faceUrl_0_' + n +'" type="text" hidden>'
            + '</li>';
    }
    if (hasIdCardCamera === 'T') {
        realName += '<li class="order-item-card openCardCamera"><div class="order-item-card-box"><i class="xx-icon icon-camera order-item-camera"></i><span>拍照识别</span ><span>身份证</span></div ></li >';
    }
    
    realName += '</ul><div class="page-line"></div>';

    return realName;
}



// 获取分时预约数据
function getTimeReserveList(data) {
    var timesDom = ''
        , timeReserveLists = data;

    if (timeReserveLists.length > 0) {
        for (var i = 0; i < timeReserveLists.length; i++) {
            var className = '';
            if (timeReserveLists[i].num > 0) {
                if (i === 0) {
                    className = 'able selected';
                } else {
                    className = 'able';
                }
            }
            else {
                className = 'disable';
            }

            timesDom += '<span class="' + className + '" data-start=' + timeReserveLists[i].startTime + ' data-end='
                + timeReserveLists[i].endTime + '>' + timeReserveLists[i].startTime + ' - ' + timeReserveLists[i].endTime + '</span>';
        }
    }
    else {
        timesDom += '<p class="c-price">没有可选时间，数量选择无效，换个日期试试</p>'
    }
    return timesDom;
}

