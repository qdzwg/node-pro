$(function () {
    var $userInfoform = $('#userInfoform');
    var $userInfolists = $('#userInfolists');
    var validator;

    if ($userInfolists.length > 0) {
        // 点击图标展示删除按钮
        touch.on($userInfolists.find('.icon-shanchu'), 'tap', function () {
            $userInfolists.find('.user-info-delete.show').removeClass('show');
            $(this).parents('.user-info-item')
                .find('.user-info-delete')
                .addClass('show');
        });

        // 左滑打开删除按钮
        touch.on('.user-info-item', 'swipeleft', function () {
            var $this = $(this);
            $userInfolists.find('.user-info-delete.show').removeClass('show');

            $this = $this.hasClass('user-info-item')
                ? $this
                : $this.parents('.user-info-item');
            $this.find('.user-info-delete')
                .addClass('show');
        });

        // 右滑关闭删除按钮
        touch.on('.user-info-item', 'swiperight', function () {
            var $this = $(this);
            $this = $this.hasClass('user-info-item')
                ? $this
                : $this.parents('.user-info-item');
            $this.find('.user-info-delete')
                .removeClass('show');
        });

        $userInfolists.find('.user-info-delete').live('tap',function(){
            var $this = $(this);
            var id = $this.data('id');
            $.get('/member/links/delete/' + id, function (res) {
                if (res) {
                    if (typeof res.message !== 'undefined') Msg.open(res.message)
                    if (res.status === 200) {
                        if ($userInfolists.find('.user-info-item').length > 1) {
                            $this.parents('.user-info-item').remove();
                        }
                        else {
                            $userInfolists
                                .empty()
                                .append('<div class="nodata no-data n-nbm"><i class="xx-icon icon-tishifill"></i><p>暂无数据</p></div>');
                            // if ($('.footer-btn__link').length !== 1) {
                            //     $userInfolists.append('<li class="user-info-item"><a href="/member/links/detail?orderId=1180" class="btn">去添加</a></li>')
                            // }
                        }
                    }
                }
            })
        })

        // touch.on($userInfolists.find('.user-info-delete'), 'tap', function () {
        //     var $this = $(this);
        //     var id = $this.data('id');
        //     $.get('/member/links/delete/' + id, function (res) {
        //         if (res) {
        //             if (typeof res.message !== 'undefined') Msg.open(res.message)
        //             if (res.status === 200) {
        //                 if ($userInfolists.find('.user-info-item').length > 1) {
        //                     $this.parents('.user-info-item').remove();
        //                 }
        //                 else {
        //                     $userInfolists
        //                         .empty()
        //                         .append('<div class="no-data n-nbm"><i class="xx-icon icon-tishifill"></i><p>暂无数据</p></div>');
        //                     if ($('.footer-btn__link').length !== 1) {
        //                         $userInfolists.append('<li class="user-info-item"><a href="/member/links/detail?orderId=1180" class="btn">去添加</a></li>')
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // });
    }
    else if ($userInfoform.length > 0) {
        touch.on('#submitUserInfoForm', 'tap', function (e) {
            var orderId = $(this).data('orderid');
            var url = $(this).data('url');
            console.log(validator.form());
            if (validator.form()) {
                $.post('/member/links/linksUserInfoSave', $userInfoform.serialize(), function (res) {
                    if (res) {
                        Msg.open(res.message);
                        if (res.status === 200) {
                            setTimeout(function () {
                                if (url && url.indexOf('/member/links/detail') === -1) {
                                    window.location.href = url
                                    
                                } else {
                                    !!orderId
                                        ? window.location.href = '/order/ticket/' + orderId + '?m_id=' + merchantInfoId
                                        : window.location.href = '/member/links/lists?m_id=' + merchantInfoId;
                                }

                            }, 300);
                        }
                    }
                })
            }
        })


        validator = $userInfoform.validate({
            ignore: ":hidden",
            rules: {
                name: {
                    required: true,
                    maxlength: 10
                },
                phone: {
                    required: true,
                    isMobile: true
                },
                certNo: {
                    isIdCardNo: true
                }
            }
        });

        // 下单页隐藏联系人信息重新输入
        var changeInputs = $('.changeInput,.order-item .icon-iconfont-xie');
        var inputContent = $('input.inputContent');
        changeInputs.click(function () {
            var $t = $(this);
            if (!$(this).hasClass('changeInput')) {
                $t = $(this).parent().find('.changeInput');
            }
            $t.next('input').removeClass('hide').focus().end().hide();
        });

        inputContent.blur(function () {
            var _this = $(this);
            var newVal = _this.val();
            var name = _this.attr('name');
            if (newVal) {
                switch (name) {
                    case 'linkName':
                        newVal = replaceName(newVal);
                        break;
                    case 'buyerMobile':
                        newVal = replacePhone(newVal);
                        break;
                    case 'buyerIdNo':
                        newVal = replaceCertNo(newVal);
                }
                _this.addClass('hide').prev().text(newVal).show();
            }
        });
    }

})