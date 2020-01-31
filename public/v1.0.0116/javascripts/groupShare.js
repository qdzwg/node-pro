
$(function(){

    //分享按钮
    var $shareContentBox = $('#shareContentBox');
    if ($shareContentBox) {
        var $shareUrl = $shareContentBox.find('.shareUrl'),
            $showBillUrl = $shareContentBox.find('.showBillUrl'),
            $showBill = $('#showBill'),
            $shareBtn = $('#shareBtn'),
            $showTextUrl = $shareContentBox.find('.showTextUrl'),
            $showText = $('#showText'),
            $bill_text= $('#bill_text'),
            $shareMask= $('.share-mask'),
            billSwiper
        ;
        $shareBtn.on('tap', function () {
            var $this = $(this);
            var mold = $this.data('mold');
            var id = $this.data('id');
            var newid = $this.data('newid');

            if (mold === 'repast'){mold = 'eatery'}
            if (mold === 'repast-info'){ mold = 'repast'}


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
        });

        //展示文案输入
        $showTextUrl.on('tap', function () {
            $showText.find('textarea').val('【'+ $showTextUrl.data('title')+'】\n'+$shareUrl.data('url')+'\n' );
            $showText.show();
            $('.textmask').show();
        });


        //分享文案
        var clipboardText = new ClipboardJS('#showTextBtn', {
            text: function () {
                var vl=$bill_text.val(),
                    jn = { name: $showTextUrl.data('title'), url: $shareUrl.data('url') };
                return shareMatch( vl, jn);
            }
        });
        clipboardText.on('success', function (e) {
            // alert('复制文案成功！快分享给小伙伴吧~');
            alert("复制文案成功！快分享给小伙伴吧~");
            $('#showTextBtn').html('再次复制');
        });
        clipboardText.on('error', function (e) {
            alert('复制链接失败！工程师正在加紧修复~');
            $('#showTextBtn').html('再次复制');
        });


        //分享地址
        var clipboard = new ClipboardJS('.shareUrl', {
            text: function () {
                return $shareUrl.data('url');
            }
        });
        clipboard.on('success', function (e) {
            alert('复制链接成功！快分享给小伙伴吧~')
        });
        clipboard.on('error', function (e) {
            alert('复制链接失败！工程师正在加紧修复~')
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

        $('#sharetip').on('tap', function () {
            $("#sharetip").removeClass("weixin-sharetip-show");
        });

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


});
