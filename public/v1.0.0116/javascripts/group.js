$(function () {
    // 团购详情订单弹层开启、关闭
    $('.layer-close', '#goodsLayer').click(function () {
        $(this).parent().removeClass('show');
    });
    $('.showGroupLayer').click(function () {
        var mold = $(this).data("mold");
        var inputNum = $('#goodsLayer').find(".number"), shopnum = inputNum.data("shopmax"), max = inputNum.data("max");
        inputNum.val(1);
        $('.skuList li').eq(0).trigger('click');
        if (mold === "shop") {
            $('#goodsLayer').find(".group-explian").hide();
            $("#goodsLayer").find(".ellipsis").show();
            $(".skuPrice").text($(".skuPrice").data("sellprice"));
            inputNum.numSpinner("max", shopnum);
        } else {
            $('#goodsLayer').find(".group-explian").show();
            $(".skuPrice").text($(".skuPrice").data("lptprice"));
            inputNum.numSpinner("max", max);
            $('#goodsSubmitOrder').data('lptid', '0');
        }
        $('#goodsLayer').addClass('show').data("mold", mold);
    });

    //立即参团
    $('#showInvitedGroupLayer').on('click', function () {
        var $this = $(this);
        var lptId = $this.data('lptid');
        var mold = $(this).data("mold");
        var inputNum = $('#goodsLayer').find(".number"), shopnum = inputNum.data("shopmax"), max = inputNum.data("max");
        inputNum.val(1);
        $('.skuList li').eq(0).trigger('click');
        $('#goodsLayer').find(".group-explian").show();
        $(".skuPrice").text($(".skuPrice").data("lptprice"));
        inputNum.numSpinner("max", max);
        $('#goodsSubmitOrder').data('lptid', lptId);
        $('#goodsLayer').addClass('show').data("mold", mold);
    });

    function closeGoodsLayer() {
        $('#goodsLayer').removeClass('show');
    }

    $('.layer-close').click(function () {
        closeGoodsLayer();
        $('#goodsLayer').data('lptid', '0')
    });
    $('#selectedSku').click(function () {
        $('#goodsLayer').toggleClass('show');
    });
    // 商品選擇sku
    $('.skuList li').click(function () {
        if ($(this).hasClass("disabled")) {
            return false;
        }

        var mold = $('#goodsLayer').data("mold");
        var itemObj = $(this).data('skuobj');
        var limitQuantity = $(this).data("limitquantity");
        var limitFlag = $(this).data("limitflag");
        var max = itemObj.stockNum;
        var price = mold == "group" ? itemObj.lptPrice : itemObj.sellPrice;
        if (limitFlag == "T" && mold == "group") {
            max = itemObj.stockNum > limitQuantity ? limitQuantity : itemObj.stockNum;
        }
        if (!itemObj.stockNum) {
            $('#goodsLayer .stockNum').text('库存不足').addClass('c-price');
            $('#goodsLayer .goodsNumBox').hide();
            $('#goodsSubmitOrder').prop('disabled', true).removeClass('background-btn');
        } else {
            $('#goodsLayer .stockNum').text(itemObj.stockNum).removeClass('c-price');
            $('#goodsLayer .goodsNumBox').show();
            $('#goodsLayer .number').numSpinner("max", max);
            $('#goodsSubmitOrder').prop('disabled', false).addClass('background-btn');
        }
        $('#goodsLayer .skuPrice').text(price);
        $('#goodsLayer .selectedSkuName, #selectedSku .selectSku').text(replaceStr(itemObj.specParam));
        $('#goodsLayer img').attr("src", itemObj.linkImg);
        $(this).addClass('on').siblings().removeClass('on');
    });
    // 倒计时
    $('.countDownTime').each(function () {
        var type = $(this).data('styletype');
        var time = +$(this).data('time');
        var nowTime = +$(this).data('now');
        countDown(time, nowTime, this, type);
    });
    /**
     * 详情页banner
     */
    var detailSwiper = new Swiper('#home_swiper', {
        loop: true,
        autoplay: 4000,
        pagination: '.swiper-pagination',
        autoplayDisableOnInteraction: false
    });
    $("#goodsSubmitOrder").click(function () {
        var mold = $('#goodsLayer').data("mold"), parmdata = "", lptid = "0";
        if (mold === 'group') {
            lptid = $(this).data('lptid');
        }

        var msdeDetail = $('.skuInfoBox .skuItem.on').data('skuobj');
        var goodsNum = $('.goodsNumBox input.number').val();
        parmdata = {
            item: []
        }
        parmdata.item.push(msdeDetail);
        parmdata.item[0].num = goodsNum;
        parmdata.item[0].lptid = lptid;
        parmdata.item[0].productName = productName;
        parmdata.item[0].wapUrl = $(".itemInfo").find("img").attr("src");
        parmdata.item[0].productCode = productCode;
        parmdata.item[0].prodFrom = prodFrom;
        console.log(parmdata);
        $.post('/cache/' + mold, {
            parmdata: JSON.stringify(parmdata)
        }, function (data) {
            if (data[0].status == "200") {
                var id = msdeDetail.merchantMsdeInfoId;
                var url = "/order/shop/" + id + "?m_id=" + merchantInfoId + "&lptid=" + lptid;
                if (mold == "group") {
                    url += "&mold=" + mold;
                }
                window.location.href = url;
            }
        }, "json");
    });

    /**
     * 拼团弹框
     */
    $('.close-group-detail-layer').on('tap', function () {
        var $this = $(this);
        $this.parents('.group-detail-layer').hide();
        $('#mask').hide();
    });

    $('.toGroupBtn').on('tap', function () {
        var $this = $(this);
        $this.parents('.waitGroupList').find('.group-detail-layer').show();
        $('#mask').show();
    });

    $('.joinGroup').on('tap', function () {
        var $this = $(this);
        var lptId = $this.data('id');
        var inputNum = $('#goodsLayer').find(".number"), shopnum = inputNum.data("shopmax"), max = inputNum.data("max");
        $this.parents('.group-detail-layer').hide();
        $('#mask').hide();
        $('#goodsLayer').find(".group-explian").show();
        $(".skuPrice").text($(".skuPrice").data("lptprice"));
        inputNum.numSpinner("max", max);
        $('#goodsSubmitOrder').data('lptid', '0');
        $('#goodsSubmitOrder').data('lptid', lptId);
        $('#goodsLayer').toggleClass('show').data("mold", "group");
    });

    //分享
    var shareObj = {};
    var $shareContentBox = $('#shareContentBox');
    var imglist=[], linkUrl='';

    if ($shareContentBox.size()>0) {
        var $shareUrl = $shareContentBox.find('.shareUrl'),
            $showBillUrl = $shareContentBox.find('.showBillUrl'),
            $showBill = $('#showBill'),
            $shareBtn = $('#shareBtn'),
            userFrom = $shareBtn.data('iswx');

        var $showTextUrl = $shareContentBox.find('.showTextUrl'),
            $showText = $('#showText'),
            $bill_text= $('#bill_text'),
            $shareMask= $('.share-mask'),
            billSwiper
        ;
        $shareBtn.on('click', function () {
            var $this = $(this);
            var mold = $this.data('mold');
            var id = $this.data('id');
            var newid = $this.data('newid');

            checkUserPromoter(function (data) {
                if(data){
                    //判断是否为全员推广员
                    if( data.binded ){
                        //是-请求推广信息
                        $.showLoading('加载中');
                        $.post('/detail/getQyyxPromoteBar', {
                            'm_id': merchantInfoId,
                            'businessId': id,
                            'id': newid,
                            'module': mold
                        }).success(function (data) {
                            console.log(data);
                            $.hideLoading();
                            if (data[0].status === 200) {
                                var shareData = data[0].data;
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
                                if (shareData) {
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
                            //     if(data[0].message==='会员信息不存在' ){
                            //         window.location.href = '/login/?m_id=' + merchantInfoId + '&redir=' + location.href;
                            //     }else if(data[0].message==='请求异常:推广员信息不存在' || data[0].message.indexOf('请先注册') > -1 || data[0].message==='用户全员营销账户不存在！'|| data[0].message==='您还不是推广员,请先注册'|| data[0].message==='用户全员主账户不存在！'){
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
            // $.post('/detail/getQyyxPromoteBar', {
            //     'm_id': merchantInfoId,
            //     'id': id,
            //     'module': mold
            // })
            //     .success(function (data) {
            //         if (data[0].status === 200) {
            //             var shareData = data[0].data;
            //             if (shareData) {
            //                 if (shareData.imgUrl) {
            //                     // .shareUrl
            //                     $shareUrl.hide();
            //                     $showBillUrl.data('url', shareData.imgUrl)
            //                 } else {
            //                     if (shareData.proUrl) {
            //                         $showBillUrl.hide();
            //                         $shareUrl.data('url', shareData.proUrl).css('border-bottom', 'none');
            //                     }
            //                 }
            //             }
            //             $shareContentBox.show();
            //         }
            //         else if (data[0].status === 400) {
            //             window.location.href = '/login/?m_id=' + merchantInfoId;
            //         } else {
            //             $('.tips p').text(data[0].message);
            //             $('.mask,.tips').show();
            //         }
            //
            //     });
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
            $showBill.show();
            $('.billmask').show();

            if(billSwiper){ billSwiper.removeAllSlides(); }
            imglist.imgUrl.forEach(function (v) {
                billSwiper.appendSlide('<div class="swiper-slide"><div class="ss-con"><img src="'+v+'" alt="" /></div></div>');
            });
        });
        //展示文案输入
        $showTextUrl.on('tap', function () {
            // alert($shareUrl.data('url'));
            $showText.find('textarea').val('【'+ $showTextUrl.data('title')+'】\n'+linkUrl||$shareUrl.data('url')+'\n' );
            $showText.show();
            $('.textmask').show();
        });


//分享文案
        var clipboardText = new ClipboardJS('#showTextBtn', {
            text: function () {
                // alert('1111');
                var vl=$bill_text.val(),
                    jn = { name: $showTextUrl.data('title'), url: linkUrl||$shareUrl.data('url') };
                return shareMatch( vl, jn);
            }
        });
        clipboardText.on('success', function (e) {
            // alert("复制文案成功！快分享给小伙伴吧~");
            $.alert("复制文案成功！快分享给小伙伴吧~", "复制成功", function() {
                $.closeModal();
            });
            $('#showTextBtn').html('再次复制');
        });
        clipboardText.on('error', function (e) {
            // alert('复制链接失败！工程师正在加紧修复~');
            $.alert("复制链接失败！工程师正在加紧修复~", "复制失败", function() {
                $.closeModal();
            });
            $('#showTextBtn').html('再次复制');
        });


        //分享地址
        var clipboard = new ClipboardJS('.shareUrl', {
            text: function () {
                return linkUrl || $shareUrl.data('url');
            }
        });
        clipboard.on('success', function (e) {
            // alert('复制链接成功！快分享给小伙伴吧~')
            $.alert("复制文案成功！快分享给小伙伴吧~", "复制成功", function() {
                $.closeModal();
            });
        });
        clipboard.on('error', function (e) {
            // alert('复制链接失败！工程师正在加紧修复~')
            $.alert("复制链接失败！工程师正在加紧修复~", "复制失败", function() {
                $.closeModal();
            });
        });



        $('#closeContentBox').on('tap', function (e) {
            e.stopPropagation();
            $shareContentBox.removeClass('show');
            $shareMask.hide();
        });

        $('#closeShowBill').on('tap', function () {
            $showBill.hide();
            //  $shareContentBox.removeClass('show');
            $('.billmask').hide();
            // $shareMask.hide();
        });

        $('#closeShowText').on('tap', function () {
            $showText.hide();
            //  $shareContentBox.removeClass('show');
            $('.textmask').hide();
            // $shareMask.hide();
        });


    }

    $('#sharetip').on('tap', function () {
        $("#sharetip").removeClass("weixin-sharetip-show");
    });

});