$(function () {

    /************************************************************************************
     * | banner |
     ***********************************************************************************/
    function bannerInit() {
        var $banner = {
            bannerSwiper1: $('.bannerSwiper'),
            billLogo: $('.bill__logo')
        }
        if ($banner.bannerSwiper1.length > 0) {
            bannerSweiper1($banner.bannerSwiper1);
        }
        if ($banner.billLogo.length > 0) {
            $banner.billLogo.each(function (index) {
                billLogo($(this));
            })
        }
        $banner = null; //释放内存
    }

    /************************************************************************************
     * | search |
     ***********************************************************************************/

    function searchInit() {
        var $search = {
            searchNormal: $('.searchNormal'),
        }
        if ($search.searchNormal.length > 0) {
            $search.searchNormal.each(function () {
                searchNormal($(this));
            })

        }

        $search = null;
    }


    /************************************************************************************
     * | product |
     ***********************************************************************************/
    function productInit() {
        var $product = {
            productNormal: $('.productNormal'),
            productSwiper2: $('.productSwiper'),
        }
        if ($product.productNormal.length > 0) {
            productNormal($product.productNormal);
        }
        if ($product.productSwiper2.length > 0) {
            productNormal($product.productSwiper2);
        }
        $product = null;
    }

    /************************************************************************************
     * | productList |
     ***********************************************************************************/

    function productListInit() {
        $productList = {
            productListSwiper1: $('.productListSwiper1')
        }
        if ($productList.productListSwiper1.length > 0) {
            $productList.productListSwiper1.each(function (index) {
                productListSwiper1($(this), index)
            })
        }
        $productList = null;
    }
    /**
    * 分区推荐
    * @type {*|jQuery|HTMLElement}
    */


    (function () {
        bannerInit();
        searchInit();
        productInit();
        productListInit();
    })()

    //自定义首页跳转到中控平台
    $('.gotoPublic').click(function () {
        $.get('/gotoPublic?merchantId=' + merchantInfoId)
            .success(function (data) {
                if (data[0].status == 200) {
                    window.location.href = '//pubswap.zhiyoubao.com/publicMap/index/?acc='+data[0].message;
                } else {
                    alert(data[0].message);
                }
            })
    })
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

/**
 * 产品列表轮播
 * @type {*|t}
 */

function productNormal($dom) {
    new Swiper($dom, {
        direction: 'horizontal',
        loop: true,
        autoplay: 3000,
        // 如果需要分页器
        pagination: '.swiper-pagination',
        paginationClickable: true
    });
}

function searchNormal($dom) {
    $dom.find(".search__normal-lab").click(function () {
        var $this = $(this);
        var $tapList = $dom.find(".search__normal-list");
        var winHeight = $(window).height();
        var thisTop = $this.offset().top;
        console.log(winHeight, thisTop);
        (thisTop > (winHeight * 3 / 4))
            ? $tapList.removeClass('down').addClass('up')
            : $tapList.removeClass('up').addClass('down');
        $tapList.toggleClass("show");
    });
    $dom.find(".search__normal-list li").click(function (e) {
        e.stopPropagation();
        var _this = $(this);
        $dom.find(".searchNormalKeyname").text(_this.text());
        $dom.find(".search__normal-list").removeClass("show");
    });


    $dom.find('.searchNormalBtn').click(goSearchProduct);
    $(document).on('keydown', function (e) {
        if (e && e.keyCode == 13) {
            // goSearchProduct()
            var modelName = $('.search__normal-inp').val();
            window.location.href = '/csearch?modelName=' + modelName + '&m_id=' + merchantInfoId;
        }
    });

    function goSearchProduct() {
        var modelName = $dom.find('.search__normal-inp').val();
        window.location.href = '/csearch?modelName=' + modelName + '&m_id=' + merchantInfoId;
        // if (modelName != '') {
        //     window.location.href = '/csearch?modelName=' + modelName + '&m_id=' + merchantInfoId;
        // }
        // var mod = $dom.find(".searchNormalKeyname").text();
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
        // window.location.href = '/list/' + _module + '?modelName=' + modelName + '&m_id=' + merchantInfoId;
    }
}

function productListSwiper1($dom, index) {
    var $nav = $dom.find('.fq-recommend-nav');
    var $navLis = $nav.find('li');
    var $fqSweiper = $dom.find('.fq_swiper');
    var tabsSwiper = [];
    tabsSwiper[index] = new Swiper($fqSweiper, {
        paginationClickable: true,
        loop: true,
        autoHeight: true,
        onSlideChangeStart: function (Swiper) {
            var thisnum = $dom.find('.fq-img-list .swiper-slide-active').attr('data-swiper-slide-index');
            $navLis.removeClass('on');
            $navLis.eq(thisnum).addClass('on');

        }
    });
    touch.on($navLis, 'tap', function () {
        if (!$(this).hasClass("on")) {
            $nav.find('on').removeClass('on');
            $(this).addClass('on');
            tabsSwiper[index].slideTo($(this).index() + 1);
        }
    });
}

function billLogo($dom) {
    var color = $dom.find('.bill__logo-content-title').css('color');
    $dom.css('border-top', '2px solid ' + color);
}