$(function () {
    /**
     * 公用dom绑定
     */
    var $pulicDom = {
        homeSwiper: $('#home_swiper'), //顶部轮播
        mainSwiper: $('#main_swiper'), // 栏目轮播
        detailTabs: $('.detailsTab'),  // 栏目切换 
        ticketList: $('#ticketList'), //子票列表
        totalPrice: $('#totalPrice'), // 总价
        mask: $('#mask'),    // 阴影
        num: $('#num'),
        detailOrder: $('#detail-order'),
        $blockContent:$('.blockContent')
    }

    /**
     * 详情页banner
     */
    if ($pulicDom.homeSwiper.length > 0) {
        new Swiper($pulicDom.homeSwiper, {
            loop: true,
            autoplay: 4000,
            pagination: '.swiper-pagination',
            autoplayDisableOnInteraction: false
        });
    }

    // 栏目切换
    if ($pulicDom.mainSwiper.length > 0) {
        var detailMainSwiper = new Swiper($pulicDom.mainSwiper, {
            autoHeight: true,
            onSlideChangeEnd: function (swiper) {
                $pulicDom.detailTabs.find('.tabItem').eq(swiper.activeIndex).addClass('on').siblings().removeClass('on');
            }
        });
        $pulicDom.detailTabs.find('.tabItem').click(function () {
            var $this = $(this);
            var index = $this.index();
            $this.addClass('on').siblings().removeClass('on');
            detailMainSwiper.slideTo(index, 500, false);//切换到第一个slide，速度为1秒
        });

    }


    if (module === 'hotel') {
        /**
         * 绑定酒店常用DOM
         */
        var $hotelDom = {
            calendar: $('#hotelCalendar'),
            showCosts: $('.show-cost-detail'), //费用明细
        };

        /**
         * 初始化酒店列表
         * @param {Array} date
         * @param {Number} numDays
         */
        function initDom(date, numDays) {
            var length = date.length - 1;
            beginDate = date[0];
            numDays = numDays || length;
            endDate = date[length];
            $.get('/detail/roomItems', {
                merchantInfoId: merchantInfoId,
                merchantHotelInfoId: merchantHotelInfoId,
                currPage: 1,
                pageSize: 100,
                beginDate: beginDate,
                endDate: endDate,
                numDays: numDays,
                isSpecial: isSpecial
            })
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        $pulicDom.ticketList.empty().append(listDom(datas.data, beginDate, endDate, date));

                        detailMainSwiper.update();
                        $hotelDom.calendar.find('span').eq(0).html(beginDate);
                        $hotelDom.calendar.find('span').eq(1).html(endDate);
                        $hotelDom.calendar.find('em').html(numDays);

                        $(".numbernum").each(function () {              // 初始化数量加减框
                            var $this = $(this);
                            $this.numSpinner({
                                min: $this.data("min"),
                                max: $this.data("max"),
                                disabled: !!$this.data("disabled"),
                                onChange: function (evl, value) {
                                    var totalNum = 0,
                                        totalPrice = 0;
                                    $(".numbernum").each(function () {
                                        var $this = $(this);
                                        totalNum = operation.accAdd(totalNum, $this.val());
                                        totalPrice = operation.accAdd(totalPrice, operation.accMul($this.val(), $this.parents('li').find(".unit-price").text()));
                                    });

                                    initOrderList(date, value);
                                    $pulicDom.num.text(totalNum);
                                    $pulicDom.totalPrice.text(totalPrice);
                                    parseInt($pulicDom.num.text()) > 0
                                        ? $pulicDom.detailOrder.removeClass('disabled-btn')
                                        : $pulicDom.detailOrder.addClass('disabled-btn');
                                }
                            });
                        });

                        $pulicDom.detailOrder.addClass('disabled-btn'); // 禁止点击

                        //点击展示费用明细
                        touch.on($pulicDom.ticketList.find('.show-cost-detail'), "tap", function () {
                            var $dialog = $(this).parent().find('.cost-dialog');
                            var $dialogClone = $dialog.clone(true);
                            $dialogClone.addClass('cost-dialog-clone');
                            $('body').append($dialogClone);
                            var height = $dialog.height();
                            $dialogClone.css("margin-top", -height * 0.5).show();
                            $pulicDom.mask.show();
                        });

                        // 套票数据
                        var ticketsItem = null;
                        
                        //套票详情展示
                        $('body').on('tap', '.seeCdetail',function () {
                            var $dialogc = $(this).parents('li').find('.combo-detail-layer');
                            var $dialogClonec = $dialogc.clone(true);
                            $dialogClonec.addClass('combo-dialog-clone');
                            $('body').append($dialogClonec);
                            var height = $dialogc.height();
                            $dialogClonec.css("margin-top", -height * 0.5).show();
                            $pulicDom.mask.show();
                        });  
                         
                        //套票购票展示
                        $('body').on('tap', '.cOrderBtn',function () {
                            ticketsItem = $(this).data('item');
                            if (ticketsItem.modelLabel && typeof ticketsItem.modelLabel === 'string'){
                                ticketsItem.modelLabel = JSON.parse(ticketsItem.modelLabel)   
                            }
                            if($(this).data('notice')=='T'){
                                var $dialogcn = $(this).parents('li').find('.combo-detail-notice');
                                var $dialogClonecn = $dialogcn.clone(true);
                                $dialogClonecn.addClass('combo-notice-clone');
                                $('body').append($dialogClonecn);
                                var height = $dialogcn.height();
                                $dialogClonecn.css("margin-top", -height * 0.5).show();
                                $pulicDom.mask.show();
                            }else{
                                setItem('productDetal',JSON.stringify(ticketsItem))
                                var playDate = $('#hotelCalendar').find('span').eq(0).text(),
                                merchantFamilyInfoId = $(this).data('merchantfamilyinfoid'),
                                merchantFamilyTicketId = $(this).data('merchantfamilyticketid');
                                window.location.href = '/vue/order/tickets?merchantFamilyInfoId='+merchantFamilyInfoId+'&merchantFamilyTicketId='+merchantFamilyTicketId+'&playDate='+playDate+'&m_id='+merchantInfoId
                            }                            
                        });
                       
                        $('body').on('tap', '.no-agree',function () {
                            $('.combo-notice-clone').remove();
                            $pulicDom.mask.hide();
                        });
                        $('body').on('tap', '.agree',function () {
                            // $('.combo-notice-clone').remove();
                            // $pulicDom.mask.hide();
                            setItem('productDetal',JSON.stringify(ticketsItem))
                            var playDate = $('#hotelCalendar').find('span').eq(0).text(),
                                merchantFamilyInfoId = $(this).data('merchantfamilyinfoid'),
                                merchantFamilyTicketId = $(this).data('merchantfamilyticketid');
                                window.location.href = '/vue/order/tickets?merchantFamilyInfoId='+merchantFamilyInfoId+'&merchantFamilyTicketId='+merchantFamilyTicketId+'&playDate='+playDate+'&m_id='+merchantInfoId
                        });
                        touch.on($pulicDom.mask, "tap", function () {
                            $('.cost-dialog-clone').remove();
                            $('.combo-dialog-clone').remove();
                            $('.combo-notice-clone').remove();
                            $pulicDom.mask.hide();
                        });

                        $(".close-take").on("tap", function () {
                            $('.cost-dialog-clone').remove();
                            $("#mask").hide();
                        });

                        $(".price-code-btn").click(function () {
                            $(this).toggleClass("down").parent().parent().nextAll().each(function () {
                                if (!$(this).hasClass("price-code")) {
                                    return false;
                                }
                                $(this).toggle();
                            });
                        });

                        showDetail();
                        comboChildDom();

                    } else {
                        // window.location.href = '/error';
                    }
                    setTimeout(function () {
                        $("#calendar-box").removeClass("calendar-show");
                    }, 500);
                    
                })
                .error(function (err) {
                    // window.location.href = '/error';
                })
        };

        //套票子频道
        function comboChildDom() {
            // var nDate = new Date();
            // var nDateText = dateToString(nDate);
            $.post('/detail/comboChild', {
                id: merchantHotelInfoId,
                merchantInfoId: merchantInfoId,
                businessType: 'hotel',
                dateStr: $('#hotelCalendar').find('span').eq(0).text()
            }).success(function(data){
                if(data[0].data&&data[0].status == 200){
                    var _comboHtml = '';
                    if(data[0].data.length>0){
                        $('.comdetails-list-title').show();
                        for(var i = 0; i < data[0].data.length; i++){
                            if(data[0].data[i].modelLabel){
                                var labelHtml = '';
                                var labelArr = JSON.parse(data[0].data[i].modelLabel);
                                for(var j = 0; j < labelArr.length; j++){
                                    labelHtml += '<span class="label-span">'+labelArr[j]+'</span>'
                                }
                            }
                            _comboHtml += '<li><div class="pro-info">'+                        
                            '<div class="hotel-info" style="margin-left:0"><h4 class="pro-info-title">'+data[0].data[i].modelName+'</h4>'+                        
                            '<p class="pro-info-explian">'+labelHtml+'</p>'+
                            '<div class="pro-info-explian"><a class="seeCdetail" href="javascript:;">查看详情&gt;</a></div></div></div>'+                        
                            '<div class="pro-price pro-numbers-btn"><div class="pro-price-warp"><span class="price"><em>￥</em><strong style="margin-right:0">'+data[0].data[i].salePrice+'</strong></span></div>'+
                            '<div class="combo-order-btn"><a href="javascript:;" class="cOrderBtn" data-item='+JSON.stringify(data[0].data[i])+' data-notice='+data[0].data[i].ticketNotice+' data-merchantFamilyInfoId='+data[0].data[i].merchantFamilyInfoId+' data-merchantFamilyTicketId='+data[0].data[i].id+'>立即预订</a></div>'+
                            
                            '</div><div class="combo-detail-layer"><p>'+data[0].data[i].feeDetail+'</p></div><div class="combo-detail-notice"><h3 class="combo-tips-title">购票提醒</h3><p class="combo-notice-main">'+data[0].data[i].bookRemind+'</p><p class="combo-agree"><span class="no-agree">不同意</span><span class="agree" data-merchantFamilyInfoId='+data[0].data[i].merchantFamilyInfoId+' data-merchantFamilyTicketId='+data[0].data[i].id+'>同意</span></p></div></li>'                        
                        }
                        $('#comboList').empty().append(_comboHtml);  
                    }else{
                        $('.comdetails-list-title').hide();
                    }
                                      
                }
                
            })
        }
        // comboChildDom();
    }

    //票型信息加载
    var ticketDom = function (date) {

        $.get('/detail/ticketItems', {
            merchantInfoId: merchantInfoId,
            merchantParkInfoId: merchantParkInfoId,
            isSpecial: isSpecial,
            currPage: 1,
            pageSize: 100,
            // goodsCode: goodsCode,
            playDate: date,
        })
            .success(function (data) {
                console.log(data);
                var datas = data[0];
                if (datas.status === 200) {
                    $pulicDom.ticketList.empty().append(ticketListDom(datas.data, date));
                    detailMainSwiper.update();
                    $('#ticketCalendar span:eq(0)').html(date);
                    $(".numbernum").each(function () {
                        var $this = $(this)
                        $this.numSpinner({
                            min: $this.data("min"),
                            max: $this.data("max"),
                            disabled: !!$this.attr('disabled'),
                            onChange: function (evl, value) {
                                var totalNum = 0,
                                    totalPrice = 0,
                                    $evl = $(evl);
                                var timesBox = $evl.parents('.stock-item').find('.time-box');
                                var $thisInputBox = $evl.parents('.pro-input-box');
                                var oldVal = $thisInputBox.data('val');

                                if (+oldVal === 0 && +value > 0) {
                                    var noticeLayer = $evl.parents('.stock-item').find('.notice-layer');
                                    var isFsyy = $evl.data('isfsyy');
                                    if (noticeLayer.length > 0) {
                                        var cloneLayer = noticeLayer.clone(true);
                                        console.log(cloneLayer)
                                        cloneLayer.addClass('noticeLayer');
                                        $('body').append(cloneLayer);
                                        $('.noticeLayer').show();
                                        $('#noticeMask').show();
                                        $('.noticeLayer .agree').unbind('click').click(function () {
                                            var index = $(this).parents('.notice-layer').data('index');
                                            var currentLi = $pulicDom.ticketList.find('.stock-item').eq(index);
                                            var _isFsyy = currentLi.find('.numbernum').data('isfsyy');
                                            if (_isFsyy && _isFsyy === 'T') {
                                                currentLi.find('.time-box').show();
                                            }
                                            $('.noticeLayer').remove();
                                            $('#noticeMask').hide();
                                        })

                                        $('.noticeLayer .disagree').unbind('click').click(function () {
                                            var index = $(this).parents('.notice-layer').data('index');
                                            var currentLi = $pulicDom.ticketList.find('.stock-item').eq(index);
                                            var _isFsyy = currentLi.find('.numbernum').data('isfsyy');
                                            var totalNum = 0, totalPrice = 0;
                                            $('.noticeLayer').remove();
                                            if (ticketOrderType === '2') {
                                                currentLi.find('.pro-input-box').data('val', 0).hide().find('.numbernum').val(0);
                                                currentLi.find('.pro-btn-box').show();
                                            } else {
                                                currentLi.find('.pro-input-box').data('val', 0).find('.numbernum').val(0);
                                            }
                                            $(".numbernum").each(function () {
                                                var $that = $(this);
                                                totalNum = operation.accAdd(totalNum, $that.val());
                                                totalPrice = operation.accAdd(totalPrice, operation.accMul($that.val(), $that.parents('.stock-item').find(".price").find("strong").text()));
                                            });
                                            $pulicDom.num.text(totalNum);
                                            $pulicDom.totalPrice.text(totalPrice);
                                            totalNum > 0
                                                ? $pulicDom.detailOrder.removeClass('disabled-btn')
                                                : $pulicDom.detailOrder.addClass('disabled-btn')
                                            $('#noticeMask').hide();

                                            if (_isFsyy && _isFsyy === 'T') {
                                                currentLi.find('.time-box').hide();
                                            }
                                        })
                                    }

                                    if (isFsyy && isFsyy === 'T') {
                                        if (!timesBox.find('span').size() && !timesBox.find('p').size()) {
                                            var thisTime = $('#ticketCalendar').find('span').text();
                                            try {
                                                $.ajax({
                                                    type: "GET",
                                                    async: false,
                                                    url: '/detail/timeReserveList?externalCode=' + $evl.data('external') + '&startTime=' + thisTime + '&endTime=' + thisTime,
                                                    success: function (body) {  //function1()
                                                        if (body && body.status === 200 && body.data.length > 0) {
                                                            timesBox.html(getTimeReserveList(body.data));
                                                            timesBox.find('span.able').unbind('click').click(function () {
                                                                $(this).addClass('selected').siblings().removeClass('selected');
                                                            })
                                                            $thisInputBox.data('val', value);
                                                        } else {
                                                            timesBox.html('<p class="c-price">当前游玩日期没有可选时间段，换个日期试试</p>');
                                                            console.log('获取时间段数据错误');
                                                            $evl.val(0);
                                                            $thisInputBox.data('val', 0);
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
                                                $thisInputBox.data('val', 0);
                                            }

                                        } else if (timesBox.find('span').size()) {
                                            timesBox.show();
                                            $thisInputBox.data('val', value);
                                        } else {
                                            $evl.val(0);
                                            $thisInputBox.data('val', 0);
                                        }
                                    } else {
                                        $thisInputBox.data('val', value);
                                    }

                                } else if (+oldVal > 0 && +value === 0) {
                                    timesBox.hide();
                                    $thisInputBox.data('val', 0);
                                }
                                else {
                                    $thisInputBox.data('val', value);
                                }

                                $(".numbernum").each(function () {
                                    var $that = $(this);
                                    totalNum = operation.accAdd(totalNum, $that.val());
                                    totalPrice = operation.accAdd(totalPrice, operation.accMul($that.val(), $that.parents('.stock-item').find(".price").find("strong").text()));
                                });
                                $pulicDom.num.text(totalNum);
                                $pulicDom.totalPrice.text(totalPrice);
                                totalNum > 0
                                    ? $pulicDom.detailOrder.removeClass('disabled-btn')
                                    : $pulicDom.detailOrder.addClass('disabled-btn')

                            }
                        });
                    });

                    //重置输入框
                    $pulicDom.num.text(0);
                    $pulicDom.totalPrice.text(0);
                    $pulicDom.detailOrder.addClass('disabled-btn');

                    var proInputBox = $('.pro-input-box'), proBtnBox = $('.pro-btn-box');
                    if (ticketOrderType === '2') {
                        touch.on(proBtnBox.find('.pro-buy-btn'), 'tap', function (e) {
                            e.stopPropagation();
                            var _this = $(this);
                            if (_this.hasClass('disabled-btn')) return;
                            proInputBox.hide().data('val', 0).find('.numbernum').val(0);
                            proBtnBox.show();
                            _this.parent().hide().prev().show().find('.add').trigger('click');
                        });
                    } else {
                        proInputBox.show();
                        proBtnBox.hide();
                    }
                    $(".price-code-btn").click(function () {
                        $(this).toggleClass("down").parent().parent().nextAll().each(function () {
                            if (!$(this).hasClass("price-code")) {
                                return false;
                            }
                            $(this).toggle();
                        });
                    });

                    showDetail()

                } else {
                    window.location.href = '/error';
                }
                setTimeout(function () {
                    $("#calendar-box").removeClass("calendar-show");
                }, 500);
            })
            .error(function (err) {
                window.location.href = '/error';
            })
    };

    // 强制设置富文本图片高度为自适应
    $('.blockContent').find('img').height('auto')


    $('#hotelCalendar,#ticketCalendar').on('click', function () {
        var mold = $(this).data("mold"),
            options = {}
        if (mold == "ticket") {
            options = {
                multipleMonth: 4,
                click: function (dates) {
                    ticketDom(dates[0]);
                }
            }
        } else {
            options = {
                multipleMonth: 4,
                multipleSelect: true,
                click: function (dates) {
                    initDom(dates);
                    $('#num,#totalPrice').text('0');
                }
            }
        }
        $("#calendar").calendar(options);
        $("#calendar-box").addClass("calendar-show");
    });

    var nowDate = new Date();
    var nowText = dateToString(nowDate);
    var nextText = dateToString(new Date(nowDate.getTime() + 24 * 60 * 60 * 1000));
    var beginD = beginDate || nowText,
        endD = endDate || nextText,
        numD = numDays || 1;

    if ($('#hotelCalendar').length && module === 'hotel') {
        initDom([beginD, endD], numD);
    }
    if ($('#ticketCalendar').length && module === 'ticket') {
        ticketDom(beginD);
    }

    $('body').on('tap', '.showDetail', function () {
        var _this = $(this);
        if (module == 'ticket' && _this.parents('.stock-item').size()) {
            var cloneLayer = _this.parents('.stock-item').find('.detail-layer').clone(true);
        } else {
            var cloneLayer = _this.parents('li').find('.detail-layer').clone(true);
        }
        cloneLayer.addClass('productLayer');
        $('body').append(cloneLayer);
        $('.productLayer').show();
        _mask.show();
    });
    showDetail();

    // 关闭商品sku弹出层
    function closeGoodsLayer() {
        $('#goodsLayer').removeClass('show');
    }

    $('.layer-close').click(function () {
        closeGoodsLayer();
    });
    $('#selectedSku').click(function () {
        $('#goodsLayer').toggleClass('show');
    });
    // 商品選擇sku
    $('.skuList li').click(function () {
        if ($(this).hasClass("disabled")) {
            return false;
        }
        var itemObj = $(this).data('skuobj');
        if (!itemObj.stockNum) {
            $('#goodsLayer .stockNum').text('库存不足').addClass('c-price');
            $('#goodsLayer .goodsNumBox').hide();
            $('#goodsSubmitOrder').prop('disabled', true).removeClass('background-btn');
        } else {
            $('#goodsLayer .stockNum').text(itemObj.stockNum).removeClass('c-price');
            $('#goodsLayer .goodsNumBox').show();
            $('#goodsLayer .number').numSpinner("max", itemObj.stockNum);
            $('#goodsSubmitOrder').prop('disabled', false).addClass('background-btn');
        }

        if(itemObj.earning){
            $('#ttPrice').html('推广奖励：￥'+itemObj.earning + '>');
            $('#ttPrice').data({
                'price1': itemObj.earning,
                'price2': itemObj.recommend
            });
        }else{
            $('#ttPrice').html('');
        }

        if( typeof itemObj.isMember !== 'undefined' && itemObj.isMember) {
            $('#goodsLayer .skuPrice').text(itemObj.memberPrice);
            $('#goodsLayer .sku-member-flag').show()
            $('#goodsLayer .del-price').text(itemObj.sellPrice)
            $('#goodsLayer .deletePrice').show()
        } else {
            $('#goodsLayer .sku-member-flag').hide()
            $('#goodsLayer .deletePrice').hide()
            $('#goodsLayer .skuPrice').text(itemObj.sellPrice);
        }

        $('#goodsLayer .selectedSkuName, #selectedSku .selectSku').text(replaceStr(itemObj.specParam));
        $('#goodsLayer img').attr("src", itemObj.linkImg);
        $(this).addClass('on').siblings().removeClass('on');

        
    });

    $("#detail-order, #goodsSubmitOrder,#cart-order").click(function () {
        var mold = $(this).data("mold");
        var parmdata = null;
        var isAble = true;
        // 商品弹出sku选择框
        if (mold === 'shop' && !$('#goodsLayer').hasClass('show')) {
            $('#goodsLayer').addClass('show');
            $('#goodsSubmitOrder').data("mold", "shop");
            return false
        }
        //商品购物车
        if (mold === 'cart' && !$('#goodsLayer').hasClass('show')) {
            $('#goodsLayer').addClass('show').data("iscart", true);
            $('#goodsSubmitOrder').data("mold", "cart");
            return false
        }
        if (!$(this).hasClass("disabled-btn")) {
            if (module === 'hotel') {
                parmdata = {
                    beginDate: $('#hotelCalendar span:eq(0)').text(),
                    endDate: $('#hotelCalendar span:eq(1)').text(),
                    numDays: $('#hotelCalendar em').text(),
                    hotelInfoId: hotelInfoId,
                    item: []
                };
                $(".numbernum").each(function () {
                    if (!$(this).is(":hidden")) {
                        parmdata.item.push({
                            id: $(this).data("hotelid"),
                            num: $(this).val(),
                            prices: $(this).parents('li').find('.unit-price').text(),
                            isRealName: $(this).parents('li').find(".pro-info-explian").find("span").hasClass("realNameTip")
                        });
                    }
                });
            } else if (module === 'shop') {
                var msdeDetail = $('.skuInfoBox .skuItem.on').data('skuobj');
                var byMySelf = $(this).data('bymyself');
                var goodsNum = $('.goodsNumBox input.number').val();
                parmdata = {
                    item: []
                }
                parmdata.item.push(msdeDetail);
                parmdata.item[0].num = goodsNum;
                parmdata.item[0].productName = productName;
                parmdata.item[0].wapUrl = $(".itemInfo").find("img").attr("src");
                parmdata.item[0].productCode = productCode;
                parmdata.item[0].prodFrom = prodFrom; 
                parmdata.byMySelf = byMySelf;              

            } else if (module === 'ticket') {
                parmdata = {
                    playDate: $("#ticketCalendar").find("span").text(),
                    item: []
                };
                $(".numbernum").each(function () {
                    var $this = $(this);
                    if (!$this.is(":hidden") && +$this.val()) {
                        var thisItem = {
                            id: $this.data("ticketid"),
                            modelCode: $this.data('code'),
                            num: $this.val(),
                            isRealName: !!$this.parents('.stock-item').find(".pro-info-explian").find("span").hasClass("realNameTip")
                        }
                            , stockCode = $this.data('stockcode')
                            , isFsyy = $this.data('isfsyy')
                            , hasStock = isFsyy && isFsyy === 'T';
                        if (hasStock) {
                            var ableSelectedTimes = $this.parents('.stock-item').find('.time-box span.able');
                            var $selectedTime = $this.parents('.stock-item').find('.time-box span.selected');
                            if (ableSelectedTimes.length > 0) {
                                thisItem.stockCode = stockCode;
                                thisItem.startTime = $selectedTime.data('start');
                                thisItem.endTime = $selectedTime.data('end');
                            } else {
                                $('.tips p').text('当前游玩日期没有可选时间段，换个日期试试');
                                $('.tips,#mask').show();
                                isAble = false
                            }
                        }
                        parmdata.item.push(thisItem)
                    }
                });
            }
            else {
                parmdata = {
                    playDate: $("#ticketCalendar").find("span").text(),
                    item: []
                };
                $(".numbernum").each(function () {
                    var $this = $(this);
                    if (!$this.is(":hidden") && +$this.val()) {
                        var thisItem = {
                            id: $this.data("ticketid"),
                            num: $this.val(),
                            isRealName: !!$this.parents('li').find(".pro-info-explian").find("span").hasClass("realNameTip")
                        }
                            , stockCode = $this.data('stockcode')
                            , isFsyy = $this.data('isfsyy')
                            , hasStock = isFsyy && isFsyy === 'T';
                        if (hasStock) {
                            var ableSelectedTimes = $this.parents('li').find('.time-box span.able');
                            var $selectedTime = $this.parents('li').find('.time-box span.selected');
                            if (ableSelectedTimes.length > 0) {
                                thisItem.stockCode = stockCode;
                                thisItem.startTime = $selectedTime.data('start');
                                thisItem.endTime = $selectedTime.data('end');
                            } else {
                                $('.tips p').text('当前游玩日期没有可选时间段，换个日期试试');
                                $('.tips,#mask').show();
                                isAble = false
                            }
                        }
                        parmdata.item.push(thisItem)
                    }
                });
            }
            if (!isAble) return;

            if (mold == "cart") {
                parmdata.productCode = productCode;
                parmdata.productName = productName;
                parmdata.wapUrl = $(".itemInfo").find("img").attr("src");
                parmdata.prodFrom = prodFrom;
            }
            $.post('/cache/' + mold, {
                parmdata: JSON.stringify(parmdata)
            }, function (data) {
                if (data[0].status === 200) {
                    var id = merchantParkInfoId;
                    if (mold == "cart") {
                        $("#goodsLayer").removeClass('show');
                        $("#cartNmu").text(operation.accAdd($("#cartNmu").text(), 1));
                        window.location.href = "/cart?m_id=" + merchantInfoId;
                        return;
                    }
                    switch (mold) {
                        case "ticket":
                            id = merchantParkInfoId;
                            break;
                        case "hotel":
                            id = merchantHotelInfoId;
                            break;
                        case 'shop':
                            id = msdeDetail.merchantMsdeInfoId;
                            break;
                    }
                    window.location.href = "/order/" + mold + "/" + id + "?m_id=" + merchantInfoId;
                }
                if (data[0].status === 402) {
                    $('.tips p').text(data[0].message);
                    $('.tips').show();
                    $('#mask').show();
                }
                if (data[0].status === 400) {
                    window.location.href = '/login?m_id=' + merchantInfoId;
                }
            }, "json");
        }
    });


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

    $('body').on('tap', '.markshow_open', function () {
        var thisP1= $(this).data('price1'),
            thisP2= $(this).data('price2');
        $('.markinfo-mask').show();
        $('.markinfo-con').css({'bottom': 0});
        $('#mkf_p1').html(thisP1+' 元');
        if(!thisP2 || thisP2==='undefined'){
            $('#mkf_p2').parent().hide();
        }else{
            $('#mkf_p2').html(thisP2+' 元').parent().show();
        }
    });
    $('body').on('tap', '.mkf-close', function () {
        $('.markinfo-mask').hide();
        $('.markinfo-con').css({'bottom': '-100%' });
    });
});



function listDom(datas, begin, end, date) {
    var dom = '';
    var list = datas.rows,
        len = list.length;
    var selectedDateArray = date || [];
    list.reverse();
    while (len--) {
        // var _url = list[len].enabled ? 'href="/order/hotel/' + list[len].rateCode + '?beginDate=' + begin + '&endDate=' + end + '"' : 'class="gray_btn"';
        var ratecode = list[len].ratecodes || '',
            ratelength = ratecode.length || '';
        var handle = '<input type="text" class="numbernum"  value=0 data-min=0 data-max=999 data-hotelid=' + list[len].id + '>';

        if (list[len].ifEnough === 'F') {
            handle = '<div class="room-btn disable">已订完</div>'
        }

        if (ratelength > 0) {
            handle = '<a href="javascript:;" class="price-code-btn down"><i class="font-icon icon-iconfont-jiantou"></i></a>';
        }

        var priceArrow = list[len].prices || []; //存储价格区间
        var showPriceArray = []; // 存储展示价格
        if (selectedDateArray.length < 3) {
            selectedDateArray = []; //清空
            var beginDateCode = new Date(begin).getTime();
            var buildDate = '';
            while (!!end && buildDate !== end) {
                buildDate = dateToString(new Date(beginDateCode));
                selectedDateArray.push(buildDate)
                beginDateCode += 1000 * 60 * 60 * 24
            }
        }

        for (var ins = 0; ins < selectedDateArray.length - 1; ins++) {
            for (var j = 0; j < priceArrow.length; j++) {
                if (priceArrow[j].day === selectedDateArray[ins]) {
                    showPriceArray.push(priceArrow[j])
                }
            }
        }

        var priceDetailList = '';
        var _price = 0;
        // 酒店详情展示价格修改20190729zwg
        var pricesArr = [];
        //修改结束
        if (showPriceArray instanceof Array && showPriceArray.length > 0 ) {
            showPriceArray.forEach(function (item) {
                _price += (+item.salePrice);
                pricesArr.push(item.salePrice);
                priceDetailList += '<li>' + item.day
                    + '<span class="fr price"><em>￥</em><strong>' + item.salePrice + '</strong></span>'
                    + '</li>'
            })
        } else {
            handle = '<div class="room-btn disable">已订完</div>'
        }

        var isRealName = "";
        if (list[len].isRealName == "T") {
            isRealName = "<span class='realNameTip'>实名制</span>";
        }
        var imgurl = list[len].linkMobileImg + '?imageMogr2/thumbnail/640x/strip/quality/100' || '//statics.lotsmall.cn/wappublic/images/demo/room-list.jpg';

        dom += '<li>' +
            '<div class="pro-info">' +
            '<div class="pro-img">' +
            '<img src="' + imgurl + '" alt=""/>' +
            '</div>' +
            '<div class="hotel-info">' +
            '<h4 class="pro-info-title">' + (list[len].nickName || list[len].modelName) + '</h4>' +
            '<div class="pro-info-explian">';
        if (priceDetailList) {
            dom += '<a class="show-cost-detail c-price" href="javascript:;">房费明细></a>' +

                '<div class="cost-dialog dialog" ><h3 class="cost-dialog-title">房费明细</h3>' +
                '<a href="javascript:;" class="close-take xx-icon icon-iconfont-pxchaxian"></a>' +
                '<ul class="cost-dialog-list">' + priceDetailList + '</ul>' +
                '<p class="cost-dialog-explian">单人房费小计：<span class="price"><em>￥</em><strong class="unit-price">' + (parseFloat(_price).toFixed(2)) + '</strong>' +
                '<em class="c-price payPrice"></em></span></p></div>'
                ;
        }

        // <span>' + bedType(list[len].bedType) + '</span><span>' + (list[len].buildingArea ? (list[len].buildingArea + 'm²') :'' ) +'</span><span><i class="font-icon"></i><i class="font-icon"></i></span>
        dom += '</div>' +
            (
                openSingle==='T' ? (
                    list[len].earning != undefined ? ('<p class="pro-info-explian"><span class="c-f63 markshow_open" data-price1="'+list[len].earning+'" data-price2="'+list[len].recommend+'" >推广奖励：￥'+list[len].earning+'></span></p>') : ''
                ):''
            )+
            '<p class="pro-info-explian">' + isRealName + '<a class="showDetail" href="javascript:;" class="c-base">房型介绍></a></p>' +
            '</div>' +
            '</div>' +
            '<div class="pro-price pro-numbers-btn">' +
            '<div class="pro-price-warp"><span class="price"><em>￥</em><strong style="margin-right:0">' + ( priceDetailList ? parseFloat(pricesArr[0]).toFixed(2) : "--" ) + '</strong></span></div>' +
            handle +
            '</div>' +
            '<div class="ticket-layer detail-layer">' +
            '<a href="javascript:;" class="close-ticket xx-icon icon-iconfont-pxchaxian"></a>' +
            '<h3 class="notice-tit">' + (list[len].nickName || list[len].modelName) + '</h3>' +
            '<div class="article-info bgf">' +
            '<div class="article-main">' +
            '<ul class="order-list myorder-list">' +
            '<li><label for="" class="lab-title">床型</label><div class="order-item">' + bedType(list[len].bedType) + '</div></li>' +
            '<li> <label for="" class="lab-title">建筑面积</label> <div class="order-item"> <span>' + (list[len].buildingArea || "-- ") + '㎡</span> </div> </li>' +
            '<li> <label for="" class="lab-title">房型描述</label><div class="order-item">' + list[len].modelDetail + '</div> </li>' +
            '</ul>' +
            '</div></div>' +
            // '<div class="room-handle">' +
            // '<p>价格<span class="price"><em>￥</em><strong>' + (+list[len].price).toFixed(2) + '</strong></span> </p>' +
            // '</div>' +
            '</div>' +
            '</li>';
        if (ratelength > 0) {
            $.each(ratecode, function (i) {
                dom += '<li class="price-code" style="display: none">' +
                    '<h4>' + ratecode[i].aliasName + '</h4>' +
                    '<div class="pro-price c-base">' +
                    '<span class="price"><em>￥</em><strong>' + ratecode[i].currentPrice + '</strong></span>' +
                    '<span class="original-price"><em>￥' + ratecode[i].priceShow + '</em></span>' +
                    '</div>' +
                    '<div class="pro-price">' +
                    '<a href="/order/hotel/' + ratecode[i].rateCode + '?beginDate=' + begin + '&endDate=' + end + '">预订</a>' +
                    '</div>';
            });
        }
    }
    return dom;
}

function ticketListDom(datas, date) {
    var dom = '';

    // var list = datas.rows,
    //     len = list.length;
    var list = datas;
    var lens = list.length;
    var layIndex = -1;

    for (var len = 0, lens = list.length; len < lens; len++) {
        dom += '<h1 class="ticketGroup-name"><i class="xx-icon icon-icon-ticket"></i><span>' + list[len].labelValue + '</span></h1>';
        var ticketList = list[len].ticketList;
        for (var i = 0; i < ticketList.length; i++) {
            layIndex++;
            // var _url = ticketList[i].enabled ? 'href="/order/hotel/' + ticketList[i].id + '?date=' + date + '"' : 'class="gray_btn"';
            var ratecode = ticketList[i].ratecodes || '',
                ratelength = ratecode.length || '';
            var isRealName = '', bookDetail = '';

            var _salePrice = (typeof ticketList[i].priceSettle === 'number')
                ? '<em>￥</em><strong style="margin-right:0">' + (+ticketList[i].priceSettle).toFixed(2) + '</strong>'
                : '<em>￥</em><em style="margin-right:0;font-size:0.75rem">---</em>';
            var _linePrice = (typeof ticketList[i].merchantLinePrice === 'number')
                ? (+ticketList[i].merchantLinePrice).toFixed(2)
                : '';

            var isCanBuy = typeof ticketList[i].priceSettle === 'number' && (!ticketList[i].saleStatus || ticketList[i].saleStatus !== 'F')

            var bookPrice = '<div class="pro-price-warp"><span class="price">' + _salePrice + '</span>' +
                '<span class="original-price"><em>' + _linePrice + '</em></span></div>'

            var handle = '<div class="pro-input-box" data-val=0 style="display:none"><input type="text" class="numbernum" value=0 data-min=0 data-max=999 ' + (isCanBuy ? '' : 'disabled')
                + ' data-ticketid=' + ticketList[i].id + ' data-code=' + ticketList[i].modelCode + ' data-isfsyy=' + ticketList[i].isFsyy + ' data-external=' + ticketList[i].externalCode + ' data-stockcode=' + ticketList[i].stockCode + '>'
                + '</div><div class="pro-btn-box"><span class="pro-buy-btn ' + (!isCanBuy ? "disabled-btn" : "") + '">购买</span></div>';

            if (ratelength > 0) {
                handle = '<a href="javascript:;" class="price-code-btn down"><i class="xx-icon icon-iconfont-jiantou"></i></a>';
            }

            if (ticketList[i].isRealName == "T") {
                isRealName = "<span class='realNameTip'>实名制</span>";
            }

            if (ticketList[i].isShowTicketNotice && ticketList[i].isShowTicketNotice === 'T') {
                bookDetail = '<div class="ticket-layer notice-layer" data-index=' + layIndex + '>'
                    + '<h3 class="notice-tit" > 购票提醒</h3 >'
                    + '<div class="article-info bgf">'
                    + '    <div class="article-main">' + ticketList[i].ticketNotice + '</div>'
                    + '</div>'
                    + '<div class="room-handle clearfix"><a href="javascript:;" class="fl gray_btn disagree">不同意</a><a href="javascript:;" class="fr agree">同意</a></div>'
                    + '</div >';
            }

            dom += '<div class="stock-item"><div class="stock-info">' +
                '<div class="pro-info">' +
                '<h4 class="pro-info-title">' + (ticketList[i].nickName || ticketList[i].modelName) + '</h4>' +
                bookPrice +
                '<p class="pro-info-explian">' + isRealName + '<a class="showDetail" href="javascript:;" class="c-base">查看详情></a></p>' +
                '</div>' +
                '<div class="pro-price pro-numbers-btn">' +
                handle +
                '</div>' +
                '<div class="ticket-layer detail-layer">' +
                '<a href="javascript:;" class="close-ticket xx-icon icon-iconfont-pxchaxian"></a>' +
                '<h3 class="notice-tit1">' + (ticketList[i].nickName || ticketList[i].modelName) + '</h3>' +
                '<div class="article-info bgf">' +
                '<div class="article-main">' + (ticketList[i].bookRemind || '暂无说明') +
                '</div></div>' +
                '</div>' + bookDetail +
                '</div><div class="time-box clearfix"></div></div>';
            if (ratelength > 0) {
                $.each(ratecode, function (j) {
                    dom += '<li class="price-code" style="display: none">' +
                        '<h4>' + ratecode[j].aliasName + '</h4>' +
                        '<div class="pro-price c-base">' +
                        '<span class="price"><em>￥</em><strong>' + ratecode[j].currentPrice + '</strong></span>' +
                        '<span class="original-price"><em>￥' + ratecode[j].priceShow + '</em></span>' +
                        '</div>' +
                        '<div class="pro-price">' +
                        '<a href="/order/hotel/' + ratecode[j].rateCode + '?beginDate=' + begin + '&endDate=' + end + '">预订</a>' +
                        '</div>';
                });
            }


        }

    }
    return dom;
}


function bedType(num) {
    var str = "";
    switch (num) {
        case '0':
            str = "单人床";
            break;
        case '1':
            str = "大床";
            break;
        case '2':
            str = "双床";
            break;
        case '3':
            str = "子母床";
            break;
        case '4':
            str = "圆床";
            break;
        case '5':
            str = "三床";
            break;
        default:
            str = "--";
            break;
    }
    return str;
}

/**
 * 查看详情
 */
function showDetail() {
    // var _showDetail = $('.showDetail'),
    _mask = $('#mask');
    _mask.unbind('click').click(function () {
        $('.productLayer').remove();
        $(this).hide();
    });

    $('.close-ticket').click(function () {
        $('.productLayer').remove();
        _mask.hide();
    })
}

/**
 * 添加费用明细列表
 * @param {json} date
 * @param {number} num
 */
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
    $('.cost-dialog .costList').html(_d);
}

/**
 * 时间戳转换成日期
 * @param {Date} time
 */
function dateToString(time) {
    var thisMonth = '00' + (time.getMonth() + 1);
    var thisDay = '00' + (time.getDate());
    return time.getFullYear() + '-' + thisMonth.substr(thisMonth.length - 2) + '-' + thisDay.substr(thisDay.length - 2)
}