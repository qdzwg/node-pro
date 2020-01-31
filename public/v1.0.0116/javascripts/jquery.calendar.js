; (function ($) {
    $.fn.calendar = function (options) {
        if (methods[options]) {
            // 如果第一个参数为字符串，就调用该方法
            // 第一个参数以外的的参数默认为该方法的参数
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (Object.prototype.toString.call(options) === '[object Object]' || !options) {
            // 如果参数是对象，就调用init
            return methods.init.apply(this, arguments);
        } else {
            // 其他情况，抛出错误
            $.error('Method ' + method + ' does not exist on jQuery.calendar');
        }
    };

    // 公共方法
    var methods = {
        init: function (_options) {
            // 始终返回调用者提供链式调用
            return this.each(function () {
                var $this = $(this);
                var opts = $.extend({}, defaults, _options); // 扩展默认参数

                calendar.init($this, opts);
            });
        }
    };

    // 私有方法
    var private = {
        // 判断是否为闰年
        isLeapYear: function (year) {
            if (Object.prototype.toString.call(year) === '[object Date]') {
                year = year.getFullYear();
            }
            if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
                return true;
            } else {
                return false;
            }
        },
        // 获取一个月的天数
        getDaysOfMonth: function (year, month) {
            if (Object.prototype.toString.call(year) === '[object Date]') {
                month = year.getMonth();
                year = year.getFullYear();
            }
            return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
        },
        // 获取一个月的一号是礼拜几
        getFirstWeek: function (year, month) {
            if (Object.prototype.toString.call(year) === '[object Date]') {
                month = year.getMonth();
                year = year.getFullYear();
            }
            var day = new Date(year, month, 1);
            return day.getDay();
        },
        // 获取一个月的最后一天是礼拜几
        getLastWeek: function (year, month) {
            if (Object.prototype.toString.call(year) === '[object Date]') {
                month = year.getMonth();
                year = year.getFullYear();
            }
            var day = new Date(year, month, this.getDaysOfMonth(year, month));
            return day.getDay();
        },
        // 格式化日期
        formatDate: function (date) {
            var month = date.getMonth() + 1;
            var day = date.getDate();

            return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
        },
        // 对翻月的处理
        operateMonth: function (year, month) {
            if (month < 0) {
                year -= 1;
                month = 11;
            } else if (month > 11) {
                year += 1;
                month = 0;
            }
            return [year, month];
        },
        sideWidth: 300, // 设置宽度临界值
        numTag: -1,  // 用于标识开始点击和结束点击的状态
        memoryTag: new Array() // 用于存储开始状态和结束状态的数组
    };
    // 构造DOM
    var calendar = {
        // 构造日期头
        getHead: function (date, firstMonth, monthTag, fn) {
            var _year = date.getFullYear(), _month = date.getMonth();
            var year = firstMonth.getFullYear(), month = firstMonth.getMonth();  // 多月切换都应该一第一个月为基数做切换
            var prevTag = '<span class="year"><</span><span class="month"><</span>';
            var nextTag = '<span class="month">></span><span class="year">></span>';
            var yearTag = '<li class="yearMonth" data-year="' + _year + '" data-month="' + (_month + 1 < 10 ? '0' + (_month + 1) : _month + 1) + '">' + _year + '年' + (_month + 1) + '月</li>';
            var arr = new Array();

            switch (monthTag) {
                case -1:
                    arr.splice(arr.length, 0, '<li class="prev">' + prevTag + '</li>', yearTag);
                    break;
                case 0:
                    arr.splice(arr.length, 0, yearTag);
                    break;
                case 1:
                    arr.splice(arr.length, 0, yearTag, '<li class="next">' + nextTag + '</li>');
                    break;
                case 2:
                    arr.splice(arr.length, 0, '<li class="prev">' + prevTag + '</li>', yearTag, '<li class="next">' + nextTag + '</li>');
                    break;
            }

            return $('<ul class="calendar_head">' + arr.join('') + '</ul>').on('click', 'li span', function () {
                if ($(this).parent().prop('class') === 'prev') {
                    if ($(this).prop('class') === 'year') {
                        year -= 1;
                    } else {
                        var operation = private.operateMonth(year, month - 1);

                        year = operation[0];
                        month = operation[1];
                    }
                } else {
                    if ($(this).prop('class') === 'year') {
                        year += 1;
                    } else {
                        var operation = private.operateMonth(year, month + 1);

                        year = operation[0];
                        month = operation[1];
                    }
                }
                fn(new Date(year, month, 1));
            });
        },
        // 构造星期
        getWeekDom: function (opts) {
            return $('<ul class="calendar_week">' + ['日', '一', '二', '三', '四', '五', '六'].map(function (item, index) {
                return '<li>' + item + '</li>';
            }).join('') + '</ul>')
        },
        // 构建月份
        getMonthDom: function (obj, opts) {
            var date = opts.selecteday, year = date.getFullYear(), month = date.getMonth(), day = date.getDate(); // 选择的月份
            var nowDate = new Date(), nYear = nowDate.getFullYear(), nMonth = nowDate.getMonth(), nDay = nowDate.getDate(); // 现在月份
            var days = private.getDaysOfMonth(date); // 选择月的天数
            var beginWeek = private.getFirstWeek(date); // 选择月1号周 
            var endWeek = private.getLastWeek(date); // 选择月最后一天周
            var monthDom = new Array(); // 用于构建DOM的数组

            // 构建上月日期
            if (opts.showMonth) {
                var operation = private.operateMonth(year, month - 1);
                var prevDays = private.getDaysOfMonth(new Date(operation[0], operation[1], 1)); // 获取上个月的天数

                for (var i = 0; i < beginWeek; i += 1) {
                    monthDom.splice(monthDom.length, 0, '<li class="item-empty">' + (prevDays - beginWeek + i + 1) + '</li>');
                }
            } else {
                for (var i = 0; i < beginWeek; i += 1) {
                    monthDom.splice(monthDom.length, 0, '<li class="item-empty"></li>');
                }
            }

            // 构建当月日期
            for (var k = 0; k < days; k += 1) {
                var today = '';

                if (nYear === year && nMonth === month && nDay === k + 1) {
                    today = 'today';
                } else if (nYear === year && nMonth === month && nDay > k + 1) {
                    today = 'item-empty';
                }
                if (opts.settingdata.length) {
                    var filterArr = opts.settingdata
                        .filter(function (item, index) {
                            var dateArr = item.date.substr(0, 10).split('-');
                            if (year == dateArr[0] && month + 1 == dateArr[1] && (k + 1) == dateArr[2]) {
                                return true;
                            }
                        }),
                        // _pd = filterArr.length ? '<span>' + (filterArr[0].salePrice ? '￥' + filterArr[0].salePrice : '无价格') + '</span><strong>' + (filterArr[0].leftSum || '无库存') + '</strong>' : '';
                        _pd = filterArr.length ? '<span data-price=' + filterArr[0].salePrice 
                        +'>' + (filterArr[0].salePrice&&today!=='item-empty' ? '￥' + filterArr[0].salePrice : '') + '</span>' : '';
                    today = filterArr.length ? today : today + ' item-empty';
                    monthDom.splice(monthDom.length, 0, '<li  class="' + today + '"><b>' + (k + 1) + '</b>' + _pd + '</li>');
                } else {
                    if (today === 'today') {
                        monthDom.splice(monthDom.length, 0, '<li style="position:relative" class="' + today + '"><b>' + (k + 1)
                            + '</b><span style="color:#fff;position:absolute;display:block;width:100%;top:1rem;line-height:normal">今天</span></li>');
                    } else {
                        monthDom.splice(monthDom.length, 0, '<li style="position:relative" class="' + today + '"><b>' + (k + 1)
                            + '</b><span style="color:#fff;position:absolute;display:block;width:100%;top:1rem;line-height:normal"></span></li>');
                    }
                }
            }
            

            // 构建下月日期
            if (opts.showMonth) {
                for (var j = 0; j < (6 - endWeek); j += 1) {
                    monthDom.splice(monthDom.length, 0, '<li class="item-empty">' + (j + 1) + '</li>');
                }
            } else {
                for (var j = 0; j < (6 - endWeek); j += 1) {
                    monthDom.splice(monthDom.length, 0, '<li class="item-empty"></li>');
                }
            }

            return $('<ul class="calendar_body">' + monthDom.join('') + '</ul>').on('click', 'li:not(.item-empty)', function () {
                // 一个数组用于存储选中的日期
                var selectedArr = new Array();
                // 一个数组用于存储返回的日期
                var reArr = new Array();
                // 将存储状态复制给局部变量，切记：局部变量更新的时候存储状态也要跟新（基本类型的变量一定要跟新掉，引用类型的变量，由于只保存一个对象指针，所以可以不用更新）
                var numTag = private.numTag, memoryTag = private.memoryTag;
                if (opts.multipleSelect) {
                    // 如果结束点击位于开始点击之前，将结束点击置为开始点击状态
                    if (memoryTag[0]) {
                        if (memoryTag[0].date.getTime() >= (new Date(date.getFullYear(), date.getMonth(), +$(this).find('b').text())).getTime()) {
                            numTag = -1;
                        }
                    }

                    // 用一个数组保存开始点击状态和结束点击状态
                    memoryTag[numTag += 1] = {
                        elem: $(this),
                        date: new Date(date.getFullYear(), date.getMonth(), +$(this).find('b').text())
                    };

                    // 每次点击开始清空样式
                    if (numTag === 0) {
                        memoryTag[0].elem.parents('.calendar_wrapper').parent().find('.calendar_body li').map(function (index, item) {
                            $(".selected").find("span").map(function (index, item) {
                                var thisPrice = $(item).data('price') || '';
                                $(item).html(thisPrice)
                            })
                            if ($(item).hasClass('today') || $(item).hasClass('item-empty')) {
                                $(item).removeClass('selected');
                            } else {
                                item.removeAttribute('class');
                            }
                            
                        });
                        $(this).addClass('selected').find('span').text('入住');
                        Msg.open('请继续选择离店日期') // 小鲸商城使用提示
                    }

                    if (memoryTag.length === 2) {
                        var e1 = memoryTag[0].elem, e2 = memoryTag[1].elem;
                        var d1 = memoryTag[0].date, d2 = memoryTag[1].date;

                        $(this).addClass('selected').find('span').text('入住');

                        if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()) {
                            // 不跨月选区间
                            e1.parents('.calendar_body').find('li:gt(' + (e1.index()) + '):not(.item-empty)').filter(':lt(' + (e2.index() - e1.index()) + ')').addClass('selected-between');
                        } else {

                            e1.parents('.calendar_body').find('li:gt(' + (e1.index()) + '):not(.item-empty)').addClass('selected-between'); // 跨月开始月
                            for (var i = e1.parents('.calendar_wrapper').index(); i < e2.parents('.calendar_wrapper').index() - 1; i += 1) {
                                obj.find('.calendar_wrapper:eq(' + i + ') .calendar_body li:not(.item-empty)').addClass('selected-between'); // 跨月中间月

                            }
                            e2.parents('.calendar_body').find('li:lt(' + (e2.index()) + '):not(.item-empty)').addClass('selected-between'); // 跨月结束月
                        }
                    }
                    if (numTag === 1) {
                        memoryTag.length = 0;
                        numTag = -1;
                        private.numTag = numTag;
                        $(this).addClass('selected').find('span').text('离店');
                    }
                    private.numTag = numTag;
                } else {
                    // 选中的日期添加class，其他直接删除class，而不是删除class的值
                    $(this).parents('.calendar_wrapper').parent().find('.calendar_body li').map(function (index, item) {
                        if ($(item).hasClass('today') || $(item).hasClass('item-empty')) {
                            $(item).removeClass('selected');
                        } else {
                            item.removeAttribute('class');
                        }
                    });
                    $(this).addClass('selected')
                }

                // 单选和多选统一返回数据
                obj.find('.calendar_wrapper')
                    .map(function (index, item) {
                        var monthData = $(item).find('.calendar_head .yearMonth');
                        var preFix = monthData.data('year') + '-' + monthData.data('month') + '-';
                        $(item).find('.calendar_body .selected,.calendar_body .selected-between')
                            .map(function (ind, ite) {
                                selectedArr.push(preFix + ($(ite).find('b').text() < 10 ? '0' + $(ite).find('b').text() : $(ite).find('b').text()));
                            });
                    });
                selectedArr.length = opts.multipleSelect ? selectedArr.length : selectedArr.length; //最后一天为结束日期不返回

                if (opts.multipleMonth > 1) {
                    if (numTag !== -1) {
                        return;
                    }
                }
                opts.settingdata
                    .map(function (item, index) {
                        selectedArr
                            .map(function (ite, ind) {
                                if (item.currDate && ite == item.currDate.substr(0, 10)) {
                                    reArr.push(item);
                                }
                            });
                    });

                opts.click(reArr.length ? reArr : selectedArr);
            });
        },
        init: function (obj, opts) {
            var _this = this;
            var width = obj.width() / opts.multipleMonth < private.sideWidth ? '100%' : 100 / opts.multipleMonth + '%';
            var firstMonth = null, // 切换月都应该是单月切换，即使是多月选择也如此，默认以第一个月为基数做切换
                monthTag = 0; // 一个标识，用于确定当前的表格头是否需要切换按钮

            obj.empty();
            obj.append(_this.getWeekDom(opts));
            for (var i = 0; i < opts.multipleMonth; i += 1) {
                var year = opts.selecteday.getFullYear(), month = opts.selecteday.getMonth();
                var operation = private.operateMonth(year, month + (i === 0 ? 0 : 1));

                if (i === 0 && opts.multipleMonth !== 1) {
                    // 多月第一个月
                    firstMonth = opts.selecteday;
                    monthTag = -1;
                } else if (i !== opts.multipleMonth - 1 && opts.multipleMonth !== 1) {
                    // 多用中间月份
                    monthTag = 0;
                } else if (i === opts.multipleMonth - 1 && opts.multipleMonth !== 1) {
                    // 多月最后一个月
                    monthTag = 1;
                } else {
                    // 单月
                    firstMonth = opts.selecteday;
                    monthTag = 2;
                }
                opts.selecteday = new Date(operation[0], operation[1], 1);
                obj
                    .append($('<div>', {
                        class: 'calendar_wrapper',
                        width: width
                    }))
                    .find('.calendar_wrapper:last-child').append(
                        this.getHead(opts.selecteday, firstMonth, monthTag, function (newDate) {
                            opts.selecteday = newDate;
                            _this.init(obj, opts);
                        }),
                        this.getMonthDom(obj, opts)
                    );
            }
        }
    };

    // 默认参数
    var defaults = {
        selecteday: new Date(),
        settingdata: [],
        multipleMonth: 1,
        multipleSelect: false,
        showMonth: false,
        click: function (date) {
            console.log(date);
        }
    };



})(window.jQuery);