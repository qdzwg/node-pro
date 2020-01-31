$(function () {
    $("#cancel").click(function (e) {
        e.preventDefault();
        var orderNo = $(this).data('id');
        var confirmDel = confirm('确认要取消订单吗');
        if (confirmDel) {
            $.post('/member/cancle/' + orderNo)
                .success(function (data) {
                    console.log(data);
                    $('.mask,.tips').show();
                    $('.tips p').text(data[0].message);

                    //that.text('删除订单');
                    //$('.pay-mold').text('已取消');

                    $('.tips a').on('click', function () {
                        $('.mask,.tips').hide();
                        window.location.reload();
                    });

                })
                .error(function (err) {
                    window.location.href = '/error';
                });
        }
    });
    var checkNo = $(this).data('checkno')
    if (checkNo) {
        $(this).qrcode(checkNo)
    }

    var $payModule = $('#payModule');
    $('#pmsPay').click(function (e) {
        var $this = $(this);
        var orderInfo = $this.data('name')
            , payOrderNo = $this.data('no')
            , allPrice = $this.data('price')
            , code = $this.data('code')
            ;
        $payModule.find('.price').text(allPrice.toFixed(2))
        $payModule.find('#goPayBtn').data('query', '?orderNo=' + payOrderNo + '&name=' + orderInfo + '&code=' + code
            + '&paySum=' + allPrice.toFixed(2) + '&m_id=' + merchantInfoId)
        $payModule.addClass('show');
        $('#pay-mask').show();
    })
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
                        window.location.href = '/pay/pmsHotel'+ query
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


    /*****************************************************************************
     * 待支付倒计时
     *****************************************************************************/
    var test = orderCloseTime.replace(/-/g, "/");
    var date = new Date(orderCloseTime.replace(/-/g, "/"));
    var time = Date.parse(date);
    var now = new Date();
    var nowTime = Date.parse(now);
    var closeTime = time - nowTime;      
    var hour = '', min = '', seconds = '';
    console.log("close", orderCloseTime);
    if (closeTime < 0) {
        //过期了
        clearInterval(timeInterval);
        //订单状态前端换成已经关闭状态                
        $('.closeTimeText').text("已关闭");
    } else {
        closeTime = closeTime / 1000;
        hour = Math.floor(closeTime / 3600);
        min = Math.floor((closeTime - hour * 60) / 60);
        seconds = closeTime - hour * 60 * 60 - min * 60; 
        $('.closeTimeText').text(hour+"小时"+min+"分"+seconds+"秒后订单自动关闭");              
    }       
    var timeInterval = setInterval(function() {            
        now = new Date();
        nowTime = Date.parse(now);
        closeTime = time - nowTime;
        if (closeTime < 0) {
            //过期了
            clearInterval(timeInterval);                        
            $('.closeTimeText').text("已关闭");
        } else {
            closeTime = closeTime / 1000;
            hour = Math.floor(closeTime / 3600);
            min = Math.floor((closeTime - hour * 60) / 60);
            seconds = closeTime - hour * 60 * 60 - min * 60;  
            $('.closeTimeText').text(hour+"小时"+min+"分"+seconds+"秒后订单自动关闭");                              
        }
    }, 1000);
    

    /*****************************************************************************
     * popup 时间轴与费用明细
     *****************************************************************************/

    var $popupMask = $('#popupMask')
    var $timeLinePopupWarp = $('#timeLinePopupWarp')
    var $pricePopupWarp = $('#pricePopupWarp')
    var $roomDetailPopupWarp = $('#roomDetailPopupWarp')
    var $ruleCancel = $('#ruleCancel')


    var timeLinePopupWarpHeight = $timeLinePopupWarp.height()
    var pricePopupWarpHeight = $pricePopupWarp.height()
    var roomDetailPopupWarpHeight = $roomDetailPopupWarp.height()
    var ruleCancelHeight = $ruleCancel.height()

    $timeLinePopupWarp.css('bottom', '-' + timeLinePopupWarpHeight + 'px');
    $pricePopupWarp.css('bottom', '-' + pricePopupWarpHeight + 'px');
    $roomDetailPopupWarp.css('bottom', '-' + roomDetailPopupWarpHeight + 'px');
    $ruleCancel.css('bottom', '-' + ruleCancelHeight  + 'px');


    touch.on($popupMask, 'tap', function () {
        $timeLinePopupWarp.css('bottom', '-' + timeLinePopupWarpHeight + 'px');
        $pricePopupWarp.css('bottom', '-' + pricePopupWarpHeight + 'px');
        $roomDetailPopupWarp.css('bottom', '-' + roomDetailPopupWarpHeight + 'px');
        $ruleCancel.css('bottom', '-' + ruleCancelHeight  + 'px');
        $popupMask.hide();
    })

    $('#showMoreLine').on('tap', function () {
        $popupMask.show()
        $timeLinePopupWarp.css('bottom', 0)
    })
    $('#showPriceDetail').on('tap', function () {
        $popupMask.show()
        $pricePopupWarp.css('bottom', 0)
    })
    $('#orderDetailLabel').on('tap', function () {
        $popupMask.show()
        $roomDetailPopupWarp.css('bottom', 0)
    })
    $('#ruleCancelShow').on('tap', function () {
        $popupMask.show()
        $ruleCancel.css('bottom', 0)
    })


    $('#timeLinePopupWarp .popup-close').on('tap', function () {
        $timeLinePopupWarp.css('bottom', '-' + timeLinePopupWarpHeight + 'px');
        $popupMask.hide();
    })

    $('#pricePopupWarp .popup-close').on('tap', function () {
        $pricePopupWarp.css('bottom', '-' + pricePopupWarpHeight + 'px')
        $popupMask.hide();
    })

    $('#roomDetailPopupWarp .popup-close').on('tap', function () {
        $roomDetailPopupWarp.css('bottom', '-' + roomDetailPopupWarpHeight + 'px')
        $popupMask.hide();
    })

    $('#ruleCancel .popup-close').on('tap', function () {
        $ruleCancel.css('bottom', '-' + ruleCancelHeight + 'px')
        $popupMask.hide();
    })

    var $roomDetailBanner = $('#room_detail_swiper')
    if ($roomDetailBanner.length > 0) {
        new Swiper($roomDetailBanner, {
            loop: true,
            autoplay: 4000,
            pagination: '.swiper-pagination',
            autoplayDisableOnInteraction: false
        });
    }

})
