
$(function () {
    // 翻页
    var dropBox = $(".drop-box"),
        localUrl = location.pathname + window.location.search,
        name = $('#listSearchInput').val(),
        pageSize = 6;// 每页数据条数
    filterObj = { currPage: 1, pageSize: pageSize, merchantInfoId: merchantInfoId };

    //post keyword
    typeof name !== 'undefined' ? filterObj.name = name : '';

    //post module
    var type = $('.csearch-tabs li:eq(0)').data('module');
    typeof type !== 'undefined' ? filterObj.type = type : '';

    $('.csearch-tabs li:eq(0)').addClass('on');
    $('.csearch-tabs li').click(function () {
        console.log($(this).offsetLeft);
        type = $(this).data('module');
        typeof type !== 'undefined' ? filterObj.type = type : '';
        $(this).addClass('on').siblings().removeClass('on');
        var value = $('#listSearchInput').val();
        //  重置筛选条件
        initParam();
        filterObj.name = value;
        unLockDropload();
        if (type === 'hotel') {
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
        }
        filterFn(dropload, 1);
    });

    // $('.csearch-tabs li:eq(0)').trigger('click');

    /**
     * 酒店入住和离店日期 
     * */
    if (type === 'hotel') {
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
    }

    //下拉加载
    var dropload = dropBox.dropload({
        scrollArea: window,
        loadDownFn: filterFn
    });

    // 关键字搜索
    touch.on(".icon-ico-search", "tap", function () {

        var value = $('#listSearchInput').val();

        //  重置筛选条件
        initParam();
        filterObj.name = value;
        unLockDropload();
        filterFn(dropload, 1);
        history.pushState({}, '聚合搜索', '/csearch?modelName=' + value + '&m_id=' + merchantInfoId);
    });

    $(document).on('keydown', function (e) {

        if (e && e.keyCode == 13) { // enter 键
            var value = $('#listSearchInput').val();

            //  重置筛选条件
            initParam();
            filterObj.name = value;
            unLockDropload();
            filterFn(dropload, 1);
            history.pushState({}, '聚合搜索', '/csearch?modelName=' + value + '&m_id=' + merchantInfoId);
        }

    })

    touch.on('#quxiao', 'tap', function (e) {
        var $this = $(this);
        var url = $this.data('url');
        window.location.href = url;
    })

    //初始化搜索
    function initParam() {
        localUrl = location.pathname;
        filterObj.currPage = 1;
    }

    // 筛选构造DOM
    function filterFn(dropload, startPage) {
        console.log(localUrl);
        console.log(filterObj);
        $.ajax({
            type: 'POST',
            url: localUrl,
            data: filterObj,
            dataType: 'json',
            success: function (res) {
                if (res.status === 200) {
                    var results = res.data, pages = Math.ceil(res.data.total / filterObj.pageSize) || 0;
                    if (filterObj.currPage > pages) {
                        if (pages == 0 && filterObj.currPage == 1) dropBox.find('ul').html('');
                        dropload.lock();
                        dropload.noData();
                        dropload.resetload();
                        return false;
                    }
                    if (startPage || filterObj.currPage == 1) {
                        // dropBox.find('ul').html(listDom(results.rows, module));
                        // var list = $(listDom(results.rows, type));
                        dropBox.find('ul').html(listDom(results.rows, type));
                        // if (type == 'all') {
                        //     // var geolocation = new BMap.Geolocation();
                        //     list.each(function (index, item) {
                        //         if (results.rows[index].esType == 'repast' || results.rows[index].esType == 'park' || results.rows[index].esType == 'hotel') {
                        //             getDistance(list, index, results.rows[index].latitudeLongitude);    
                        //             // (function () {
                        //             //     var latitudeLongitude = results.rows[index].latitudeLongitude;
                        //             //     if (latitudeLongitude && latitudeLongitude != '') {
                        //             //         var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
                        //             //         geolocation.getCurrentPosition(function (r) {
                        //             //             if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        //             //                 list.eq(index).find(".distance").text(distance(r.point.lat, r.point.lng, goalLat, goalLng) + "米")
                        //             //             }
                        //             //         });
                        //             //     }
                        //             // })(index)                            
                        //         }
                        //     })
                        // }
                        // if (type == 'repast' || type == 'park' || type == 'hotel') {
                        //     // var geolocation = new BMap.Geolocation();
                        //     list.each(function (index, item) {
                        //         getDistance(list, index, results.rows[index].latitudeLongitude);
                        //         // (function () {
                        //         //     var latitudeLongitude = results.rows[index].latitudeLongitude;
                        //         //     if (latitudeLongitude && latitudeLongitude != '') {
                        //         //         var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
                        //         //         geolocation.getCurrentPosition(function (r) {
                        //         //             if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        //         //                 list.eq(index).find(".distance").text(distance(r.point.lat, r.point.lng, goalLat, goalLng) + "米")
                        //         //             }
                        //         //         });
                        //         //     }
                        //         // })(index)
                        //     })
                        // }
                    } else {
                        // dropBox.find('ul').append(listDom(results.rows, module));
                        // var list = $(listDom(results.rows, type));
                        dropBox.find('ul').append(listDom(results.rows, type));
                        // if (type == 'all') {
                        //     // var geolocation = new BMap.Geolocation();
                        //     list.each(function (index, item) {
                        //         if (results.rows[index].esType == 'repast' || results.rows[index].esType == 'park' || results.rows[index].esType == 'hotel') {
                        //             // (function () {
                        //             //     var latitudeLongitude = results.rows[index].latitudeLongitude;
                        //             //     if (latitudeLongitude && latitudeLongitude != '') {
                        //             //         var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
                        //             //         geolocation.getCurrentPosition(function (r) {
                        //             //             if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        //             //                 list.eq(index).find(".distance").text(distance(r.point.lat, r.point.lng, goalLat, goalLng) + "米")
                        //             //             }
                        //             //         });
                        //             //     }
                        //             // })(index)
                        //             getDistance(list, index, results.rows[index].latitudeLongitude);
                        //         }

                        //     })
                        // }
                        // if (type == 'repast' || type == 'park' || type == 'hotel') {
                        //     // var geolocation = new BMap.Geolocation();
                        //     list.each(function (index, item) {
                        //         // (function () {
                        //         //     var latitudeLongitude = results.rows[index].latitudeLongitude;
                        //         //     if (latitudeLongitude && latitudeLongitude != '') {
                        //         //         var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
                        //         //         geolocation.getCurrentPosition(function (r) {
                        //         //             if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        //         //                 list.eq(index).find(".distance").text(distance(r.point.lat, r.point.lng, goalLat, goalLng) + "米")
                        //         //             }
                        //         //         });
                        //         //     }
                        //         // })(index);
                        //         getDistance(list, index, results.rows[index].latitudeLongitude);
                        //     })
                        // }
                    }
                    filterObj.currPage += 1;
                    if (filterObj.currPage > pages) {
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

    //判断是苹果自带safari浏览器给一个上滑操作触发dropload响应事件
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
        imgClass = 'page-list-img jh-list-img';

    for (var len in list) {
        var tag = '', _price = '', _location = '', _isGroup = '', _imgUrl = '', _labelClass = '';
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
        }
        if (module === 'mdse' && list[len].isGroup === 'T') {
            _isGroup += '<span class="pro-flag c-base border-base">拼团</span>';
        }

        var url = '';

        if (list[len].isGroup && list[len].isGroup == "T") {
            url = '/group/detail/' + list[len].id + '/' + list[len].productCode + '?m_id=' + merchantInfoId;
        } else {
            if (list[len].esType === 'park' || list[len].esType === 'mdse') {
                var moduleNames = { "mdse": "shop", "park": "ticket" };
                url = '/detail/' + moduleNames[list[len].esType] + '/' + list[len].id + '/page?m_id=' + merchantInfoId;
            }
            else {
                url = '/detail/' + list[len].esType + '/' + list[len].id + '/page?m_id=' + merchantInfoId;
            }
        }

        if (list[len].linkMobileImg) {
            _imgUrl = '<img src="' + eN(list[len].linkMobileImg) + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="图片" />';
        } else if (list[len].picAddr) {
            _imgUrl = '<img src="' + eN(list[len].picAddr) + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="图片" />';
        } else {
            _imgUrl = '<img src="/images/common/noPic-img.jpg" alt="图片" />'
        }
        if (list[len].esType == 'repast') {
            _imgUrl = '<img src="' + eN(list[len].linkImg) + '?imageMogr2/thumbnail/640x/strip/quality/100" alt="图片" />';
        }
        _labelClass = list[len].esType === 'route' ? 'module-label route-label' : 'module-label';
        dom += '<li>' +
            '<a class="clearfix" href="' + url + '">' +
            '<div class="' + imgClass + '"><span class="' + _labelClass + '">' + getModuleName(list[len].esType) + '</span>' +
            _imgUrl +
            '</div>';

        switch (module, list[len].esType) {
            case 'park':
                list[len].priceShow ? _price = '<span class="showPrice fr c-price"><i>￥</i><strong>' + list[len].priceShow + '</strong><em>起</em></span>' : _price = '';
                var level = ['1', '2', '3', '4', '5'];
                var levelString = '';
                if (!!list[len].parkLevel && level.indexOf(list[len].parkLevel) !== -1) {
                    levelString = ' ' + list[len].parkLevel + 'A';
                }
                if (list[len].latitudeLongitude) {
                    _location = '<i class="xx-icon icon-location"></i><span class="distance"></span>';
                }
                dom += '<div class="page-list-info">' +
                    '<h3 class="page-list-title">' +
                    '<div class="list-title-box">' + eN(list[len].nickName) + '</div>' +
                    tag +
                    '</h3>' +
                    '<p class="page-list-explian">' +
                    '<span class="">' + (list[len].areaAddr || '') + levelString + '</span>' +
                    '</p>' +
                    // '<p class="page-list-explian location">' + _location + '</p>' +
                    '<p class="page-list-explian">' +
                    '<span class="">' + list[len].salesNum + '</span>人已购买' +
                    // '<span class="">' + handleSalesNum(list[len].virtualSale, list[len].salesNum) + '</span>人已购买' +
                    _price +
                    '</p>' +

                    '</div></a></li>';
                break;
            case 'hotel':
                list[len].priceShow ? _price = '<span class="price fr"><em>￥</em><strong>' + list[len].priceShow + '</strong>起</span>' : _price = '';
                if (list[len].latitudeLongitude) {
                    _location = '<i class="xx-icon icon-location"></i><span class="distance"></span>';
                }
                dom += '<div class="page-list-info">' +
                    '<h3 class="page-list-title"><div class="list-title-box"><span><em>' + eN(list[len].nickName) + '</em>' + getHotelStar(list[len].hotelLevel) + '</span></div></h3>' +
                    '<p class="page-list-article one">' + eN(list[len].subtitle) + '</p>' +
                    '<p class="page-list-explian twoline"><span>' + (list[len].areaName ? list[len].areaName : '') + '</span><span class="ml02">' + list[len].traffic_desc + '</span></p>' +
                    // '<p class="page-list-explian location">' + _location + '</p>' +
                    '<p class="page-list-explian">' +
                    '<span class="">' + list[len].salesNum + '</span>人已购买' +
                    // '<span class="">' + handleSalesNum(list[len].virtualSale, list[len].salesNum) + '</span>人已购买' +
                    _price +
                    '</p>' +
                    '</div></a></li>';
                break;
            case 'strategy':
                dom += '<div class="raiders-info">' +
                    '<h3>' + eN(list[len].name) + '</h3>' +
                    '<p class="raiders-description">' + html2string(list[len].activityDetail) + '</p>' +
                    '<p class="strtagy-pv"><i class="xx-icon icon-eye"></i><span>' + getpvSum(list[len].pv ? list[len].pv : 0) + '</span></p>' +
                    '</div></a></li>';
                break;
            case 'mdse':
                var _price = list[len].priceShow ? '<span class="price fr"><em>￥</em><strong>' + list[len].priceShow + '</strong>起</span>' : '';
                var colors = ['#00aea8', '#00b7ee', '#f05b47', '#5e99ff', '#ffaf00'], labellevelArr = [];
                if (list[len].firstCategoryName) {
                    labellevelArr.push(list[len].firstCategoryName);
                }
                if (list[len].secondCategoryName) {
                    labellevelArr.push(list[len].secondCategoryName);
                }
                if (list[len].thirdCategoryName) {
                    labellevelArr.push(list[len].thirdCategoryName);
                }
                dom += '<div class="page-list-info"><h3 class="page-list-title"><div class="list-title-box"><span class="">' + eN(list[len].nickName) + '</span>' + _isGroup + '</div></h3>' +
                    '<p class="module-labels">' + labellevelColor(colors, labellevelArr) + '</p>' +
                    '<p class="page-list-explian">' +
                    '<span class="">' + handleSalesNum(list[len].virtualSale, list[len].salesNum) + '</span>人已购买' +
                    _price +
                    '</p></div></a></li>';
                break;
            case 'route':
                list[len].priceShow ? _price = '<span class="route-price c-price">￥<strong>' + list[len].priceShow + '</strong><em class="startper">起/人</em></span>' : _price = '';
                var colors = ['#00b7ee', '#f05b47', '#5e99ff', '#00aea8', '#00b7ee', '#f05b47'], labellevelArr = list[len].lineTheme.split(',');
                dom += '<div class="page-list-info">' +
                    '<h3 class="page-list-title">' +
                    '<div class="list-title-box twoline"><span>' + eN(list[len].nickName) + '</span><span>【' + list[len].subtitle + '】</span></div>' +
                    '</h3>' +
                    '<p class="module-labels">' + labellevelColor(colors, labellevelArr) + '</p>' +
                    '<p class="page-list-explian clearfix">' +
                    '<span class="chufa fl">' + list[len].begAddress + '出发' + list[len].useDay + '天' + list[len].useNight + '夜</span>' +
                    '<span class="fr">' + _price + '</span>' +
                    '</p>' +
                    '</div></a></li>';
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
                list[len].priceShow ? _price = '<span class="repast-Price c-price fr"><em class="adv">人均：</em><span class="rmb">￥</span>' + list[len].priceShow + '</span>' : _price = '';

                if (list[len].latitudeLongitude) {
                    _location = '<i class="xx-icon icon-location"></i><span class="distance"></span>';
                }

                dom += '<div class="page-list-info">' +
                    '<h3 class="page-list-title">' +
                    '<div class="list-title-box">' + eN(list[len].name) + '</div>' +
                    '</h3>' +
                    '<p class="page-list-explian">' + _labelDom +
                    '</p>' +
                    // '<p class="page-list-explian location">' + _location + '</p>' +
                    '<p class="page-list-explian">' +
                    '<span class="c-base list-repast-info">' + eN(list[len].tradingArea) + '</span>' +
                    _price +
                    '</p>' +
                    '</div></a></li>';
                break;
            default:
                break;
        }
    }
    return dom;
}

// 空值处理
function eN(t) {
    return t ? t : '';
}

//销量处理
function handleSalesNum(virtual, num) {
    var virtual = parseInt(virtual), num = parseInt(num), resturnNum = '';
    var _n = 1;
    var nums = virtual + num;
    if (nums > 9999) {
        _n = Math.floor(nums / 10000);
        resturnNum = _n + 'w+';
    }
    else if (nums > 999) {
        _n = Math.floor(nums / 1000);
        resturnNum = _n + 'k+';
    }
    else {
        resturnNum = nums;
    }
    return resturnNum;
}

//html转字符串
function html2string(html) {
    var msg = html.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
    msg = msg.replace(/[|]*\n/, '') //去除行尾空格
    msg = msg.replace(/&nbsp;/ig, ''); //去掉npsp
    return msg;
}

//获取业态名称
function getModuleName(str) {
    var mName = '';
    switch (str) {
        case 'park':
            mName = '景区';
            break;
        case 'hotel':
            mName = '酒店';
            break;
        case 'mdse':
            mName = '商品';
            break;
        case 'route':
            mName = '跟团游';
            break;
        case 'repast':
            mName = '餐饮';
            break;
        case 'strategy':
            mName = '攻略';
            break;
    }
    return mName;
}

//获取酒店星级对应的星数
function getHotelStar(num) {
    var starDom = '', _sHtml = '<i class="xx-icon icon-star-full"></i>';
    for (var i = 0; i < parseInt(num); i++) {
        starDom += _sHtml;
    }
    return starDom;
}

//获取业态标签
function labelsColor(colorArr, str) {
    var labelArr = str.split('，'), _lHtml = '';
    for (var i = 0; i < (labelArr.length > 3 ? 3 : labelArr.length); i++) {
        _lHtml += '<span style="border:1px solid ' + colorArr[i] + '; color:' + colorArr[i] + '">' + labelArr[i] + '</span>';
    }
    return _lHtml;
}

//获取商品类目标签颜色
function labellevelColor(colorArr, labellevelArr) {
    var _lHtml = '';
    for (var i = 0; i < (labellevelArr.length > 3 ? 3 : labellevelArr.length); i++) {
        _lHtml += '<span style="border:1px solid ' + colorArr[i] + '; color:' + colorArr[i] + '">' + labellevelArr[i] + '</span>';
    }
    return _lHtml;
}

//获取当前位置的经纬度
// var geolocation = new BMap.Geolocation();
// function getCurPos(latitudeLongitude) {
//     var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
//     geolocation.getCurrentPosition(function (r) {
//         if (this.getStatus() == BMAP_STATUS_SUCCESS) {
//             // var distance = distance(r.point.lat, r.point.lng, goalLat, goalLng);
//             console.log(distance(r.point.lat, r.point.lng, goalLat, goalLng) + "米");
//         } else {
//             // return "获取位置失败"
//             alert('failed' + this.getStatus());
//         }
//     });
// }

//计算两个经纬度之间的距离
function distance(lat, lng, goalLat, goalLng) {            //传入位置纬度，经度和目标纬度，经度，返回距离值，单位米，对地理感兴趣的童鞋可以去研究下计算公式
    var EARTH_RADIUS = 6378.137;//地球赤道半径
    if (lat != '' && lng != '' && goalLat != '' && goalLng != '') {
        var radLat1 = rad(goalLat);
        var radLat2 = rad(lat);
        var a = radLat1 - radLat2;
        var b = rad(goalLng) - rad(lng);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s * 1000;
    } else {
        return 0;
    }
    function rad(d) {
        return d * Math.PI / 180.0;
    }
}

//因为涉及到回调异步获取当前位置的经纬度的问题 所以改造成拿到数据之后 渲染到dom节点 再操作距离的dom 重新给它赋值（即异步改造成同步）
function getDistance(list, index, latitudeLongitude) {
    var geolocation = new BMap.Geolocation();
    // var latitudeLongitude = results.rows[index].latitudeLongitude;
    if (latitudeLongitude && latitudeLongitude != '') {
        var goalLat = parseFloat(latitudeLongitude.split(',')[1]), goalLng = parseFloat(latitudeLongitude.split(',')[0]);
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {

                var finaldis = distance(r.point.lat, r.point.lng, goalLat, goalLng);
                if (finaldis / 1000 < 1) {
                    finaldis = finaldis + 'm';
                } else if (finaldis / 1000 > 1 && finaldis / 1000 < 50) {
                    finaldis = (finaldis / 1000).toFixed(2) + 'km';
                } else {
                    finaldis = '>50km';
                }
                list.eq(index).find(".distance").html(finaldis);
                if (r.accuracy == null) {
                    // alert('accuracy null:'+r.accuracy);
                    list.eq(index).find('.location').html('');
                    //用户决绝地理位置授权
                    return;
                }
            }
            // else{
            //     list.eq(index).find('.location').html('');
            // }
        }, { enableHighAccuracy: true });
    }
}

//
function getpvSum(sum) {
    var sums = parseInt(sum);
    var finalSum = operation.accDiv(sums, 10000).toFixed(1);
    return sums > 10000 ? finalSum + '万' : sums;
}

//改变地址栏的参数值
function changeURLArg(url, arg, arg_val) {
    var pattern = arg + '=([^&]*)';
    var replaceText = arg + '=' + arg_val;
    if (url.match(pattern)) {
        var tmp = '/(' + arg + '=)([^&]*)/gi';
        tmp = url.replace(eval(tmp), replaceText);
        return tmp;
    } else {
        if (url.match('[\?]')) {
            return url + '&' + replaceText;
        } else {
            return url + '?' + replaceText;
        }
    }
    return url + '\n' + arg + '\n' + arg_val;
} 
