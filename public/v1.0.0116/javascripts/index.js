$(function () {
    /**
      * 头部轮播
      */
    new Swiper('#home_banner,#bannerSlider', {
        pagination: '.index-pagination',
        slidesPerView: 1,
        loop: true,
        paginationClickable: true,
        autoplay: 3000,
        speed: 600,
        autoplayDisableOnInteraction: false, //操作完后不禁止动画
    });

    /**
     *下拉搜索
     */
    if ($('.sch-list').size()>0){
        $(".keyword").click(function () {
            $(".sch-list").toggleClass("show");
        });
        $(".sch-list li").click(function () {
            var _this = $(this);
            $("#keyname").text(_this.text());
            $(".sch-list").removeClass("show");
        });
    }
      
    $('#searchBtn').click(function () {
        var _this = $(this);
        var modelName = _this.parent().find('.search-inp').val();
        window.location.href = '/csearch?modelName=' + modelName+'&m_id='+merchantInfoId;
        // var mod = $("#keyname").text();
        // var _module = '';
        // switch (mod) {
        //     case '景区':
        //         _module = 'ticket';
        //         break;
        //     case '酒店':
        //         _module = 'hotel';
        //         break;
        //     case '商品':
        //         _module = 'shop';   
        //         break; 
        //     case '餐饮':
        //         _module = 'repast';
        //         break;
        //     case '跟团游':
        //         _module = 'route';
        //         break;          
        //     default:
        //         break;
        // }
        // window.location.href = '/list/'+_module+'?modelName=' + modelName+'&m_id='+merchantInfoId;
    })
    $(document).on('keydown', function (e) {
        if (e && e.keyCode == 13) {
            var modelName = $('.search-inp').val();
            window.location.href = '/csearch?modelName=' + modelName+'&m_id='+merchantInfoId;
        }
    });
    switch (themeCode) {
        case 'MTI20180316172401': //n
            moduleOne();
            break;
        case 'MTI20180316172801': //c
            moduleTwo();
            break;
        case 'MTI20180316173101':
            moduleThree();
            break;
        default:
            break;
    }

    /**
     * 模板1调用js
     */
    function moduleOne() {

    }

    /**
     * 模板2调用js
     */
    function moduleTwo() {


        /**
         * 菜单轮播
         */
        if ($(".nav-swiper .swiper-slide").length > 1) {
            var swiper_nav = new Swiper('.nav-swiper', {
                pagination: '.nav-pagination',
                loop: true
            });
        }

        /**
         * banner 轮播
         * @type {*|t}
         */
        var fineSwiper = new Swiper('#ticket_swiper', {
            direction: 'horizontal',
            loop: true,
            autoplay: 3000,
            // 如果需要分页器
            pagination: '.swiper-pagination',
            paginationClickable: true
        });

        /**
         * 产品展示
         */
        var tabsSwiper = new Swiper('#swiper_pro', {
            paginationClickable: true,
            loop: true,
            autoHeight: true,
            onSlideChangeStart: function (Swiper) {
                $(".tabs .active").removeClass('active');
                $(".tabs li").eq($('.swiper-pro .swiper-slide-active').attr('data-swiper-slide-index')).addClass('active');
            }
        });
        $(".tabs li").on('click', function (e) {
            if ($(this).hasClass("active")) {

            }
            else {
                $(".tabs .active").removeClass('active');
                $(this).addClass('active');
                tabsSwiper.slideTo($(this).index() + 1);
            }
        });

        
        /**
         * 滚动新闻
         */
        var swiper = new Swiper('.news-swiper', {
            direction: 'vertical',
            slidesPerView: 1,
            mousewheelControl: true,
            loop: true,
            autoplay: 2000,
            autoplayDisableOnInteraction: false
        });
    }

    /**
     * 模板3调用js
     */
    function moduleThree() {
        /**
         * banner 轮播
         * @type {*|t}
         */
        new Swiper('#ticket_swiper', {
            direction: 'horizontal',
            loop: true,
            autoplay: 3000,
            // 如果需要分页器
            pagination: '.swiper-pagination',
            paginationClickable: true
        });

        /**
         * 轮播新闻
         * @type {*|t}
         */
        var newsSwiper = new Swiper('.loop-news', {
            direction: 'vertical',
            loop: true,
            autoplay: 3000
        });

        /**
         * 分区推荐
         * @type {*|jQuery|HTMLElement}
         */
        var navLi = $('.fq-recommend-nav li');
        var tabsSwiper = new Swiper('#fq_swiper', {
            paginationClickable: true,
            loop: true,
            autoHeight: true,
            onSlideChangeStart: function (Swiper) {
                var thisnum = $('.fq-img-list .swiper-slide-active').attr('data-swiper-slide-index');
                navLi.removeClass('on');
                navLi.eq(thisnum).addClass('on');

            }
        });

        touch.on(navLi, 'tap', function () {
            if (!$(this).hasClass("on")) {
                $(".fq-recommend-nav .on").removeClass('on');
                $(this).addClass('on');
                tabsSwiper.slideTo($(this).index() + 1);
            }
        });
    }

});


