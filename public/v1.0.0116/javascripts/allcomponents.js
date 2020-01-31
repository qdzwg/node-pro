$(function () {
    /************************************************************************************
     * | banner |
     ***********************************************************************************/
    function bannerInit() {
        var $banner = {
            bannerSwiper1: $('.banner__swiper1'),
            bannerSwiper2: $('.banner3')
        }
        if ($banner.bannerSwiper1.length > 0) {
            bannerSweiper1($banner.bannerSwiper1);
        }
        if ($banner.bannerSwiper2.length > 0) {
            bannerSweiper2($banner.bannerSwiper2)
        }
        $banner = null; //释放内存
    }

    /************************************************************************************
     * | search |
     ***********************************************************************************/
    touch.on('.icon-sousuo1', 'tap', function () {
        var modelName = $('#listSearchInput').val() || $('.search__normal-inp').val();
        window.location.href = '/csearch?modelName=' + modelName + '&m_id=' + merchantInfoId;
    });
    $(document).on('keydown', function (e) {
        if (e && e.keyCode == 13) {
            var modelName = $('.search__normal-inp').val();
            window.location.href = '/csearch?modelName=' + modelName + '&m_id=' + merchantInfoId;
        }
    });

    //banner轮播
    (function () {
        bannerInit();
    })();


    //- 产品分组点击切换
    // var tabsSwiper = new Swiper('.swiper-pro', {
    //     paginationClickable: true,
    //     loop: true,
    //     autoHeight: true,
    //     onSlideChangeStart: function (Swiper) {
    //         $(".productGroup1 .on").removeClass('on');
    //         $(".productGroup1 li").eq($('.swiper-pro .swiper-slide-active').attr('data-swiper-slide-index')).addClass('on');
    //     }
    // });
    // $(".productGroup1 li").on('click', function (e) {
    //     if ($(this).hasClass("on")) {

    //     }
    //     else {
    //         $(".productGroup1 .on").removeClass('on');
    //         $(this).addClass('on');
    //         tabsSwiper.slideTo($(this).index() + 1);
    //     }
    // });

    //产品分组顶部菜单tab切换
    // $(document).on('click', '.productGroup1-ul li', function () {
    //     var pIndex = $(this).index();
    //     $(this).addClass('on').siblings().removeClass('on');
    //     $('.swiper-pro ul:eq("' + pIndex + '")').show().siblings().hide();
    // });
    // $('.productGroup1-ul li:eq(0)').trigger('click');
    if ($('.productGroup1').length > 0) {
        $('.productGroup1').each(function (index, item) {
            var $this = $(this);
            // var thistabcon = $this.find('.swiper-pro');
            $this.find('.productGroup1-ul li').click(function () {
                var pIndex = $(this).index();
                $(this).addClass('on').siblings().removeClass('on');
                $this.find('.swiper-pro').find('ul').eq(pIndex).show();
                $this.find('.swiper-pro').find('ul').eq(pIndex).siblings().hide();
                $this.find('.productGroup1-list-type3').scrollLeft(0);
                //处理吸顶tab切换
                if ($('.pageInter-group1-type2').length > 0) {
                    var bscrollTop = $(window).scrollTop(); //页面滚动的距离
                    var offsetTop = $('.pageInter-group1-type2').offset().top; //元素距离顶部的距离
                    if (bscrollTop > offsetTop) {
                        $('html, body').animate({
                            scrollTop: offsetTop
                        }, 500);
                    }
                }
            });
            $(this).find('.productGroup1-ul li:eq(0)').trigger('click');
        });
    }

    if ($('.weather-warpper').length > 0) {
        var  arr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        var  date = new Date().getDay();
        var weekDay = arr[date];
        var weatherData = null;
        $('.weather-warpper').each(function(){
            var $this = $(this);
            $this.find('.week').text(weekDay); //设置星期
            var dataItem = $this.data('item');
            if (dataItem.province) {
                AMap.plugin("AMap.Weather", function () {
                    var weather = new AMap.Weather();
                    //查询实时天气信息, 查询的城市到行政级别的城市，如朝阳区、杭州市
                    weather.getLive(dataItem.provinceCode, function (err, data) {
                        //   console.log(data);
                        if (data && typeof data.weather !== 'undefined') {
                            weatherData = data;
                            if (weatherData) {
                                $this.find('.weather-content-right').text(weatherData.temperature + '℃');   // 设置温度
                                $this.find('.weather-name').text(weatherData.weather);   // 设置天气名称
                                $this.find('.weather-icon').html(weatherIco(weatherData.weather));  // 设置图标      
                            }
                            if (dataItem.cityCode) {
                                weather.getLive(dataItem.cityCode, function (err, data) {
                                    // console.log(data);
                                    if (data && typeof data.weather !== 'undefined') {
                                        weatherData = data;
                                        if (weatherData) {
                                            $this.find('.weather-content-right').text(weatherData.temperature + '℃');   // 设置温度
                                            $this.find('.weather-name').text(weatherData.weather);   // 设置天气名称
                                            $this.find('.weather-icon').html(weatherIco(weatherData.weather));  // 设置图标      
                                        }
                                        if (dataItem.areaCode) {
                                            weather.getLive(dataItem.areaCode, function (err, data) {
                                                console.log(data);
                                                if (data && typeof data.weather !== 'undefined') {
                                                    weatherData = data;
                                                    if (weatherData) {
                                                        $this.find('.weather-content-right').text(weatherData.temperature + '℃');   // 设置温度
                                                        $this.find('.weather-name').text(weatherData.weather);   // 设置天气名称
                                                        $this.find('.weather-icon').html(weatherIco(weatherData.weather));  // 设置图标      
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            }
            
        })
           
    }

    //产品分组上下布局吸顶
    if ($('.pageInter-group1-type2').length > 0) {
        $(window).scroll(function () {
            var bscrollTop = $(window).scrollTop(); //页面滚动的距离
            var offsetTop = $('.pageInter-group1-type2').offset().top; //元素距离顶部的距离
            // var pscrollTop = $('.pageInter-group1-type2').scrollTop(); //元素滚动的距离
            if (bscrollTop > offsetTop) {
                $('.pageInter-group1-type2').find('.productGroup1-ul').css({ 'position': 'fixed', top: 0, left: 0, 'width': '100%', 'background': '#fff', 'z-index': 99 })
            } else {
                $('.pageInter-group1-type2').find('.productGroup1-ul').css({ 'position': 'static' });
            }
        })
    }
    //产品分组上下布局样式三多个产品滑动效果
    // var swiperProgroup1 = new Swiper('.swiper-container-progroup1', {
    //     slidesPerView: 3,
    //     spaceBetween: 0,
    //     // freeMode: true,
    //     observer: true,
    //     observeParents: true,
    // });




    //产品分组左侧菜单tab切换
    // $(document).on('click', '.productGroup2-ul li', function () {
    //     var pIndex = $(this).index();
    //     $(this).addClass('on').siblings().removeClass('on');
    //     $('.productGroup2-list .productGroup2-list-box:eq("' + pIndex + '")').show().siblings().hide();
    // });
    // $('.productGroup2-ul li:eq(0)').trigger('click');

    //产品分组左侧菜单吸顶（无）
    // if ($('.pageInter-group2-type2').length > 0) {
    //     $(window).scroll(function () {
    //         var bscrollTop = $(window).scrollTop(); //页面滚动的距离
    //         var offsetTop = $('.pageInter-group2-type2').offset().top; //元素距离顶部的距离
    //         // var pscrollTop = $('.pageInter-group1-type2').scrollTop(); //元素滚动的距离
    //         if (bscrollTop > offsetTop) {
    //             $('.productGroup2-ul').css({ 'position': 'fixed', top: 0, left: 0, 'background': '#fff', 'z-index': 99 });
    //             // $('.productGroup2-ul li.on,.productGroup2-ul li.on a').css({'width':'3.25rem'});
    //             // $('.productGroup2-ul li,.productGroup2-ul li a').css({'width':'3.25rem'});   
    //         } else {
    //             $('.productGroup2-ul').css({ 'position': 'static' });
    //             // $('.productGroup2-ul li,.productGroup2-ul li a').css({'width':'3.25rem'});         
    //             // $('.productGroup2-ul li.on,.productGroup2-ul li.on a').css({'width':'3.45rem'});
    //         }
    //     })
    // }

    //产品分组左侧菜单tab切换
    if ($('.productGroup2').length > 0) {
        $('.productGroup2-ul li').click(function () {
            var pIndex = $(this).index();

            $(this).addClass('on').siblings().removeClass('on');

        });
        $('.productGroup2-ul li:eq(0)').trigger('click');
    }

    //ai拍一拍暂未开放  
    if ($('.aipyp').length > 0) {
        $('.aipyp').click(function () {
            $('.tips p').text('暂未开放');
            $('.mask,.tips').show();
        })
    }
    //公告走马灯效果
    if ($('.scroll-box').length > 0) {
        $('.scroll-box').each(function (index, item) {
            var step = 1, scrollWidth = item.scrollWidth;
            // var scrollLen = $(item).text().length;   
            var winWidth = $(window).width();
            var timer = 'timer' + index;
            if ($(item).find('em').width() >= winWidth) {
                item.innerHTML += item.innerHTML;
                timer = setInterval(function () {
                    item.scrollLeft += step;
                    if (item.scrollLeft >= scrollWidth) item.scrollLeft = 0
                }, 50);
            }

        });
    }

    //产品分组左右联动
    var arr = [];
    var sum = 0;
    var flag = true;
    $('.productGroup2-list-box').each(function (index, item) {
        sum += $(item).outerHeight();
        arr.push(sum);
    });

    $('.productGroup2-list').on('scroll', function () {
        if (flag) {
            for (var i = 0; i < arr.length - 1; i++) {
                if ($(this).scrollTop() >= arr[i] && $(this).scrollTop() < arr[i + 1]) {
                    $('.productGroup2-ul li:eq("' + (i + 1) + '")').addClass('on').siblings().removeClass('on');
                    return;
                } else {
                    $('.productGroup2-ul li:eq(0)').addClass('on').siblings().removeClass('on');
                }
            }
        }
    });
    $('.productGroup2-ul li').click(function () {
        var sIndex = $(this).index();
        $('.productGroup2-list').animate({
            scrollTop: sIndex == 0 ? 0 : arr[sIndex - 1]
        }, 500);
        flag = false
        setTimeout(function () {
            flag = true
        }, 1000);
        $(this).addClass('on').siblings().removeClass('on');
    });
})

/**
 * 图片轮播
 * @type {*|t}
 */
function bannerSweiper1($dom) {
    new Swiper($dom, {
        pagination: '.banner__swiper1-pagination',
        slidesPerView: 1,
        loop: true,
        paginationClickable: true,
        autoplay: 3000,
        speed: 600,
        autoplayDisableOnInteraction: false, //操作完后不禁止动画
    });
}

function bannerSweiper2($dom) {
    new Swiper($dom, {
        slidesPerView: 'auto',
        spaceBetween: 10,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        }
    });
}

function weatherIco(name){
    var iconArray = {
        "晴": "qing", //0
        "多云": "duoyun", //1
        "阴":"yin", //2
        "阵雨":"zhenyu", //3
        "雷阵雨":"leizhenyu", //4无
        "雷阵雨并伴有冰雹":"leizhenyubanbingbao", //5
        "雨夹雪":"yujiaxue", //6
        "小雨":"xiaoyu", //7
        "中雨":"zhongyu", //8
        "大雨":"dayu", //9
        "暴雨":"baoyu", //10
        "大暴雨":"dabaoyu", //11
        "特大暴雨":"tedabaoyu", //12
        "阵雪":"zhenxue", //13
        "小雪":"xiaoxue", //14
        "中雪":"zhongxue", //15
        "大雪":"daxue", //16
        "暴雪":"baoxue", //17
        "雾":"wu", //18
        "冻雨":"dongyu", //19
        "沙尘暴":"shachengbao", //20
        "小雨-中雨":"xiaoyu-zhongyu", //21
        "中雨-大雨":"zhongyu-dayu", //22
        "大雨-暴雨":"dayu-baoyu", //23
        "暴雨-大暴雨":"baoyu-dabaoyu", //24
        "大暴雨-特大暴雨":"dabaoyu-tedabaoyu", //25
        "小雪-中雪":"xiaoxue-zhongxue", //26
        "中雪-大雪":"zhongxue-daxue", //27
        "大雪-暴雪":"daxue-baoxue", //28
        "浮尘":"fuchen", //29
        "扬沙":"yangsha", //30
        "强沙尘暴":"qiangshachenbao", //31
        "飑":"biao", //32
        "龙卷风":"longjuanfeng", //33
        "弱高吹雪":"ruogaochuixue", //34
        "轻雾":"qingwu", //35
        "霾":"mai" //36
    }
    var iconName = iconArray[name];
    var iconStr= '';
    if (iconName.indexOf('-') !== -1) {
        var iconNames = iconName.split('-');
        iconNames.forEach(function(item){
            iconStr += '<svg style="font-size:1.146667rem" class="icon svg-icon" aria-hidden="true"><use xlink: href = "#icon-' + item + '" ></use></svg>'
        }); 
    }
    else {
        iconStr = '<svg style="font-size:1.146667rem" class="icon svg-icon" aria-hidden="true"><use xlink: href = "#icon-' + iconName + '" ></use></svg>'
    }
    return  iconStr;
}
