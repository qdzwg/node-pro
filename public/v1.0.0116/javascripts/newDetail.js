$(function () {
    var $mask = $('#mask')
        , $detailFlower = $('#detailFlower')
        , $bookingNoticeFlower = $('#bookingNoticeFlower')
        , $detailOrderBtn = $('#detailOrderBtn')
        , $showCalendar = $('#showCalendar')
        , $seatingPlanFlower = $("#seatingPlanFlower")
        , $homeSwiper = $('#home_swiper')
        ;


    var theaterCalendar = [];

    /**
     * 详情页banner
     */
    if ($homeSwiper.length > 0) {
        new Swiper($homeSwiper, {
            loop: true,
            autoplay: 4000,
            pagination: '.swiper-pagination',
            autoplayDisableOnInteraction: false
        });
    }

    // 打开座位分布图
    $("#showSeatingPlan").unbind('click').click(function () {
        if ($seatingPlanFlower.length > 0) {
            $seatingPlanFlower.addClass("show");
        }
        else {
            (function () {
                alert('暂无分布图');
            })()
        }
    });

    // 关闭浮动框
    $mask.unbind('click').click(function () {
        $(this).fadeOut(500);
        $detailFlower.css('bottom', '-22rem');
        $bookingNoticeFlower.css('bottom', '-18.5rem');
        $detailOrderBtn.show();
        $('#submitOrder').addClass('disabled-btn');
    })

    // 打开购票须知弹框
    $detailOrderBtn.unbind('click').click(function (e) {
        var purchaseDesc=$(this).data("purchasedesc")
        $detailOrderBtn.fadeOut(500);
        if(purchaseDesc=="T"){
          $bookingNoticeFlower.css('bottom', 0);
        }
        else{
            var playDate = $('.flot-timer-span.selected').data('date');
            getPlace(playDate);
            $detailFlower.css('bottom', 0);
        }
        $mask.show();

        // /theaterDetail/calendar
        $.ajax({
            url: '/theaterDetail/calendar?m_id=' + merchantInfoId + '&showCode=' + showCode,
            type: 'get',
            success: function (data) {
                if (data.status === 200 && data.data.code === "1") {
                    theaterCalendar = data.data.showResponseDto.sessionMonthFlagList;
                    var nowDateTimeNumber = stringToDate(nowText).getTime();
                    var hasShowDateArray = theaterCalendar.filter(function(item){
                        return item.flag;
                    })
                    var hasEle = false;
                    for (var t = 0, lens = hasShowDateArray.length; t < lens; t++) {
                        if (hasShowDateArray[t].flag) {
                            var thisTimeNumber = stringToDate(hasShowDateArray[t].date).getTime();
                            if (!(thisTimeNumber < nowDateTimeNumber)) {
                                nowText = hasShowDateArray[t].date;
                                hasShowDateArray = hasShowDateArray.slice(t, hasShowDateArray.length+1)
                                hasEle = true;
                                createDate(hasShowDateArray)
                                break;
                            }
                        }
                    }

                    if(!hasEle){
                        createDate([])
                    }

                    // $('.flot-timer-span__time').text(nowText);
                }
                else {
                    console.log(data);
                    createDate([])
                }
                if (data.status !== 200) {
                    console.log(data.message)
                } else {
                    console.log(data)
                }
            },
            error: function (err) {
                console.log(err)
            }

        })


    })

    // 展示日期
    function createDate(cDate) {

        if (cDate instanceof Array && !cDate.length) {
            // $detailFlower.find('.flow-timer').html('<div class="flot-timer-span"><span class="flot-timer-span__title"> </span><span class="flot-timer-span__time">暂无可选日期</span></div>');
            // return false
            cDate = [{date: nowText , flag: 0}]
        }

        var createHtml = ''
        var les = cDate.length > 6 ? 6 : cDate.length;
        for (var i = 0; i < les; i++) {
            var _thisDate = cDate[i].date.substring(5,10);
            var _thisWeek = getWeek(cDate[i].date);
            createHtml += '<div class="flot-timer-span ' + (i === 0 ? "selected" : "") + '" data-date=' + cDate[i].date+'><span class="flot-timer-span__title"> </span><span class="flot-timer-span__time">' + _thisDate + ' ' + _thisWeek +'</span></div>'
        }
        createHtml += '<div class="flot-timer-span showCalendar"><span class="flot-timer-span__title"> </span><span class="flot-timer-span__time">更多日期</span><i class="xx-icon icon-rili"> </i></div>'
        $('#calendar').calendar({
            selecteday: cDate[0].date,
            settingdata: cDate,
            url: '/theaterDetail/calendar?m_id=' + merchantInfoId + '&showCode=' + showCode,
            onClick: function (evl, date) {
                var _thisDate = date.substring(5, 10);
                var _thisWeek = getWeek(date);
                $detailFlower.find('.showCalendar .flot-timer-span__time').text(_thisDate +' '+_thisWeek);
                getPlace(date);
                $detailFlower.find('.showCalendar').data('date', date)
                $("#calendar-box").removeClass("calendar-show");
            }
        })
        getPlace(cDate[0].date);
        $detailFlower.find('.flow-timer').html(createHtml)

    }

    $detailFlower.on('tap','.flot-timer-span',function(){
        $this = $(this);
        $this.addClass('selected').siblings().removeClass('selected');
        if ($this.hasClass('showCalendar')) {
            if (!theaterCalendar) {
                $.alert('三个月之内都没有场次信息');
                return;
            }
            $("#calendar-box").addClass("calendar-show");
        }
        else {
            var thisDate = $this.data('date')
            getPlace(thisDate);
        }
        $('#submitOrder').addClass('disabled-btn');
    })

    // 同意预订
    $bookingNoticeFlower.find('#agreeNotice').click(function () {
        // var playDate = $('.flot-timer-span__time').text();
        $bookingNoticeFlower.css('bottom', '-18.5rem');
        // getPlace(playDate);
        setTimeout(function () {
            $detailFlower.css('bottom', 0);
        }, 500);
    })

    // 不同意预订
    $bookingNoticeFlower.find('#disagreeNotice').click(function () {
        $bookingNoticeFlower.css('bottom', '-18.5rem');
        $mask.fadeOut(500);
        $detailOrderBtn.show();
    })

    // 关闭选择弹框
    $('#flowClose').click(function () {
        $detailFlower.css('bottom', '-22rem');
        $mask.fadeOut(500);
        $detailOrderBtn.show();
        $('#submitOrder').addClass('disabled-btn');
    })

    // 清明上河园特殊处理
    var nowDate = new Date();
    var nowText = dateToString(nowDate);

    function showDOM(data) {
        var _showDom = '';
        for (var i = 0; i < data.length; i++) {

            _showDom += '<div class="flow-lists-item" data-sessionCode=' + data[i].sessionCode + ' data-showModelCode=' + data[i].showModelCode + ' data-theaterCode=' + data[i].theaterCode + ' data-showCode=' + data[i].showCode + '><div class="flow-lists-item-time">' +
                // '<p class="in-time">'+ data[i].startTime +'</p><p class="out-time">'+ data[i].startTime +' 离场</p></div>' +
                '<p class="in-time">' + data[i].startTime + '</p><p class="out-time">开始</p></div>' +
                '<div class="flow-lists-item-showname"><p class="show-title">' + data[i].showName + '</p>' +
                '<p class="place-name">' + data[i].theaterName + '</p></div></div>';
        }
        $('#flowLists').html(_showDom);
    }


    $("#seatingflowClose").unbind('click').click(function () {
        $seatingPlanFlower.removeClass("show");
    });

    $seatingPlanFlower.unbind('click').click(function () {
        $seatingPlanFlower.removeClass("show");
    });

    // if ($('#showCalendar').length) {
    //     $('.flot-timer-span__time').text(nowText);
    // }

    $('#flowLists').find('.flow-lists-item').live('tap', function () {
        $(this).addClass('flow-lists-item_on').siblings().removeClass('flow-lists-item_on');
        $('#submitOrder').removeClass('disabled-btn');
    })

    function getPlace(date) {
        console.log(date)
        var $flowLists = $('#flowLists');
        $.ajax({
            url: "/detail/placeByPlayDate",
            type: "POST",
            data: {
                playDate: date,
                showCode: showCode,
                merchantInfoId
            },
            beforeSend: function (xhr) {
                $flowLists.html('<div class="weui-toast weui-toas_in weui_loading_toast weui-toast--visible"><div class="weui_loading"><i class="weui-loading weui-icon_toast"></i></div><p class="weui-toast_content">数据加载中</p></div>');
            },
            complete: function (xhr, status) {
                // $flowLists.empty();
            },
            success: function (data) {
                if (data[0].status === 200 && data[0].data && data[0].data.showResponseDto) {
                    var showData = data[0].data.showResponseDto.showSessionInfos.showSessionInfo;
                    showDOM(showData);
                } else {
                    $flowLists.html("<div class='no-place'><i class='xx-icon icon-iconfont-gantanhaom'></i><span>当天暂无场次</span></div>");
                }

            }
        });
    }

    $('#submitOrder').on('click', function () {
        var playDate = $('.flot-timer-span.selected').data('date');
        if (!$(this).hasClass('disabled-btn')) {
            $('.flow-lists-item').each(function (index, item) {
                if ($(item).hasClass('flow-lists-item_on')) {
                    var sessionCode = $(item).attr('data-sessionCode'),
                        showModelCode = $(item).attr('data-showModelCode'),
                        theaterCode = $(item).attr('data-theaterCode'),
                        showCode = $(item).attr('data-showCode');

                    window.location.href = "/theater/show?saleCorpCode=" + saleCorpcode + "&playDate=" + playDate + "&sessionCode=" + sessionCode + "&showModelCode=" + showModelCode + "&theaterCode=" + theaterCode + "&showCode=" + showCode + "&m_id=" + merchantInfoId;
                }
            });
        }
    });

    $('.area-table-item').click(function () {
        $(this).addClass('bg-f63').siblings().removeClass('bg-f63');
        $("#detailOrderBtn").removeClass('disabled-btn').text('去选择座位');
    });

    $('.goChooseSeat').unbind('click').click(function () {
        $('.area-table-item').each(function (index, item) {
            var $item = $(item);
            if ($item.hasClass('bg-f63')) {
                var areaCode = $item.data('areacode'),
                    ticketCode = $item.data('ticketcode'),
                    areaName = $item.data('areaname');
                window.location.href = '/theater/select?areaCode=' + areaCode + '&areaName=' + areaName + '&ticketCode=' + ticketCode + '&m_id=' + merchantInfoId;
            }
        })
    })
})

function getWeek(date){
    var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var getDays = stringToDate(date).getDay();
    return weekday[getDays]

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

/**
 * 日期转时间
 * @param {string} string 2019-xx-xx
 */
function stringToDate(string) {
    var thisTimeArrays = string.split('-');
    return new Date(thisTimeArrays[0], parseInt(thisTimeArrays[1]) - 1, parseInt(thisTimeArrays[2]));
}
