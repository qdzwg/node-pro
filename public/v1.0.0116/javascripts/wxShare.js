$(function () {
    var imglist=[], linkUrl='';
    if (typeof isWx !== 'undefined' && isWx === 'T') {
        var curURL = encodeURIComponent(window.location.href.split('#')[0]);
        console.log(curURL);
        //分享按钮
        var $shareContentBox = $('#shareContentBox');
        var $dropBox = $('.drop-box');
        var $sharetip = $('#sharetip');


        if ($dropBox.data('module') === 'group') {
            $dropBox.on('tap', '.mainBtn', shareTabs)
        }

        if ($shareContentBox) {
            var $shareUrl = $shareContentBox.find('.shareUrl'),
                $showBillUrl = $shareContentBox.find('.showBillUrl'),
                $showBill = $('#showBill'),
                $shareBtn = $('#shareBtn'),

                $showTextUrl = $shareContentBox.find('.showTextUrl'),
                $showText = $('#showText'),
                $bill_text= $('#bill_text'),
                $shareMask= $('.share-mask'),
                billSwiper;

            $shareBtn.on('tap', function () {
                var $this = $(this);
                var mold = $this.data('mold');
                var id = $this.data('id');
                var newid = $this.data('newid');
                if (mold === 'repast') { mold = 'eatery' }
                if (mold === 'repast-info'){mold = 'repast'}

                checkUserPromoter(function (data) {
                    if(data){
                        if( data.binded ){
                            //是-请求推广信息
                            $.showLoading('加载中');
                            $.post('/detail/getQyyxPromoteBar', {
                                'm_id': merchantInfoId,
                                'businessId': id,
                                'id': newid,
                                'module': mold
                            })
                                .success(function (data) {
                                    console.log(data);
                                    $.hideLoading();
                                    if (data[0].status === 200) {
                                        var shareData = data[0].data;
                                        if (shareData) {
                                            if (shareData.imgUrl && shareData.imgUrl.length) {
                                                imglist=shareData;
                                                for (let i = 0; i < imglist.imgUrl.length; i++) {
                                                    let imgObj = new Image(); // 创建图片对象
                                                    imgObj.src = imglist.imgUrl[i];
                                                    imgObj.addEventListener('load', function () { // 这里没有考虑error，实际上要考虑
                                                        console.log('预加载完毕');
                                                    });
                                                }

                                            } else {
                                                $showBillUrl.hide();
                                            }
                                            if (shareData.proUrl) {
                                                $shareUrl.data('url', shareData.proUrl);
                                                linkUrl=shareData.proUrl;
                                                if (!shareData.imgUrl) {
                                                    $shareUrl.css('border-bottom', 'none');
                                                }
                                            } else {
                                                $shareUrl.hide();
                                                $showTextUrl.hide();
                                            }
                                            $shareContentBox.addClass('show');
                                            $shareMask.show();
                                        }
                                    }
                                    else if(data[0].status===400){
                                        window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
                                    }
                                    //----放在checkUserPromoter接口判断----
                                    // else if (data[0].status === 402) {
                                    //
                                    //     if(data[0].message==='会员信息不存在' ){
                                    //         window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
                                    //     }else if(data[0].message==='请求异常:推广员信息不存在' || data[0].message.indexOf('请先注册') > -1  || data[0].message==='用户全员营销账户不存在！'|| data[0].message==='您还不是推广员,请先注册'|| data[0].message==='用户全员主账户不存在！'){
                                    //         //不是推广员，展示注册推广员弹框
                                    //         $('.marketing-com,.marketing-mask').show();
                                    //     }else{
                                    //         Msg.open(data[0].message)
                                    //     }
                                    // }
                                    else {
                                        Msg.open(data[0].message||'出错了')
                                    }

                                })
                                .error(function (data) {
                                    $.hideLoading();
                                    Msg.open('请求出错!');
                                });
                        }else{
                            //否-判断是否允许注册||绑定
                            getCorpConfig();
                        }
                    }
                });
            });

            if($('#billSwiper').length){
                billSwiper = new Swiper('#billSwiper',{
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                    slidesPerView: 1.2,
                    autoHeight: true,
                    centeredSlides: true,
                    // paginationClickable: true,
                    spaceBetween: 20
                });
            }


            //展示海报
            $showBillUrl.on('tap', function () {
                // var _url = $(this).data('url');
                // $showBill.find('img').attr('src', _url);
                // $showBill.find('img').load(function () {
                //     var _height = $showBill.height();
                //     $showBill.css({
                //         'top': '50%',
                //         'margin-top': -((parseInt(_height)) / 2) + 'px'
                //     })
                // });
                $showBill.show();
                $('.billmask').show();
                if(billSwiper){ billSwiper.removeAllSlides(); }
                // alert(JSON.stringify(imglist));
                imglist.imgUrl.forEach(function (v) {
                    // alert(JSON.stringify(v));
                    billSwiper.appendSlide('<div class="swiper-slide"><div class="ss-con"><img src="'+v+'" alt="" /></div></div>');
                });
            });


            //展示文案输入
            $showTextUrl.on('tap', function () {
                $showText.find('textarea').val('【'+ $showTextUrl.data('title')+'】\n'+linkUrl||$shareUrl.data('url')+'\n' );
                $showText.show();
                $('.textmask').show();
            });
            //分享文案
            if( $('#showTextBtn').length>0 ){
                var clipboardText = new ClipboardJS('#showTextBtn', {
                    text: function () {
                        var vl=$bill_text.val(),
                            jn = { name: $showTextUrl.data('title'), url: linkUrl||$shareUrl.data('url') };
                        return shareMatch( vl, jn);
                    }
                });
                clipboardText.on('success', function (e) {
                    // $.alert("复制文案成功！快分享给小伙伴吧~");
                    $.alert("复制文案成功！快分享给小伙伴吧~", "复制成功", function() {
                        $.closeModal();
                    });
                    $('#showTextBtn').html('再次复制');
                });
                clipboardText.on('error', function (e) {
                    // $.alert('复制链接失败！工程师正在加紧修复~');
                    $.alert("复制链接失败！工程师正在加紧修复~", "复制失败", function() {
                        $.closeModal();
                    });
                    $('#showTextBtn').html('再次复制');
                });
            }
            

            //分享地址 
            $shareUrl.on('tap', function () {
                var $this = $(this);
                var url = linkUrl||$this.data('url');
                shareObj = {
                    title: $shareUrl.data('title'),
                    desc: $shareUrl.data('description') || '小鲸商城，旅行购物好平台。',
                    link: '//' + window.location.host + '/redirctNewUrl?reUrl=' + encodeURIComponent(url),
                    imgUrl: $shareUrl.data('img')
                };
                init(shareObj);
                Share();
            });

            $('#shareMyFriends').on('tap', function () {
                var $goodsInfo = $('#goodsInfo');
                shareObj = {
                    title: $goodsInfo.find(".ellipsis").text(),
                    desc: '小鲸商城，旅行购物好平台。',
                    // link: location.href.split('#')[0],
                    link: "//" + window.location.host + "/group/detail/" + merchantMdseInfoId + "/" + goodsCode
                        + "?invited=1&m_id=" + merchantInfoId + "&lptId=" + lptId,
                    imgUrl: $goodsInfo.find("img").attr("src")
                };
                init(shareObj);
                Share();
            });

            $('#closeContentBox').on('tap', function (e) {
                e.stopPropagation();
                $shareContentBox.removeClass('show');
                $shareMask.hide();
            });

            $('#closeShowBill').on('tap', function (e) {

                $showBill.hide();
                //  $shareContentBox.removeClass('show');
                $('.billmask').hide();
                // $shareMask.hide();
                e.stopPropagation();
            });

            $('#sharetip').on('tap', function () {
                $("#sharetip").removeClass("weixin-sharetip-show");
            });

            function Share() {
                $("#sharetip").addClass("weixin-sharetip-show");
            }


        }

        $('#closeShowText').on('tap', function () {
            $showText.hide();
            //  $shareContentBox.removeClass('show');
            $('.textmask').hide();
            // $shareMask.hide();
        });

        // 首页
        if (curPath==='/') {
            var $bannerImgs = $('.banner').find('img');
            var $indexImgs = $('img');
            var shareImg = '';
            if ($bannerImgs.size()) {
                shareImg = $bannerImgs.eq(0).attr('src')
            }
            else if ($indexImgs.size()) {
                shareImg = $indexImgs.eq(0).attr('src')
            }

            shareImg ? setCookie('shareImg', shareImg) : removeCookie('shareImg');

            getMerchantInfo(function (data) {
                var merchantInfo = data;
                shareObj = {
                    title: merchantInfo.name,
                    desc: merchantInfo.briefIntroduction,
                    link: window.location.href.split('#')[0],
                    imgUrl: shareImg || merchantInfo.logoAddr
                }
                init(shareObj);
            });
        }
        // 订单列表
        else if (curPath.indexOf('/list/order') === 0) {
            getMerchantInfo(function (data) {
                var merchantInfo = data;
                shareObj = {
                    title: '订单列表',
                    desc: merchantInfo.briefIntroduction || '小鲸商城，旅行购物好平台',
                    link: window.location.href.split('#')[0],
                    imgUrl: merchantInfo.logoAddr
                }
                init(shareObj);
            });
        }
        // 攻略列表
        else if (curPath.indexOf('/list/strategy') === 0) {
            getMerchantInfo(function (data) {
                var merchantInfo = data;
                shareObj = {
                    title: '攻略列表',
                    desc: merchantInfo.briefIntroduction || '小鲸商城，旅行购物好平台',
                    link: window.location.href.split('#')[0],
                    imgUrl: merchantInfo.logoAddr
                }
                init(shareObj);
            });
        }
        // 列表
        else if (curPath.indexOf('/list/') === 0) {
            getMerchantInfo(function (data) {
                var merchantInfo = data;
                shareObj = {
                    title: document.title,
                    desc: merchantInfo.briefIntroduction || '小鲸商城，旅行购物好平台',
                    link: window.location.href.split('#')[0],
                    imgUrl: merchantInfo.logoAddr
                }
                init(shareObj);
            });
        }
        // 订单详情
        else if (curPath.indexOf('/member/order/') === 0) {
            var $orderHeader = $('header.myorder-header');
            shareObj = {
                title: $orderHeader.data('title'),
                desc: $orderHeader.data('desc') || '小鲸商城，旅行购物好平台',
                link: window.location.href.split('#')[0],
                imgUrl: $orderHeader.data('img')
            }
            init(shareObj);
        }
        // 个人中心
        else if (curPath.indexOf('/member') === 0) {
            var title = $('.myorder-header').data('title');
            getMerchantInfo(function (data) {
                var merchantInfo = data;
                shareObj = {
                    title: '个人中心',
                    desc: merchantInfo.briefIntroduction || '小鲸商城，旅行购物好平台',
                    link: window.location.href.split('#')[0],
                    imgUrl: merchantInfo.logoAddr
                }
                init(shareObj);
            });

        }
        // 攻略详情
        else if (curPath.indexOf('/detail/strategy') === 0) {
            var title = $('.raiders-info').find('h3').text();
            var content = $('.raiders-content').html();
            var thisImg = $('.raiders-content').data('img');
            content = content.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
            content = content.replace(/[|]*\n/, '') //去除行尾空格
            content = content.replace(/&nbsp;/ig, ''); //去掉npsp
            if (title.length > 20) title = title.substring(0,20) + '...'
            if (content.length > 20) content = content.substring(0,20) + '...'

            shareObj = {
                title: title,
                desc: content || '小鲸商城，旅行购物好平台',
                link: window.location.href.split('#')[0],
                imgUrl: thisImg
            }
            init(shareObj);
        }
        // 详情
        else if ( curPath.indexOf('/detail/') === 0 ) {
            var $shareData = $('#shareData');
            shareObj = {
                title: $shareData.data('title'),
                desc: $shareData.data('dec'),
                link: window.location.href.split('#')[0],
                imgUrl: $shareData.data('img')
            }
            init(shareObj);
        }
        // 团购详情
        else if (curPath.indexOf('/group/detail/') === 0) {
            var $shareData = $('#shareData');
            shareObj = {
                title: $shareData.data('title'),
                desc: $shareData.data('dec'),
                link: window.location.href.split('#')[0],
                imgUrl: $shareData.data('img')
            }
            init(shareObj);
        }
        // 微信授权
        $.get('/wxshare/getWxSignature?m_id=' + merchantInfoId + '&url=' + curURL, function (data) {
            if (data.status === 200) {
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.data.appid, // 必填，公众号的唯一标识
                    timestamp: data.data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
                    signature: data.data.signature,// 必填，签名，见附录1
                    jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
            }
            else {
                console.log(data)
            }
            
        }, 'json')
        
        function getMerchantInfo(cb) {
            $.get('/wxshare/getMerchantInfo?m_id='+merchantInfoId,function(data){
                if (data.status === 200) {
                    cb(data.data)
                } else {
                    cb({
                        name:'小鲸商城',
                        briefIntroduction:'小鲸商城，旅行购物好平台',
                        link: window.location.href.split('#')[0],
                        imgUrl: '//statics.lotsmall.cn/wappublic/images/member/defaultFace.png'
                    })
                    console.log(data)
                }
            })
        }

        //微信分享朋友群
        function shareTabs() {
            var $this = $(this);
            var url = $this.data('url');
            var $goodsInfo = $this.parents('.group-order-item');
            shareObj = {
                title: $goodsInfo.find(".ellipsis").text(),
                desc: '小鲸商城，旅行购物好平台。',
                // link: location.href.split('#')[0],
                link: "//" + window.location.host + url,
                imgUrl: $goodsInfo.find("img").attr("src")
            };
            init(shareObj);
            $sharetip
                .addClass("weixin-sharetip-show")
                .on('tap', function () {
                    $sharetip.removeClass("weixin-sharetip-show");
                });
        }
        function init(shareInfo) {

            wx.ready(function () {
                //分享给朋友
                wx.onMenuShareAppMessage({
                    title: shareInfo.title, // 分享标题
                    desc: shareInfo.desc, // 分享描述
                    link: shareInfo.link, // 分享链接
                    imgUrl: shareInfo.imgUrl, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        shareCallback(location.href.split('#')[0]);
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });

                //分享到朋友圈
                wx.onMenuShareTimeline({
                    title: shareInfo.title, // 分享标题
                    desc: shareInfo.desc, // 分享描述
                    link: shareInfo.link, // 分享链接
                    imgUrl: shareInfo.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                        shareCallback(location.href.split('#')[0]);
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });


                //分享到QQ
                wx.onMenuShareQQ({
                    title: shareInfo.title, // 分享标题
                    desc: shareInfo.desc, // 分享描述
                    link: shareInfo.link, // 分享链接
                    imgUrl: shareInfo.imgUrl, // 分享图标
                    success: function () {
                        shareCallback(location.href.split('#')[0]);
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //分享到QQ空间
                wx.onMenuShareQZone({
                    title: shareInfo.title, // 分享标题
                    desc: shareInfo.desc, // 分享描述
                    link: shareInfo.link, // 分享链接
                    imgUrl: shareInfo.imgUrl, // 分享图标
                    success: function () {
                        shareCallback(location.href.split('#')[0]);
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
            });
        }
        // init(shareObj)

        window.initWxShare = function(newInfo) {
            var newShareInfo = Object.assign(shareObj,newInfo)
            init(newShareInfo)
        };
    }
   
    //首先，设置cookie值，使到不同的页面刷新拖拽的按钮位置不会变
    function setCookie(name, value, expires) {
        // var oDate = new Date();
        // oDate.setDate(oDate.getDate() + expires);
        document.cookie = name + '=' + value;
    }
    function getCookie(name) {
        var arr = new Array();
        arr = document.cookie.split("; ");
        var i = 0;
        for (i = 0; i < arr.length; i++) {
            arr2 = arr[i].split("=");
            if (arr2[0] == name) {
                return arr2[1];
            }
        }
        return '';
    }
    function removeCookie(name) {
        setCookie(name, '随便什么值，反正都要被删除了', -1);
    }
    function shareCallback(url) {
        $("#sharetip").removeClass("weixin-sharetip-show");
    }
    //文案匹配数据
    function shareMatch(val, data) {
        //  val= '#产品名称##产品详情短链接# ....'
        //  data= { name:'', url:'' }
        var jsonV= val.split('#'), text='';
        // jsonV.forEach(function (v) {
        //     switch (v) {
        //         case '产品名称':
        //             text+= '【'+data.name+'】';
        //             break;
        //         case '产品详情短链接':
        //             text+= data.url;
        //             break;
        //         default:
        //             text+=v;
        //             break;
        //     }
        // });
        // //如果名称 跟 链接被删除了，强行拼接上
        // if(text.indexOf(data.url)===-1){
        //     text = data.url + text;
        // }
        // if(text.indexOf(data.name)===-1){
        //     text = '【'+data.name+'】' + text;
        // }
        text=val;
        return text;
    }
})