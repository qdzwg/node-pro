$(function () {
    var validator; // 表单校验
    $('#becomeSales').click(function () {
        var $this = $(this);
        var isQy = $this.data('isqy');
        $.get('/member/salesPromotion?m_id=' + merchantInfoId + '&isQy=' + isQy)
            .success(function (data) {
                if(data.success){                   
                    window.location.href = qyyxUrl + '/wap/loginWapAuthor.htm?username='
                    + data.username+'&password='+data.password
                        + '&redirectUrl=' +window.location.href.split('#')[0];
                }else {
                    if (data.message.indexOf('openId') !== -1) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    }
                    $('.tips p').text(data.message);
                    $('.mask,.tips').show();
                }       
            })
            .error(function (err) {
                console.log(err);
            });
    })

    var $promoteform = $('#promoteform ')
    var $submitBindPromoter= $('#submitBindPromoter') 


    $submitBindPromoter.on('tap',function(){
        var $this = $(this)
        if ($this.hasClass('disabled')) return;

        if (validator.form()) {
            $.confirm("推广员账号绑定后将无法解绑，请确认信息无误后点击“确定”按钮完成操作。", function() {
                    $.ajax({
                        url: "/member/submitBindPomoterInfo?" + $promoteform.serialize() + '&m_id=' + merchantInfoId,
                        type: "POST",
                        beforeSend: function (xhr) {
                            $.showLoading();
                        },
                        complete: function (xhr, status) {
                            $.hideLoading();
                        },
                        success: function (data) {
                            if (data && data.success) {
                                $.toast("绑定成功");
                                setTimeout(function(){
                                    window.location.href = '/member?m_id='+merchantInfoId
                                },400)
                                
                            }
                            else {
                                $.alert(data.message)
                            }
                        }
                    });
                }, function() {
                    
                });
        }
    })


    validator = $promoteform.validate({
        ignore: ":hidden",
        rules: {
            realName: {
                required: true,
                maxlength: 10
            },
            phone: {
                required: true,
                isMobile: true
            },
            accName: {
                required: true,
                maxlength: 32
            }
        }
    });

})