$(function () {
    /**
     * 账号登录规则
     */
    var validator = $('#submitForm').validate({
        rules: {
            loginName: {
                required: true,
                isMobile: true
            },
            loginPass: {
                required: true,
                rangelength: [6, 20]
            },
            password: {
                required: true,
                rangelength: [6, 20]
            },
            enterpassword: {
                equalTo: "#password"
            },
            checkCode: {
                required: true
            }
        }
    });
    var codeValid = $('#submitForm .input-box:eq(0)').validate({
        rules: {
            loginName: {
                required: true,
                isMobile: true
            }
        }
    });

    /**
     * 快捷登录规则
     */
    var validator2 = $('#submitLogin').validate({
        rules: {
            mobile: {
                required: true,
                isMobile: true
            },
            checkCode: {
                required: true
            }
        }
    });


    /**
     * 切换登录方式
     * @type {*|jQuery|HTMLElement}
     */
    var loginList = $('.login-list');
    $('#login_type').find('span').on('click', function () {
        var $this = $(this), index = $this.data('index');
        $this.siblings().removeClass('on');
        $this.addClass('on');
        loginList.hide();
        loginList.eq(index).show();
    });

    /**
     * 用户协议选择
     * @type {*|jQuery|HTMLElement}
     */
    var checkedBtn = $('#checkedBtn');
    checkedBtn.unbind('click').click(function () {
        var icon = $(this).find('i'),
            checkBox = $(this).find('input');

        icon.hasClass('checked')
            ? icon.removeClass('checked')
            : icon.addClass('checked');


        checkBox.is(':checked')
            ? checkBox.prop('checked', false)
            : checkBox.prop('checked', true)

    });

    /**
     * 发送验证码
     */
    $('#getCodeBtn').on('click', function () {
        if (codeValid.form()) {
            var sendType = $(this).data('type');
            // 快捷登录or注册
            var mobile = $('#submitLogin').find('input[name=mobile]').val() || $('#submitForm').find('input[name=loginName]').val();
            var imgCode = $('#showImgCode').find('input[name=imgCode]').val();
            $.post('/checkCode', {
                sendType: sendType,
                mobile: mobile,
                imgCode:imgCode || "",
                merchantInfoId: merchantInfoId
            }).success(function (data) {
                var datas = data[0];
                console.log(datas.checkCode);
                if (datas.message) {
                    $('.tips p').text(datas.message);
                    $('.mask,.tips').show();
                }      
                if (datas.data) {
                    if (datas.data.message) {
                        $('.tips p').text(datas.data.message);
                        $('.mask,.tips').show();
                    }
                    if (datas.data.sendNum  &&  datas.data.sendNum > 2) {
                        getCodeImg(sendType,mobile);
                        $('#showImgCode').show();
                    }       
                }
            })
                .error(function (err) {
                    window.location.href = '/error?m_id=' + merchantInfoId;
                });
        }
    });

    /**
     * 注册
     */
    $('#registerBtn').on('click', function () {
        var $this = $(this);
        if (validator.form()) {
            if ($('#check').is(':checked')) {
                $.get('/signIn?m_id=' + merchantInfoId + '&' + $('#submitForm').serialize())
                    .success(function (data) {
                        var datas = data[0];
                        var url = $this.data('url');
                        if (datas.status === 200) {
                            if (url) {
                                window.location.href = url;
                            } else {
                                window.location.href = '/?m_id=' + merchantInfoId;
                            }

                        } else {
                            $('.tips p').text(datas.message);
                            $('.mask,.tips').show();
                        }
                    })
                    .error(function (err) {
                        window.location.href = '/error?m_id=' + merchantInfoId;
                    });
            } else {
                $('.tips p').text("请勾选注册协议");
                $('.mask,.tips').show();
            }
        }
    });

    /**
     * 账号登录
     */
    $('#submitBtn').on('click', function () {
        var $this = $(this);
        if (validator.form()) {
            var url = $this.data('url');
            $.get('/leaguerLogin?m_id=' + merchantInfoId + '&' + $('#submitForm').serialize())
                .success(function (data) {
                    console.log(data);
                    var datas = data[0];
                    if (datas.status === 200) {
                        if (url) {
                            window.location.href = url;
                        } else {
                            window.location.href = '/?m_id=' + merchantInfoId;
                        }
                    } else {
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err) {
                    window.location.href = '/error?m_id=' + merchantInfoId;
                });
        }
    });

    /**
     * 快捷登录
     */
    $('#quickLogin').on('click', function () {
        var $this = $(this);
        if (validator2.form()) {
            var url = $this.data('url');
            $.get('/phoneNumberLogin?m_id=' + merchantInfoId + '&' + $('#submitLogin').serialize())
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        if (url) {
                            window.location.href = url;
                        } else {
                            window.location.href = '/?m_id=' + merchantInfoId;
                        }
                    } else {
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err) {
                    window.location.href = '/error?m_id=' + merchantInfoId;
                });
        }
    })

    /**
     * 核对验证码
     */
    $('#checkCode').click(function () {
        var $this = $(this);
        if (validator.form()) {
            var url = $this.data('url');
            $.get('/checkPhoneCode?' + $('#submitForm').serialize())
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {

                        window.location.href = '/resetPassword?m_id=' + merchantInfoId + '&id=' + datas.data.id;

                    } else {
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err) {
                    window.location.href = '/error?m_id=' + merchantInfoId;
                });
        }
    })

    /**
     * 设置新密码 
     */
    $('#setNewPassword').on('click', function () {
        var $this = $(this);
        if (validator.form()) {
            var _id = $this.data('id');
            $.get('/setNewPassword?leaguerId=' + _id + '&m_id=' + merchantInfoId + '&' + $('#submitForm').serialize())
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    } else {
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err) {
                    window.location.href = '/error?m_id=' + merchantInfoId;
                });
        }
    })
    /**
     * 点击图片码刷新
     */
    $('#reloadImageCode').on('tap',function(){
        if (codeValid.form()) {
            var sendType = $(this).data('type');
            // 快捷登录or注册
            var mobile = $('#submitLogin').find('input[name=mobile]').val() || $('#submitForm').find('input[name=loginName]').val();
            getCodeImg(sendType,mobile)
        }    
    })

    /**
     * 获取图片验证码
     */
    function getCodeImg(sendType,mobile){
        // /leaguer/api/userLeaguer/sendCheckCode
        // if (codeValid.form()) {
        //     $.get('/getImageCode', {
        //         sendType: sendType,
        //         mobile: mobile,
        //         merchantInfoId: merchantInfoId
        //         }).success(function (data) {
        //             var datas = data[0];
        //             $('.tips p').text(datas.message);
        //             $('.mask,.tips').show();
        //         })
        //         .error(function (err) {
        //             window.location.href = '/error?m_id=' + merchantInfoId;
        //         });
        // }
        var imgBaseUrl = $('#reloadImageCode').data('base');
        var showImageCode = imgBaseUrl + '/leaguer/api/userLeaguer/createImgCode?sendType='+sendType+'&mobile='+mobile+'&merchantInfoId='+merchantInfoId+'&rand='+ new Date().getTime();

        $("#reloadImageCode img").attr("src", showImageCode)
    }

});