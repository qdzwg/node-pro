$(function () {
    /**
     * 定义全局变量
     */
    var mdate = new Date();
    var todayDate = mdate.getFullYear() + "-" + change(mdate.getMonth() + 1) + "-" + change(mdate.getDate());
    var index = 0;

    /**
     * 绑定DOM
     */
    var $routeCanlender = $('#routeCanlender'); // 详情页日历

    if ($routeCanlender.length > 0) {
        /**
         * 详情页日历点击
         */
        $routeCanlender.find('.calendar_span-able').on('click', function (e) {
            e.stopPropagation();
            var $this = $(this);
            var thisTime = $this.find('.calendar_span-time').text();
            var thisId = $routeCanlender.data('id');
            var productCode = $routeCanlender.data('productcode');
            $this.addClass('calendar_span-click');
            window.location.href = '/routeDetail/' + thisId + '/' + productCode + '?selectedDate=' + thisTime + '&m_id=' + merchantInfoId;
        })
        /**
         * 详情页日历轮播
         */
        var windowWidth = ($(window) || $(this)).width();
        var showNumber = Math.round(windowWidth/640*6); // 四舍五入
        var routeCanlender = new Swiper($routeCanlender, {
            slidesPerView: showNumber,
            spaceBetween: 3,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

        //更多日期点击效果
        $('#goRouteDate').click(function () {
            $(this).addClass('click')
        })

    }
    else {
        var $nums = $(".numbernum"); //数量框
        var $routeSubmit = $('#routeSubmit'); //线路提交按钮
        var $inputList = $('#inputList'); // 详情页日历

        if (typeof selectedDate === 'undefined' || !selectedDate) selectedDate = todayDate;
        console.log(calanderDate)
        var inputListDate = [];
        /**
         * 日历下单页日历初始化
         */
        $('#calendar').calendar({
            selecteday: selectedDate,
            stratday: mdate.getFullYear() + "-" + change(mdate.getMonth() + 1) + "-" + change(mdate.getDate()),
            settingdata: calanderDate.data,
            // childdata: calanderDate.data.length > 1 ? calanderDate.data[1].clCalendarDayVos : [],
            monthShowPrice: monthFloorPrice,
            onClick: function (evl, date) {
                var $this = $(evl);
                index = $this.find('.price').data('index') || 0;
                handleInputList(index, calanderDate.data);
                selectedDate = date;
            }
        })
        var $hover = $('.selecteds').length ? $('.selecteds') : $('.today');
        index = $hover.find('.price').data('index') || 0;
        handleInputList(index, calanderDate.data);

        /**
         * 日历下单页初始化加减框
         */
        $nums.each(function () {
            var nums = 0;
            $(this).numSpinner({
                min: $(this).data("min"),
                max: $(this).data("max"),
                onChange: function (evl, value) {
                    nums = 0
                    $nums.each(function () {
                        var $this = $(this);
                        nums += (+$this.val())
                    });

                    nums > 0
                        ? $routeSubmit.removeClass('disabled-btn')
                        : $routeSubmit.addClass('disabled-btn');
                }
            });
            $nums.each(function () {
                var $this = $(this);
                nums += (+$this.val())
            });

            nums > 0
                ? $routeSubmit.removeClass('disabled-btn')
                : $routeSubmit.addClass('disabled-btn');
        });

        /**
         * 提交数据
         */
        $routeSubmit.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $this = $(this);
            var moduleCode = $this.data('code');
            if (!$this.hasClass('disabled-btn')) {
                var routeId = $this.data('id');
                var parmdata = {
                    playDate: selectedDate,
                    moduleCode: moduleCode,
                    item: []
                }
                $inputList.find('li').each(function(){
                    var $this = $(this);
                    var inputNum = $this.find('.numbernum');
                    if (inputNum.length > 0) {
                        var ticketType = parseInt($this.data('tickettype'));
                        var ticketName = $this.find('.pro-info-title').text();
                        parmdata.item.push({
                            num: inputNum.val(),
                            price: $this.find('.price strong').text(),
                            ticketName: ticketName,
                            ticketType: ticketType
                        })
                    }
                })

                $.post('/cache/route', {
                    parmdata: JSON.stringify(parmdata)
                }, function (data) {
                    if (data[0].status === 200) {
                        window.location.href = '/order/route/' + routeId + '?m_id=' + merchantInfoId
                    } else if (data[0].status === 400) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    } else {
                        $('.tips p').text(data[0].message);
                        $('.tips').show();
                        $('#mask').show();
                    }
                })
            }
        })
    }


    function handleInputList(index, datas) {
        var inputListDate = [];
        for (var i = 0; i < datas.length; i++) {
            inputListDate.push(
                $.extend({}, {
                    ticketName: datas[i].ticketName,
                    ticketType: datas[i].ticketType,
                },
                    datas[i].clCalendarDayVos[index]
                )
            )
        }
        appendInput(inputListDate);
    }

    /**
     * 动态添加 选择框
     * @param {Array} inputArray
     */
    function appendInput(inputArray) {
        $routeSubmit.addClass('disabled-btn'); //禁止点击
        var inputList = '';
        console.log(inputArray)
        inputArray.forEach(function (item) {
            // if (typeof item.salePrice !== 'undefined' && item.stock) {
            var inputContent = item.stock
                ? '<input type="text" class="numbernum" value=0 data-oldnum=0 data-max="' + item.stock + '" />'
                : '<span>暂无库存<span/>';

            var price = '';
            if (typeof item.salePrice !== 'undefined') {
                price = '<span class="price"><em>￥</em><strong style="margin-right:0">' + item.salePrice + '</strong></span>';
            }
            else {
                price = '<span class="price"><strong style="margin-right:0">--</strong></span>';
                inputContent = '<span>暂不可售<span/>';
            }

            inputList += '<li data-tickettype=' + item.ticketType + '><div class="pro-info">'
                + '<h4 class="pro-info-title">' + item.ticketName + '</h4></div><div class="pro-price c-base">' + price + '</div>'
                + '<div class="pro-price">' + inputContent + '</div></li>';
            // }
        })


        $inputList.html(inputList).ready(function () {
            $('.numbernum').numSpinner({
                min: 0,
                max: $(this).data('max') || 99,
                onChange: function (evl, value) {
                    var $evl = $(evl);
                    var thisMax = parseInt($evl.data('max'));
                    nums = 0
                    $(".numbernum").each(function () {
                        var $this = $(this);
                        nums += (+$this.val())
                    });

                    nums > 0
                        ? $routeSubmit.removeClass('disabled-btn')
                        : $routeSubmit.addClass('disabled-btn');

                    if (nums > thisMax) {
                        Msg.open('总数量不得超过当前库存：' + thisMax);
                        $evl.val($evl.data('oldnum'));
                    } else {
                        $evl.data('oldnum', value);
                    }
                }
            })
        })
    }
})
function change(t) {
    if (t < 10) {
        return "0" + t;
    } else {
        return t;
    }
}
