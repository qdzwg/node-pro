$(function () {
    // 翻页
    var dropBox = $(".drop-box"),
        module = dropBox.data('module'),
        localUrl = location.pathname + window.location.search,
        pageSize = 6;// 每页数据条数
    filterObj = { currPage: 1, pageSize: pageSize, merchantInfoId: merchantInfoId };

    typeof modelName !== 'undefined'
        ? filterObj.modelName = modelName
        : '';
    if (typeof isSpecial !== 'undefined' && isSpecial === 'T') filterObj.isSpecial = isSpecial;

    if (module === 'order') {
        filterObj.orderStatus = $(".member-search").attr("data") == "" ? "" : $(".member-search").attr("data");
    }
    if (module === 'hotel') {
        var nowDate = new Date(),
            nowMoth = '00' + (nowDate.getMonth() + 1),
            nowDay = '00' + nowDate.getDate(),
            nextDate = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000),
            nextMoth = '00' + (nextDate.getMonth() + 1),
            nextDay = '00' + nextDate.getDate(),
            nowText = nowDate.getFullYear() + '-' + nowMoth.substr(nowMoth.length - 2) + '-' + nowDay.substr(nowDay.length - 2),
            nextText = nextDate.getFullYear() + '-' + nextMoth.substr(nextMoth.length - 2) + '-' + nextDay.substr(nextDay.length - 2);
        filterObj.beginDate = nowText;
        filterObj.endDate = nextText;
        filterObj.numDays = 1;
        $('#beginDate .date').html(nowText.substring(5, 10));
        $('#endDate .date').html(nextText.substring(5, 10));
    }    
        touch.on("#hotelSearchBtn", "tap", function () {
            var value = $('#listSearchInput').val();
            //  重置筛选条件
            initParam();
            filterObj.modelName = value;
            unLockDropload();
            filterFn(dropload, 1);
        });

        var $tabSearchPanels = $(".tab-search-panel");

        $tabSearchPanels.each(function () {
            var height = $(this).outerHeight(true);
            $(this).css("top", -height + "px");
        });

        touch.on('#hotelFilter', 'tap', function () {
            // $tabSearchPanels.css("top", "0");
            $tabSearchPanels.animate({ top: 0 }, 300);
            $("#mask").fadeIn();
        });

        // var touchobj = $("#searchtab").find("a"),
        //     div, tabpanel = $(".tab-search-panel dd");
        // touch.on(touchobj, 'tap', function () {
        //     if ($(this).hasClass("c-base")) {
        //         div = dialogclose(div);
        //     } else {
        //         dialogclose(div);
        //         div = $(this).parent().index();
        //         $(this).addClass("c-base");
        //         var li = $(".tab-search-panel").eq(div).find('dd');
        //         var div_inner_h = li.outerHeight(true) * li.length;
        //         var search_tab_h = $("#searchtab").outerHeight(true) || 0;
        //         var search_bar_h = $(".search-bar").outerHeight(true) || 0;
        //         var foot_h = $(".footer-box").outerHeight(true) || 0;
        //         var hotel_filter_h = $(".hotel-filter").outerHeight(true) || 0;
        //         var defualt_h = $(window).height() - search_tab_h - search_bar_h - foot_h;
        //         var div_h = div_inner_h > defualt_h ? defualt_h : "auto";
        //         if (dodiv()) {
        //             setTimeout(function () {
        //                 $(".tab-search-panel").eq(div).stop().animate({
        //                     top: search_tab_h + search_bar_h + hotel_filter_h,
        //                     height: div_h
        //                 }, 300);
        //             }, 300);
        //         } else {
        //             $(".tab-search-panel").eq(div).stop().animate({
        //                 top: search_tab_h + search_bar_h + hotel_filter_h,
        //                 height: div_h
        //             }, 300);
        //         }
        //         $("#mask").fadeIn();
        //     }
        // });

        touch.on("#mask", "tap", function () {
            dialogclose();
        });

        // 排序
        touch.on($tabSearchPanels.find('dd'), 'tap', function (ev) {
            // var height = $(".tab-search-panel").eq(div).outerHeight(true);
            var $this = $(this);

            $this.hasClass('c-base')
                ? $this.removeClass('c-base')
                : $this.addClass('c-base');

            // 全部
            if ($this.hasClass('all')) {
                $this.siblings('dd').removeClass('c-base');
            }
            else {
                $this.siblings('.all').removeClass('c-base');
            }

        });

        // 全部区域确定操作
        touch.on(".filter-handle a", "tap", function () {
            // var text = '';
            var $dls = $tabSearchPanels.find('dl');
            $dls.each(function () {
                var $this = $(this);
                var labels = [];
                var _ft = $this.find('dt').data('filter');
                $this.find('dd').each(function () {
                    if ($(this).hasClass('c-base')) {
                        var filter = $(this).data('labelid');
                        if (typeof filter !== 'undefined') labels.push(filter);
                    }
                })
                filterObj[_ft] = labels.join(',')
            })
            initParam();
            unLockDropload();
            filterFn(dropload, 1);
            // $(".tab-search-panel").find('dd.c-base').filter(function (index, item) {
            //     if ($(item).data('filter') !== '') {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // }).map(function (index, item) {
            //     text += index > 0 ? ',' + $(item).text() : $(item).text();
            // });
            // $("#searchtab").find("li").eq(div).find("a").text(text === '' ? '全部筛选' : text);
            dialogclose();

        });   

    var dropload = dropBox.dropload({
        scrollArea: window,
        loadDownFn: filterFn
    });



    // 关键字搜索
    touch.on("#searchBar button", "tap", function () {
        var value = $('#searchBar input').val();

        //  重置筛选条件
        initParam();

        filterObj.modelName = value;
        unLockDropload();
        filterFn(dropload, 1);
    });

    $('#listSearchInput').on('keydown', function (e) {
        if (e && e.keyCode == 13) { // enter 键
            var value = $('#listSearchInput').val();
            //  重置筛选条件
            initParam();

            filterObj.modelName = value;
            unLockDropload();
            filterFn(dropload, 1);
        }

    })

    

    var $payModule = $('#payModule');
    if ($payModule.size() > 0) {
        $payModule.find('li').on('tap',function(){
            var $this = $(this)
            $payModule.find('.select-icon').removeClass('icon-yuanxingxuanzhongfill').addClass('icon-yuanxingweixuanzhong')
            $this.hasClass('longCard') ? $('#goPayBtn').data('chanel','long') : $('#goPayBtn').data('chanel','normal')
            $this.find('.select-icon').removeClass('icon-yuanxingweixuanzhong').addClass('icon-yuanxingxuanzhongfill')
        })
        $('#goPayBtn').on('tap',function(){
            var query = $(this).data('query')
            var payChanel = $(this).data('chanel')
            query += '&chanel='+ payChanel 
            $.get('/payType/get'+ query).success(function(res){
                $("#mask,#cost-dialog").hide();
                $('#pay-mask').hide();
                $payModule.removeClass('show'); 
                if (res.status === 200) {
                    if (res.data.payType === '2019') {
                        ap.tradePay({
                            tradeNO: res.data.tradeNo
                          }, function(res){
                              if (res.resultCode == 9000 || res.resultCode === 8000) {
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
                    $('.tips p').text(res.message || '支付失败，请重试');
                    $('.mask,.tips').show();
                }  
            })

        })
    }
    
    $('.queding').unbind('click').click(function () {
        $('.mask,.tips').hide();
    });

    $('.myorder-item-pay').live('click', function (e) {
        var $this = $(this), $parLi = $this.parents('.myorder-item');
        var orderInfo = $parLi.find('.orderItem-info h3').text()
            , payOrderNo = $this.data('no')
            , allPrice = $this.data('price')
            , code = $this.data('code')
            ;
        if($parLi.find('input[name="comboName"]') && $parLi.find('input[name="comboName"]').length){
            var orderInfo = encodeURIComponent($parLi.find('input[name="comboName"]').val());            
        }
        $payModule.find('.price').text(allPrice.toFixed(2))
        $payModule.find('#goPayBtn').data('query', '?orderNo=' + payOrderNo + '&name=' + orderInfo + '&code=' + code
            + '&paySum=' + allPrice.toFixed(2) + '&m_id=' + merchantInfoId)
        $payModule.addClass('show');
        $('#pay-mask').show();
    })

    touch.on('#pay-mask', 'tap', function () {
        $payModule.removeClass('show');
        $(this).hide();
    })

    /**
     * 酒店选择时间区间刷新列表
     */
    if (module === 'hotel') {
        var options = {
            multipleMonth: 4,
            multipleSelect: true,
            click: function (date) {
                var beginDate = date[0],
                    numDays = date.length - 1,
                    endDate = date[numDays];
                $('#beginDate .date').html(beginDate.substring(5, 10));
                $('#endDate .date').html(endDate.substring(5, 10));
                // $('#hotelCalendar em').html(numDays);
                hotelInit(beginDate, numDays, endDate);
                setTimeout(function () {
                    // $("#calendar").hide();
                    $("#calendar-box").removeClass("calendar-show");
                }, 500);
            }
        };

        $('#hotelCalendar').on('tap', function () {
            $("#calendar").calendar(options);
            $("#calendar-box").addClass("calendar-show");
        });
        //filterFn(dropload, 1);
    }

    function hotelInit(beginDate, numDays, endDate) {
        initParam();
        filterObj.beginDate = beginDate;
        filterObj.endDate = endDate;
        filterObj.numDays = numDays;

        unLockDropload();
        filterFn(dropload, 1);
    }


    function initParam() {
        localUrl = location.pathname;
        filterObj.currPage = 1;
    }

    // 筛选构造DOM
    function filterFn(dropload, startPage) {
        console.log(filterObj);
        $.ajax({
            type: 'POST',
            url: localUrl,
            data: filterObj,
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    var results = module === 'commentList' ? res.data.list : res.data;
                    if (filterObj.currPage > results.pages) {
                        if (!results.pages) dropBox.find('ul').html('');
                        dropload.lock();
                        dropload.noData();
                        dropload.resetload();
                        return false;
                    }

                    if (startPage || filterObj.currPage === 1) {
                        dropBox.find('ul').html(listDom(results.rows, module));
                        // 更新分享图片链接
                        if (typeof isWx !== 'undefined' && isWx === 'T' && (module === 'ticket' || module === 'hotel' || module === 'repast' || module === 'shop' || module === 'route' || module === 'theater')) {
                            var imgurl = dropBox.find('ul').find('img').eq(0).attr('src')
                            initWxShare({imgUrl:imgurl})
                        }
                        
                    } else {
                        dropBox.find('ul').append(listDom(results.rows, module));
                    }
                    //filterObj.currPage = +(results.curPage) + 1;
                    filterObj.currPage++;

                    if (filterObj.currPage > results.pages) {
                        dropload.lock();
                        dropload.noData();
                    }
                } else if (res.status === 400) {
                    dropload.lock();
                    dropload.noData();
                    window.location.href = '/login?m_id=' + merchantInfoId;
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

    // unLockDropload();
    // filterFn(dropload, 1);
    /**
     * 解锁dropload
     */
    function unLockDropload() {
        //dropload.resetload();
        dropload.unlock();
        //dropload.noData(false);
        dropload.isData = true;

    }

    var userAgent = navigator.userAgent;
    if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1) {
        $("html,body").animate({ "scrollTop": "100px" }, 1000);
        $("html,body").animate({ "scrollTop": 0 }, 1000);
    }

});

// 列表DOM
function listDom(list, module) {
    var dom = '',
        len = list.length,
        imgClass = module === 'strategy' ? 'raiders-img' : (module === 'shop' ? 'goods-list-img' : 'page-list-img'),
        orderstatus = $(".page-list").data("orderstatus");
    // console.log(list);
    for (var len in list) {

        if (module === 'order' && orderstatus !== 0) {
            var orderName = list[len].orderInfo;
            if (list[len].orderType === 'route') {
                var lineType = ['【成人票】', '【儿童票】'];
                var thisOrderDetail = list[len].orderDetail;
                var thisOrderDetailNameArray = []; // 储存线路名称
                if (thisOrderDetail.length > 0) {
                    for (var i = 0; i < thisOrderDetail.length; i++) {
                        thisOrderDetailNameArray.push(lineType[+(thisOrderDetail[i].detailType)])
                    }
                }
                orderName = orderName + thisOrderDetailNameArray.join('+')
            } else if (list[len].orderType === 'pms_hotel') {
                orderName = list[len].nickName
            }

            var showIcon = merchantInfoId === '229'
                ? '<span class="order-info">'
                : getIcon(list[len].orderType) + '</em>|';
            if(list[len].orderType == 'cloud_repast'){
                dom += '<div class="myorder-item">' +
                '<div class="myorder-header">' +
                showIcon +
                '<em class="unpay">' +
                orderStatus(list[len].orderStatus) + '</em></span>' +
                '<span >下单日期：' + list[len].createTime.substring(0, 10) + '</span>' +
                '<span class="price fr"><em>￥</em>' + list[len].paySum + '</span>' +
                '</div>' +
                '<a href="/member/order/' + list[len].id + '?m_id=' + merchantInfoId + '&orderType=' + list[len].orderType + '">' +
                '<h3 class="myorder-item-title">' + orderName + '</h3>';
            }else{
                var orderDetailUrl = '/member/order/' + list[len].id + '?m_id=' + merchantInfoId         
                if (list[len].orderType === 'pms_hotel') {
                    orderDetailUrl = '/member/pmsOrder/' + list[len].payOrderNo + '?m_id=' + merchantInfoId  
                }
                
                dom += '<div class="myorder-item">' +
                '<div class="myorder-header">' +
                showIcon +
                '<em class="unpay">' +
                orderStatus(list[len].orderStatus) + '</em></span>' +
                '<span >下单日期：' + list[len].createTime.substring(0, 10) + '</span>' +
                '<span class="price fr"><em>￥</em>' + list[len].paySum + '</span>' +
                '</div>' +
                '<a href="'+ orderDetailUrl + '">' +
                '<h3 class="myorder-item-title">' + orderName + '</h3>';
            }
            
            var checkStatusStr = '';
            switch (+list[len].checkStatus) {
                case 0:
                    checkStatusStr = '<span class="order-check-status">待核销</span>'
                    break;
                case 1:
                    checkStatusStr = '<span class="order-check-status">核销中</span>'
                    break;
                case 2:
                    checkStatusStr = '<span class="order-check-status">已核销</span>'
                    break;
                case 3:
                    checkStatusStr = '<span class="order-check-status">已全退</span>'
                    break;
                default:
                    break;
            }

            if (list[len].orderType === 'theater_ticket') {
                var str=list[len].retreatText?'<span class="pro-flag y-clr" style="vertical-align:top; margin-left:0.5rem; margin-top:0.2rem;">'+list[len].retreatText+'</span>':'';
                dom += "<p>" + (list[len].startTime ? list[len].startTime.substring(0, 10) + "使用" : "") + "</p>" + '<p><i class="xx-icon fr icon-iconfont-jiantou"></i>' + list[len].amount + "张"+str+checkStatusStr+"</p>";
            }
            else if (list[len].orderType === 'mdse') {
                dom += "<p>" + list[len].deliverType + "</p>" + '<p><i class="xx-icon fr icon-iconfont-jiantou"></i>' + list[len].amount + "件"+checkStatusStr+"</p>";
            }
            else {
                dom += "<p>" + (list[len].startTime ? list[len].startTime.substring(0, 10) + "使用" : "") + "</p>" + '<p><i class="xx-icon fr icon-iconfont-jiantou"></i>' + list[len].amount + "张"+checkStatusStr+"</p>";
            }
            dom += '</a></div><div class="page-line"></div>';
        }
        else if (module === 'order' && orderstatus === 0) {
            var hasExpress = '';
            var allPrice = list[len].paySum;
            var orderDetail = list[len].orderDetailVoList;
            var modelCode = '';
            if (orderDetail instanceof Array) {
                orderDetail.forEach(function(info){
                    modelCode += info.modelCode
                }) 
            }
            if (list[len].deliveryType === '快递' && list[len].postage) {
                // allPrice = allPrice + list[len].postage;
                hasExpress = '<em class="c-666" style="font-size:.45rem">（含邮费：<em class="c-price">￥' + list[len].postage + '</em>）</em>'
            }
            if(list[len].orderType === 'family'){
                var showImgUrl = '//statics.lotsmall.cn/wappublic/images/member/lessimg.jpg';
                var playTime = '';
                if (list[len].linkMobileImg) showImgUrl = list[len].linkMobileImg;
                playTime = merchantInfoId === '229'
                ? '<p>预约时间：' + list[len].startDate.substring(0, 10) + '</p>'
                : '<p>游玩时间：' + list[len].startDate.substring(0, 10) + '</p>';
                dom += '<div class="myorder-item">' +
                '<div class="myorder-header pay-header">' +
                '<em class="unpay">' + payStatus(list[len].payStatus) + '</em></span>' +
                '<span >下单日期：' + list[len].orderTime.substring(0, 10) + '</span>' +
                '</div>' +
                '<a href="/member/order/' + list[len].payOrderNo + '?orderStatus=0&m_id=' + merchantInfoId + '" class="orderItem-panel clearfix">' +
                '<div class="orderItem-img"><img src="' + showImgUrl + '?imageMogr2/thumbnail/640x/strip/quality/100"/></div>' +
                '<div class="orderItem-info">' +
                '<h3>' + list[len].nickName + '</h3>' + playTime +
                '</div>' +
                '<div class="orderItem-right">' +
                '<span>￥' + list[len].price + '</span>' +
                '<span>X' + list[len].amount + '</span>' +
                '</div>' +
                '</a>' +
                '<div class="myorder-bottom">' +
                '<span>支付金额：<em class="c-price">￥' + allPrice + '</em>' + hasExpress + '</span>' +                
                '<a class="myorder-item-pay" data-price=' + allPrice + ' data-no=' + list[len].payOrderNo + ' data-code='+ modelCode +' href="javascript:;" >立即支付</a>' +
                '</div>';
            }else{
                dom += '<div class="myorder-item">' +
                '<div class="myorder-header pay-header">' +
                '<em class="unpay">' + payStatus(list[len].payStatus) + '</em></span>' +
                '<span >下单日期：' + list[len].orderTime.substring(0, 10) + '</span>' +
                '</div>' + orderItem(list[len].orderDetailVoList, list[len].payOrderNo) +
                '<div class="myorder-bottom">' +
                '<span>支付金额：<em class="c-price">￥' + allPrice + '</em>' + hasExpress + '</span>' +
                // '<a data-no=' + list[len].payOrderNo+' href="/pay/' + list[len].orderDetailVoList[0].goodsType + '/' + list[len].payOrderNo + '">立即支付</a>' +
                '<a class="myorder-item-pay" data-price=' + allPrice + ' data-no=' + list[len].payOrderNo + ' data-code='+ modelCode +' href="javascript:;" >立即支付</a>' +
                '</div>';
            }

            // pms_hotel
            
            if(list[len].orderType === 'family'){
                dom += '<input type="hidden" name="comboName" value='+list[len].nickName+' data-type='+list[len].orderType+'>'
            }
            dom += '</div>';
            dom += '<div class="page-line"></div>';
            //套票名称展示
                  
        }
        else if (module === 'group') {
            var lptStatusStr = '';
            var personStr = '';
            switch (list[len].ptStatus) {
                case 'init':
                    lptStatusStr = '<span class="fr groupStatusTxt init">等待成团</span>';
                    personStr = '<span class="groupTips">还差<span class="highlight">'
                        + (list[len].personQuantity - list[len].personCount) + '</span>人成团</span>';
                    break;
                case 'confirm':
                    lptStatusStr = '<span class="fr groupStatusTxt init">等待成团</span>';
                    personStr = '<span class="groupTips">还差<span class="highlight">'
                        + (list[len].personQuantity - list[len].personCount) + '</span>人成团</span>';
                    break;
                case 'success':
                    lptStatusStr = '<span class="fr groupStatusTxt success">拼团成功</span>';
                    break;
                case 'failure':
                    lptStatusStr = '<span class="fr groupStatusTxt fail">拼团失败</span>';
                    break;
                default:
                    lptStatusStr = '<span class="fr groupStatusTxt init">等待成团</span>';
                    personStr = '<span class="groupTips">还差<span class="highlight">'
                        + (list[len].personQuantity - list[len].personCount) + '</span>人成团</span>';
                    break;
            }
            dom += '<div class="group-order-item">'
                + '<div class="groupInfo">'
                + '<img src="' + list[len].productAddress + '?imageMogr2/thumbnail/640x/strip/quality/100" class="itemImg">'
                + '<div class="itemInfo">'
                + '<h3 class="itemName ellipsis">' + (list[len].aliasName || list[len].name) + '</h3>'
                + '<div class="itemLine price">￥' + list[len].minSkuPrice + '</div>'
                + '<div class="itemLine groupStatusBar">'
                + '<span>' + list[len].personQuantity + '人团</span>'
                + lptStatusStr
                + '</div></div></div>'
                + '<div class="item-line"></div>'
                + '<div class="groupActionBar">'
                + personStr
                + '<div class="groupActionBtnBox">'
            if (isWx === 'T' && (list[len].ptStatus === 'init' || list[len].ptStatus === 'pay_confirm')) {
                dom += '<button type="button" data-url="/group/detail/' + list[len].merchantMdseInfoId
                    + '/' + list[len].goodsCode + '?invited=1&m_id=' + list[len].merchantInfoId
                    + '&lptId=' + list[len].id + '"  class="mainBtn">邀请好友</button>'
            }
            dom += '<a href="/member/order/' + list[len].orderInfoId + '?m_id=' + merchantInfoId + '" class="linkBtn">查看订单</a>'
                + '<a href="/group/orderDetail/' + list[len].id + '?m_id=' + merchantInfoId + '" class="linkBtn">拼团详情</a>'
                + '</div></div></div>'
        }
        else if (module === 'traffic') {
            var isAble = list[len].isAble !== '0' ? 'href="/order/traffic/' + list[len].id + '?begin=' + $('.startDay a').text() + '"' : 'class="order_gray"';
            dom += '<li>' +
                '<div class="trafficRight">' +
                '<p>￥' + list[len].salesPrice + '</p>' +
                '<a ' + isAble + '>预定</a>' +
                '</div>' +
                '<div class="trafficLeft">' +
                '<span>' + list[len].time + '</span>' +
                '<p><i></i>' + list[len].shiftType + '</p>' +
                '</div>' +
                '<div class="trafficCenter">' +
                '<p><i></i>' + list[len].startPlace + '</p>' +
                '<p><i></i>' + list[len].endPlace + '</p>' +
                '</div>' +
                '</li>';
        } else if (module === 'commentList') {

            var star = '', isShowName = '';
            for (var i = 0; i < list[len].score; i++) {
                star += '<i class="xx-icon icon-iconfont-aixin"></i>'
            }
            for (var j = 0; j < (5 - list[len].score); j++) {
                star += '<i class="xx-icon icon-iconfont-aixin not-light"></i>'
            }

            isShowName = '匿名评论';
            if (list[len].isAnonymous == 'T') {
                var _name = list[len].leaguerName, _length = _name.length;
                if (_length > 2) {
                    _name = _name[0] + '***' + _name[_length - 1]
                } else {
                    _name = _name[0] + '***'
                }
                isShowName = _name;
            }

            dom += '<li><div class="comment-list-top">'
                + '<b>' + isShowName + '</b>'
                + '<span class="fr">' + star
                + '<em>' + list[len].score + '分</em></span></div>'
                + '<p class="comment-list-info">' + list[len].content + '</p>'
                + '<div class="comment-date">' + list[len].createTime + '</div>'
                + '</li>';
        } else if (module === 'yearcard') {
            // dom += '<li><a href="/detail/yearcard/'+list[len].id+'?m_id='+merchantInfoId+'">'
            // + '<img src="'+ list[len].cardCover +'?imageMogr2/thumbnail/640x/strip/quality/100" alt="" class="yearcard-img">'
            // + '<span class="avatar"><img src="'+ list[len].cardLogo +'?imageMogr2/thumbnail/640x/strip/quality/100" alt=""></span>'
            // + '<span class="yearcard-name">'+ list[len].cardName +'</span></a></li>';
            dom += '<li><a href="/detail/yearcard/' + list[len].id + '?m_id=' + merchantInfoId + '">'
                + '<img src="' + list[len].cardCover + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="" class="yearcard-img">'
                + '<p class="list-card-con"><span class="avatar "><img src="' + list[len].cardLogo + '?imageMogr2/thumbnail/640x/strip/quality/100" alt=""></span>'
                + '<span class="yearcard-name ">' + list[len].cardName + '</span></p><div class="card-mask"></div></a></li>';
        } else {
            var tag = '', _price = '', _isGroup = '';
            if (list[len].labels) {
                var k = module === 'guide' ? 'language' : 'labelsName',
                    lens = 0;

                if (list[len][k]) {
                    var _labels = list[len][k].indexOf(',') !== -1 ? list[len][k].split(',') : new Array(list[len][k]);
                    lens = _labels.length > 3 ? 3 : _labels.length;
                    while (lens--) {
                        tag += '<span class="pro-flag c-base border-base">' + _labels[lens] + '</span>';
                    }
                }
                // list[len][k].split(",").reverse();
            }

            if (module === 'shop' && list[len].isGroup === 'T') {
                _isGroup += '<span class="pro-flag c-base border-base">拼团</span>';
            }

            //url
            var url = '';
            switch (module) {
                case 'combo':
                    url = '/detail/combo/' + list[len].goodsCode + '?rateCode=' + list[len].rateCode;
                    break;
                case 'strategy':
                    url = '/detail/strategy/' + list[len].id + '?m_id=' + merchantInfoId;
                    break;
                default:
                    // if (list[len].isGroup && list[len].isGroup == "T") {
                    //     url = '/group/detail/' + list[len].id + '/' + list[len].productCode + '?m_id=' + merchantInfoId;
                    // } else {
                    //     url = '/detail/' + module + '/' + list[len].id + '/' + list[len].productCode + '?m_id=' + merchantInfoId;
                    // }
                    if (list[len].isGroup && list[len].isGroup == "T") {
                        url = '/group/detail/' + list[len].id + '/' + list[len].productCode + '?m_id=' + merchantInfoId;
                    } else {
                        url = '/detail/' + module + '/' + list[len].id + '/' + (list[len].productCode || 'page') + '?m_id=' + merchantInfoId;
                    }
                    break;
            }

            if (isSpecial === 'T') url += '&isSpecial=T';
            if (module === "repast") {
                dom += '<li>' +
                    '<a class="clearfix" href="' + url + '">' +
                    '<div class="' + imgClass + '">' +
                    '<img src="' + eN(list[len].linkMobileImg || '//statics.lotsmall.cn/wappublic/images/demo/foods-list1.jpg') + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="图片"/>' +
                    '</div>';
            } else {
                dom += '<li>' +
                    '<a class="clearfix" href="' + url + '">' +
                    '<div class="' + imgClass + '">' +
                    '<img src="' + eN(module === 'strategy' ? list[len].picAddr : (list[len].linkMobileImg || '//statics.lotsmall.cn/wappublic/images/demo/foods-list1.jpg')) + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="图片"/>' +
                    '</div>';
            }
            switch (module) {
                case 'ticket':
                    list[len].priceShow ? _price = '<span class="showPrice fr c-price">￥<span>' + list[len].priceShow + '</span>起</span>' : _price = '';
                    var level = ['1', '2', '3', '4', '5'];
                    var levelString = '';
                    if (list[len].parkLevel && level.indexOf(list[len].parkLevel) !== -1) {
                        levelString = ' ' + list[len].parkLevel + 'A';
                    }
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title">' +
                        '<div class="list-title-box">' + eN(list[len].nickName) + '</div>' +
                        tag +
                        '</h3>' +
                        '<p class="page-list-article one">' + eN(list[len].merchantName) + '</p>' +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + handleSalesNum(list[len].salesNum || 0) + '</span>人已购买' +
                        _price +
                        '</p>' +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + (list[len].areaAddr || '') + levelString + '</span>' +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'hotel':
                    list[len].priceShow ? _price = '<span class="price fr"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong>起</span>' : _price = '';
                    var stars = '';
                    if (+list[len].hotelLevel > 0) {
                        for (var s = 0; s < +list[len].hotelLevel; s++) {
                            stars += '<i class="xx-icon icon-star-full"></i>'
                        }
                    }
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].nickName) + '</div><div class="list-stars-box">' + stars + '</div></h3>' +
                        // '<p class="page-list-article one">' + eN(list[len].merchantName) + '</p>' +
                        (
                            openSingle==='T' ? (
                                list[len].earning != undefined ? ('<p class="list-earning"><i>赚</i>' + list[len].earning+'元起</p>') : ''
                            ):''
                        ) +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + handleSalesNum((list[len].fictSaleNum || 0) + (list[len].salesNum || 0)) + '</span>人已购买' +
                        _price +
                        '</p>' +
                        '<p class="page-list-explian">' +
                        '<span class="c-base">' + (list[len].areaName || '') + '</span>' +
                        '</p>' +
                        '</div></a></li>';
                    break;
                case 'strategy':
                    dom += '<div class="raiders-info">' +
                        '<h3>' + eN(list[len].name) + '</h3>' +
                        '<p class="raiders-description">' + html2string(list[len].activityDetail) + '</p>' +
                        '</div></a></li>';
                    break;
                case 'shop':
                    var _price = list[len].priceShow ? '<span class="price"><em>￥</em><strong>' + (list[len].priceShow).toFixed(2) + '</strong></span>' : '';
                    dom += '<h3 class="goods-list-title"><div class="list-title-box"><span class="title">' + eN(list[len].nickName) + '</span>' + _isGroup + '</div></h3>' +
                        //'<p class="goods-list-article">' + eN(list[len].subtitle) + '</p>' +
                        '<p class="list-earning">' +
                        (
                            openSingle==='T' ? (
                                list[len].earning != undefined ? ( '<i>赚</i>' + list[len].earning+'元起'):''
                            ):''
                        ) +
                        '</p>'+
                        '<p class="goods-list-explian">' +
                        _price +
                        '<span class="fr">销量：' + (handleSalesNum(parseInt(list[len].virtualSale) + parseInt(list[len].salesNum)) || 0) + '</span>' +
                        '</p></a></li>';
                    break;
                case 'route':
                    var _labelDom = '';
                    if (list[len].lineTheme) {
                        var labelArr = list[len].lineTheme.split(",");
                        for (var i = 0; i < labelArr.length && i < 3; i++) {
                            _labelDom += '<span class="c-base list-route-label list-repast-label' + (i + 1) + '">' + labelArr[i] + '</span>';
                        }
                    }
                    list[len].priceShow ? _price = '<span class="showPrice c-price fr">￥<span>' + list[len].priceShow + '</span>起/人</span>' : _price = '';
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title">' +
                        '<div class="combo-list-title">' + eN(list[len].nickName) + '【' + list[len].subtitle + '】</div>' +
                        '</h3>' +
                        '<p class="route-list-explian clearfix">' +
                        _labelDom +
                        '</p>' +
                        (
                            openSingle==='T' ? (
                            list[len].earning != undefined ? ('<p class="list-earning"><i>赚</i>' + list[len].earning+'元起</p>') : ''
                            ):''
                        )
                        +
                        '<div class="route-list-explian route-list-description clearfix">' +
                        '<div class="route-list-description-detail">' +
                        '<span class="c-999 route-list-beg">' + (list[len].begAddress && list[len].begAddress.length > 8 ? list[len].begAddress.substring(0, 8) : list[len].begAddress) + '出发</span>' +
                        '<span class="c-999 ">' + list[len].useDay + '天' + list[len].useNight + '夜</span>' +
                        '</div>' +
                        _price +
                        '</div>' +
                        '</div></a></li><div class="page-line"></div>';
                    break;
                case 'theater':
                    list[len].lowPrice ? _price = '<span class="showPrice c-price fr">￥<span>' + list[len].lowPrice + '</span>起/人</span>' : _price = '';
                    var startDate=list[len].startDate?list[len].startDate.substring(0, 10):'',
                        endDate=list[len].endDate?list[len].endDate.substring(0, 10):'';
                    var theaterSalesNum =  list[len].salesNum;
                    if (theaterSalesNum > 9999) theaterSalesNum = '9999+';

                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title">' +
                        '<div class="combo-list-title">' + eN(list[len].name) + '</div>' +
                        '</h3>' +
                        '<p class="route-list-explian clearfix"><span class="c-base list-route-label list-repast-label">' +
                        startDate+'至'+endDate+
                        '</span></p>' +
                        (
                            openSingle==='T' ? (
                                list[len].earning != undefined ? ('<p class="list-earning"><i>赚</i>' + list[len].earning+'元起</p>') : ''
                            ):''
                        )+
                        '<div class="route-list-explian route-list-description clearfix">' +
                        '<div class="route-list-description-detail">' +
                        '<span class="c-999 ">' + theaterSalesNum  + '人已购买</span>' +
                        '</div>' +
                        _price +
                        '</div>' +
                        '</div></a></li><div class="page-line"></div>';
                    break;
                case 'order':
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title"><div class="list-title-box">' + eN(list[len].nickName) + '</div></h3>' +
                        '<p class="page-list-explian">' +
                        '<span class="pro-flag fr">销量：' + handleSalesNum(list[len].totalSales) + '</span>' +
                        '<span class="price"><em>￥</em><strong>' + list[len].salesPrice + '</strong></span>' +
                        '</p>' +
                        '<p class="page-list-article">' + eN(list[len].subTitle) + '</p>' +
                        '</div>';
                    break;
                case 'repast':
                    var _labelDom = '';
                    if (list[len].labels != "") {
                        var labelArr = list[len].labels.split(",");
                        for (var i = 0; i < labelArr.length; i++) {
                            _labelDom += '<span class="c-base list-repast-label list-repast-label' + (i + 1) + '">' + labelArr[i] + '</span>';
                        }
                    } else {
                        _labelDom = '';
                    }
                    dom += '<div class="page-list-info">' +
                        '<h3 class="page-list-title">' +
                        '<div class="list-title-box">' + eN(list[len].name) + '</div>' +
                        tag +
                        '</h3>'
                        + (
                            openSingle==='T' ? (
                                list[len].earning != undefined ? ('<p class="list-earning"><i>赚</i>' + list[len].earning+'元起</p>') : ''
                            ):''
                        )
                        +
                        '<p class="page-list-article one">' + eN(list[len].merchantName) + '</p>' +
                        '<p class="page-list-explian">' +
                        '<span class="c-base list-repast-info">' + eN(list[len].tradingArea) + '</span>' +
                        _price +
                        '</p>' +
                        '<p class="page-list-explian">' + _labelDom +
                        '</p>' +
                        '</div></a></li>';
                    break;
                default:
                    break;
            }
        }
    }
    return dom;
}

function orderItem(list, payOrderNo) {
    var dom = '',
        len = list.length;
    list.reverse();
    while (len--) {
        var playTime = ''; // 游玩时间 
        var orderName = list[len].orderInfo; //订单名称
        var payUrl = ''; // 待支付
        var showImgUrl = '//statics.lotsmall.cn/wappublic/images/member/lessimg.jpg';
        if (list[len].orderType !== 'mdse' && list[len].orderType !== 'eatery' && list[len].orderType !== 'theater_ticket') {
            playTime = merchantInfoId === '229'
                ? '<p>预约时间：' + list[len].startDate.substring(0, 10) + '</p>'
                : '<p>游玩时间：' + list[len].startDate.substring(0, 10) + '</p>';
        }
        if (list[len].orderType === 'route') {
            var lineType = ['【成人票】', '【儿童票】'];
            orderName = list[len].orderInfo + lineType[parseInt(list[len].detailType)]
        }

        if (list[len].linkMobileImg) showImgUrl = list[len].linkMobileImg;

        if (list[len].orderType === 'pms_hotel'){
            payUrl = "/member/pmsOrder/"+ payOrderNo +"?m_id=" + merchantInfoId;
        } else {
            payUrl = "/member/order/" + payOrderNo + "?orderStatus=0&m_id=" + merchantInfoId;
        }
        
        dom += '<a href='+payUrl+' class="orderItem-panel clearfix">' +
            '<div class="orderItem-img"><img src="' + showImgUrl + '?imageMogr2/thumbnail/640x/strip/quality/100"/></div>' +
            '<div class="orderItem-info">' +
            '<h3>' + orderName + '</h3>' + playTime +
            '</div>' +
            '<div class="orderItem-right">' +
            '<span>￥' + list[len].price + '</span>' +
            '<span>X' + list[len].amount + '</span>' +
            '</div>' +
            '</a>';
    }
    ;
    return dom;
}

// 空值处理
function eN(t) {
    return t ? t : '';
}

function dialogclose(div) {
    var height = $(".tab-search-panel").outerHeight(true);
    $(".tab-search-panel").stop().animate({
        top: -height + "px"
    }, 300);
    $("#mask").hide();
    // $("#searchtab").find("a").removeClass("c-base");
    div = null;
    return div;
}

function handleSalesNum(nums) {
    var nums = parseInt(nums), resturnNum = '';
    var _n = 1;
    if (nums > 9999) {
        _n = Math.floor(nums / 10000);
        resturnNum = _n + 'w+';
    }
    // else if (nums > 999) {
    //     _n = Math.floor(nums / 1000);
    //     resturnNum = _n + 'k+';
    // }
    else {
        resturnNum = nums;
    }
    return resturnNum;
}

function dodiv() {
    var flag = false;
    $(".tab-search-panel").each(function () {
        var top = $(this).position().top;
        if (top > 0) {
            flag = true;
            return false;
        }
    });
    return flag;
}

function getDateStr(data, AddDayCount) {
    var dd = new Date(data);
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) > 9 ? (dd.getMonth() + 1) : "0" + (dd.getMonth() + 1); //获取当前月份的日期
    var d = dd.getDate() > 9 ? dd.getDate() : "0" + dd.getDate();
    return y + "-" + m + "-" + d;
}

function getDay(_date) {
    var dateArray = _date.split('-');
    var _day = parseInt(dateArray[2]);
    return _day;
}


function html2string(html) {
    var msg = html.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
    msg = msg.replace(/[|]*\n/, '') //去除行尾空格
    msg = msg.replace(/&nbsp;/ig, ''); //去掉npsp
    return msg;
}