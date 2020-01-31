; (function ($) {
    $.fn.calendar = function (method) {
        // 如果第一个参数是字符串, 就查找是否存在该方法, 找到就调用; 如果是object对象, 就调用init方法;.
        if (methods[method]) {
            // 如果存在该方法就调用该方法
            // apply 是吧 obj.method(arg1, arg2, arg3) 转换成 method(obj, [arg1, arg2, arg3]) 的过程.
            // Array.prototype.slice.call(arguments, 1) 是把方法的参数转换成数组.
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            // 如果传进来的参数是"{...}", 就认为是初始化操作.
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.calendar');
        }
    };

    // 不把方法扩展在 $.fn.calendar 上. 在闭包内建个"methods"来保存方法, 类似共有方法.
    var methods = {
        /**
         * 初始化方法
         * @param _options
         * @return {*}
         */
        init: function (_options) {
            return this.each(function () {
                var $this = $(this);
                var opts = $.extend({}, $.fn.calendar.defaults, _options);
                var multiselectflag=0;
                // var sd = opts.selecteday.split("-");
                // var myyear = sd[0],
                //     mymonth = sd[1].replace(/\b(0+)/gi, "") - 1;
                $this.addClass("calendar-panel").width(opts.width);
                calendar.makecalendar($this, opts);
                $this.find("td:not(.other)").live("click", function () {                    
                    var day = $(this).data("day");
                    var myyear=$(this).parent().parent().parent().data("year"),
                    mymonth=$(this).parent().parent().parent().data("month");
                    var date = myyear + "-" + private_methods.p(parseInt($(this).parent().parent().parent().attr('data-month'))+ 1) + "-" + private_methods.p(day);
                    // var date = myyear + "-" + private_methods.p(mymonth + 1) + "-" + private_methods.p(day);
                    // $this.find("td:not(.other)").removeClass("selecteds").each(function () {
                    //     var $this = $(this);
                    //     var day = $this.hasClass('today')
                    //         ? '今天'
                    //         : $this.data("day")
                    //     $this.find(".date-title").text(day);
                    // });
                    var ticket = $(this).find(".price").data("ticket");
                    // $(this).addClass("selecteds");
                    // if (ticket == "undefined" || typeof (ticket) == "undefined") {
                    //     $(this).addClass("selecteds");
                    // } else {
                    //     $(this).addClass("selecteds").find(".date-title").text("余" + ticket);
                    // }                   
                    if(opts.multiselect){
                        if(!$(this).data("selected")&&multiselectflag<2){
                            multiselectflag++;
                        }else{
                            multiselectflag=1;                            
                            $this.find("td").removeClass('selected').removeData("selected");
                            $this.find("td").removeClass('selecteds');
                        }
                        var selecteddate=$this.find("td.selected"),
                            oneyear=selecteddate.parent().parent().parent().data("year"),
                            onemonth=selecteddate.parent().parent().parent().data("month"),
                            oneday=selecteddate.find("span.date-title").text()=="今天"?mydate.getDate():selecteddate.find("span.date-title").text();
                        var onedate=oneyear+"-"+private_methods.p(onemonth+1)+"-"+private_methods.p(oneday);
                        if(!private_methods.duibi(onedate,date)){
                            multiselectflag=1;
                            $this.find("td").removeClass('selected').removeData("selected");                            
                            $this.find("td").removeClass('selecteds');
                        }
                        var table=$(this).parent().parent().parent();
                        var index=table.find("td").index($(this)),oneindex=table.find("td").index(selecteddate);
                        if(mymonth==onemonth){   
                            table.find("td:lt("+index+"):gt("+(oneindex)+"):not(.other)").addClass('selecteds');
                        }else if(mymonth>onemonth){
                            var first=table.find("td").index(table.find("td[data=prevM]:last")),
                                last=$("table[data-month="+onemonth+"]").find("td").index($("table[data-month="+onemonth+"]").find("td[data=nextM]:first"));
                            var previndex=$("table[data-month="+onemonth+"]").find("td").index(selecteddate);
                            $("table[data-month="+onemonth+"]").find("td:lt("+last+"):gt("+previndex+"):not(.other)").addClass('selecteds');
                            if(first<0){
                                table.find("td:lt("+index+")").addClass('selecteds');
                            }else{
                                table.find("td:lt("+index+"):gt("+first+")").addClass('selecteds');
                            }
                        }
                        
                        $(this).data("selected",true).addClass('selected');
                
                        if(multiselectflag==2){  
                            table.find('td:eq("'+oneindex+'")').addClass('selecteds');  
                            var selectArr = [], fhArr = [];
                            var monthYear = $(this).parent().parent().parent().data('year');
                            var monthMonth = private_methods.p($(this).parent().parent().parent().data('month')+1);
                            var preFix = monthYear + '-' + monthMonth + '-';
                            $('.calendar-contnet .selecteds').map(function(index, item){
                                selectArr.push(preFix + ($(item).find('.date-title').text()<10?'0'+$(item).find('.date-title').text():$(item).find('.date-title').text()));
                            });
                            for(var i = 0; i < opts.settingdata.length; i++){
                                for(var j = 0; j < selectArr.length; j++){
                                    if(opts.settingdata[i].date == selectArr[j]){
                                        fhArr.push(opts.settingdata[i]);
                                    }
                                }
                            }
                            opts.onClick(this,fhArr);                            
                        } 
                    }else{  
                        $this.find("td:not(.other)").removeClass("selecteds").each(function () {
                            var $this = $(this);                            
                            var day = $this.hasClass('today')
                                ? '今天'
                                : $this.data("day")
                            $this.find(".date-title").text(day);
                        });     
                        $(this).addClass("selecteds");                                    
                        opts.onClick(this,date,$(this).find(".price").find("strong").text(),ticket);
                    }                    
                });
                calendar.makeHeaderHtml($this, opts)
            });
        },
        publicMethod: function () {
            private_methods.demoMethod();
        }
    };

    // 私有方法
    var private_methods = {
        flipFuns: function (year, month, opts) {
            calendar.makeDateHtml(year, month, opts);
        },
        p: function (s) {
            return s < 10 ? '0' + s : s;
        },
        duibi: function (a, b) {
            var starttimes = 0, lktimes = 0;
            if (a != null && b != null) {
                var arr = a.split("-");
                var starttime = new Date(arr[0], parseInt(arr[1]) - 1, arr[2]);
                starttimes = starttime.getTime();
                var arrs = b.split("-");
                var lktime = new Date(arrs[0], parseInt(arrs[1]) - 1, arrs[2]);
                lktimes = lktime.getTime();
                if (starttimes >= lktimes) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        },
        price: function (date, opts) {
            var len = opts.settingdata.length, pricetext = "", show = false;
            if (len > 0) {
                var startDate = opts.settingdata;                
                for (var i = 0, startLen = startDate.length; i < startLen; i++) {
                    var targetdate = startDate[i].date;
                    var targetPrice = startDate[i].salePrice;
                    var salePriceStatus = startDate[i].salePriceStatus;
                    var targetStock = startDate[i].stock || (startDate[i].stockModel=='unlimit'); // 公用库存，其他类型的不用重复取

                    // if (typeof targetPrice === 'undefined' && len > 1) { // 查询其他类型中是否设置价格补上空缺
                    //     for (var j = 1; j < len; j++) {
                    //         var thisSalePrice = opts.settingdata[j].salePrice;
                    //         if (typeof thisSalePrice !== 'undefined') {
                    //             targetPrice = opts.settingdata[j].salePrice;
                    //             break;
                    //         }
                    //     }
                    // }

                    if (date == targetdate) {
                        if (typeof targetPrice !== 'undefined' && targetStock) {
                            pricetext = "<span class='price' data-ticket='" + targetStock + "' data-index='" + i + "'><em>￥</em><strong>" + targetPrice + "</strong></span>";
                            if (!salePriceStatus || salePriceStatus !== 'F') show = true;
                        }
                        // else if (typeof targetPrice !== 'undefined') {
                        //     pricetext = "<span class='price'><em>暂无库存</em></span>";
                        //     show = false;
                        // }
                        else {
                            pricetext = "<span class='price'><em></em></span>";
                        }

                    }
                }
            }
            return [pricetext, show]
        },
        settingdate: function (data) {
            var date = [];
            $.each(data, function (i) {
                date.push(data[i].date);
            });
            return date;
        },
        
        dateDiff:function(strDateStart,strDateEnd){
            var strSeparator = "-"; //日期分隔符
            var oDate1;
            var oDate2;
            var iDays;
            oDate1= strDateStart.split(strSeparator);
            oDate2= strDateEnd.split(strSeparator);
            var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
            var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
            iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数 
            return iDays ;
        }
    };

    var mydate = new Date(),
        monthArray = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        dayArray = ["日", "一", "二", "三", "四", "五", "六"];
    var myyear = "", mymonth = "";
    //函数主体
    var calendar = {
        calendarHead: $("<div>", {
            "class": "calendar-head",
            "html": "<ul class='clearfix'><li></li><li></li><li></li><li></li></ul>"
        }),
        monthdays: function (year) {
            var monthdays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
                monthdays[1] = 29;
            }
            return monthdays;
        },
        flip: function (id, text, funs, opts) {
            var yearPrev = $("<a>", {
                "id": id,
                "href": "javascript:void(0);",
                "html": "<i class='xx-icon icon-iconfont-jiantou " + text + "'></i>"
            }).bind("click", function () {
                if (funs) {
                    switch (id) {
                        case "yearPrev":
                            myyear--;
                            break;
                        case "monthPrev":
                            mymonth--;
                            if (mymonth < 0) {
                                myyear--;
                                mymonth = 11;
                            }
                            break;
                        case "monthNext":
                            mymonth++;
                            if (mymonth > 11) {
                                myyear++;
                                mymonth = 0;
                            }
                            break;
                        case "yearNext":
                            myyear++;
                            break;
                    }
                    funs(myyear, mymonth, opts);
                }
            });
            return yearPrev;
        },
        today: function (startYear, month, opts) {
            if (month > 11) startYear++;
            month = month % 12;
            var showMonth = '<p class="month">' + monthArray[month] + '</p>';           
            return $('<div>', {
                'class': month === mymonth ? 'today-month' : '',
                'data-year': startYear,
                'data-month': month,
                'html': showMonth
            }).bind("click", function () {
                var $this = $(this);
                myyear = $this.data('year');
                mymonth = $this.data('month');
                $this.parent().parent().find('div').removeClass('today-month');
                $this.addClass('today-month');
                calenderMonth = myyear + "-" + (mymonth + 1 < 10 ? '0' + (mymonth + 1) : mymonth + 1);
                $.ajax({
                    url:opts.url,
                    async:false,
                    data: $.extend(opts.param, { "month": calenderMonth, "module": module, "id": ticketid}),
                    type:"get",
                    success:function(data){
                        opts.settingdata = data[0].data;
                        calendar.makeDateHtml(myyear, mymonth, opts);
                    }
                })
                // calendar.makeDateHtml(myyear, mymonth, opts);
            })

        },
        calendarContent: $("<div>", {
            "class": "calendar-contnet",
            "html": "<table width='100%'></table>"
        }),
        dayHtml: function () {
            var html = "<tr>";
            $.each(dayArray, function (i) {
                html += "<th>" + dayArray[i] + "</th>";
            });
            html += "</tr>";
            return html;
        },
        dateHtml: function (year, month, opts) {
            var html = "<tr>",
                monthdays = this.monthdays(year),
                days = monthdays[month],
                presentDate = new Date(year, month),
                thisCalendar = opts.settingdata,
                flag = true;
            var today = mydate.getFullYear() + "-" + private_methods.p(mydate.getMonth() + 1) + "-" + private_methods.p(mydate.getDate());
            for (var i = 0; i < presentDate.getDay(); i++) {
                var tyear = month == 0 ? year - 1 : year;
                var tmonth = month == 0 ? 12 : month;
                var previtemDay = tyear + "-" + private_methods.p(tmonth) + "-" + private_methods.p(monthdays[tmonth - 1] - presentDate.getDay() + i + 1);
                if (opts.optionsdays != null || thisCalendar.length > 0) {
                    html += "<td ";
                    if ($.inArray(previtemDay, private_methods.settingdate(thisCalendar)) == -1) {
                        html += " class='other'";
                    }
                    html += " class='other' data='prevM'>";
                }
                else {
                    if (private_methods.duibi(previtemDay, opts.stratday) || private_methods.duibi(opts.endday, previtemDay)) {
                        html += "<td class='other' data='prevM'>";
                    }
                    else {
                        html += "<td class='prevM' data='prevM'>";
                    }
                }                
                html += "</td>";
            }
            for (var j = 0; j < days; j++) {
                var itemDay = year + "-" + private_methods.p(month + 1) + "-" + private_methods.p(j + 1);
                var pricedata = private_methods.price(itemDay, opts);
                html += "<td ";
                if (today == itemDay) {
                    if ($.inArray(today, private_methods.settingdate(thisCalendar)) > -1) {
                        if (pricedata[1]) {
                            if (!opts.selecteday || opts.selecteday === today){
                                html += " class='today selecteds' data-day='" + (j + 1) + "'>";
                            } else {
                                html += " class='today' data-day='" + (j + 1) + "'>";
                            }
                        } else {
                            html += " class='other'>";
                        }
                    }
                    else {
                        html += " class='other'>";
                    }
                    html += "<span class='date-title'>今天</span><p class='calendar-explian'>" + pricedata[0] + "</p>";
                }
                else if (opts.selecteday == itemDay) {
                    html += " class='selecteds' data-day='" + (j + 1) + "'><span class='date-title'>" + (j + 1) + "</span><p class='calendar-explian'>" + pricedata[0] + "</p>";
                } else {
                    var isOther = false, overLook = private_methods.duibi(itemDay, opts.stratday) || private_methods.duibi(opts.endday, itemDay);
                    if (opts.optionsdays != null || thisCalendar.length > 0) {
                        if ($.inArray(itemDay, private_methods.settingdate(thisCalendar)) === -1 || !pricedata[1]) {
                            html += " class='other'";
                            isOther = true;
                        }
                    }
 
                    if (!isOther && overLook) {
                        html += " class='other' data-day='" + (j + 1) + "'><span class='date-title'>" + (j + 1) + "</span><p class='calendar-explian'></p></td>";
                        
                    } else {
                        if ((presentDate.getDay() + j + 1) % 7 == 0 || (presentDate.getDay() + j + 1) % 7 == 1) {
                            html += " class='weekend'";
                        }
                        html += " data-day='" + (j + 1) + "'><span class='date-title'>" + (j + 1) + "</span><p class='calendar-explian'>" + (!overLook ? pricedata[0] : '')  + "</p>";
                    }

                }
                html += "</td>";
                if ((presentDate.getDay() + j + 1) % 7 == 0) {
                    html += "</tr>";
                }
            }           
            return html;
        },
        makeHeaderHtml: function (obj, opts) {
            var startMonth = mydate.getMonth();
            var startYear = mydate.getFullYear();
            for (var i = 0; i < 4; i++) {
                this.calendarHead.find("li:eq(" + i + ")").html("").append(this.today(startYear, (startMonth + i), opts));
            }            
        },
        makeDateHtml: function (year, month, opts) {
            this.calendarContent.find("table").attr({"data-year": year, "data-month": month}).html("").append(this.dayHtml(), this.dateHtml(year, month, opts));           
        },
        makecalendar: function (obj, opts) {
            var $calendarHead = this.calendarHead,
                $calendarContent = this.calendarContent;           
            var selectd = opts.selecteday.split("-");            
            this.makeDateHtml(selectd[0], selectd[1].replace(/\b(0+)/gi, "") - 1, opts);
            $(obj).append($calendarHead, $calendarContent);
        }
    };
    // 默认参数
    $.fn.calendar.defaults = {
        width: "100%",
        multiselect: false,
        selecteday: mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate(),
        stratday: mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate(),
        endday: null,
        optionsdays: null,
        settingdata: [], 
        url:'/ticketStock?m_id='+merchantInfoId,
        param:{},   
        onClick: function (evl, date, price, ticket) { }
    };
})(jQuery);