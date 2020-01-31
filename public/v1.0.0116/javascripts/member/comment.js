$(function () {
    var validator = $('#form').validate({
        rules: {
            content: {
                required: true,
                isCode: true,
                minlength: 4,
                maxlength: 140
            }
        }
    });

    // 发布评论
    $('#sub').unbind('click').on('click', function () {
        if (validator.form()) {
            var num = $('.pfxtFen').find('.star-full').length;
            var isAnonymous = $('input[name=isAnonymous]').is(':checked') ? "T" : "F";
            var productType = module;
            switch (module) {
                case "ticket":
                    productType = "park";
                    break;
                case "shop":
                    productType = "mdse";
                    break;
                case "theater_ticket":
                    productType = "theater";
                    break;
                case "family":
                    productType = "family";
                    break;
                default:
                    break;
            }
            $.post('/member/comment', {
                orderNo: orderNo,
                goodsCode: modelCode,
                productCode:productCode || '',
                productType: productType,
                content: $('textarea[name=content]').val(),
                score: num,
                isAnonymous: isAnonymous
            }).success(function (data) {
                var datas = data[0];
                if (datas.status == 200) {
                    $('.tips p').text('评论成功！');
                } else {
                    $('.tips p').text(datas.message);
                }
                $('.mask,.tips').show();
            })
                .error(function (err) {
                    window.location.href = '/error';
                });
        }
    });

    $(".pfxtFen i").click(function () {
        var index = $(this).index() + 1;
        $(this).addClass("star-full");
        $(this).prevAll().addClass("star-full");
        $(this).nextAll().removeClass("star-full");
    });

    $('#okBtn').on('click', function () {
        if (module === 'pmsHotel') {
            window.location.href = '/member/pmsOrder/' + payOrderNo + '?m_id=' + merchantInfoId;
        } else {
            window.location.href = '/member/order/' + orderId + '?m_id=' + merchantInfoId;
        }
    });

    // 详情页
    var $userEditerInput = $('#userEditerInput');

    if ($userEditerInput.size()) {
        var $subComment = $('#subComment');
        var $addUserEditerClose = $('#addUserEditerClose');
        var $thisTarget = null;
        var userName = '';
        touch.on('.changeMyCommit', 'tap', function (params) {
            var $this = $(this);
            if (!$this.hasClass('changeMyCommit')) $this = $this.parents('.changeMyCommit');
            $thisTarget = $this.parents('.commit-list-item');
            var commitId = $this.data('id');
            $userEditerInput.addClass("show");
            $subComment.data('id', commitId);
            userName = $this.data('name');
        })

        touch.on($subComment, 'tap', function () {
            var $this = $(this);
            if (validator.form()) {
                var num = $('.pfxtFen').find('.star-full').length;
                var isAnonymous = $('input[name=isAnonymous]').is(':checked') ? "T" : "F";
                var content = $('textarea[name=content]').val();
                var id = $this.data('id');

                $.post('/member/comment/updata', {
                    id: id,
                    content: content,
                    score: num,
                    merchantInfoId: merchantInfoId,
                    isAnonymous: isAnonymous
                }).success(function (data) {
                    if (data.status === 200) {
                        Msg.open(data.message)
                        if (isAnonymous === 'T') userName = '匿名用户';
                        $thisTarget.find('.user-name .user-name__name').text(userName);
                        $thisTarget.find('.commit-list-item-content p').text(content);
                        $thisTarget.find('.user-name .score').text(num + '分');
                        $thisTarget.find('.changeMyCommit').remove();
                        $userEditerInput.removeClass('show');
                    }
                    else if (data.status === 400) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    }
                    else {
                        if (data && data.message) {
                            $.alert(data.message)
                        }
                        console.log(data);
                    }
                    // console.log(data)
                })
                    .error(function (err) {
                        console.log(err)
                    });
            }
        })

        // 点击关闭
        touch.on($addUserEditerClose, 'tap', function () {
            $userEditerInput.removeClass('show');
        })
    }




});