$(function (){
    var validator = $('#form').validate({
        rules: {
            realName: {
                required:true,
                maxlength:10
            },
            idcard: {
                required:true,
                isIdCardNo: true
            },
            tel: {
                required:true,
                isMobile:true
            },
            loginName:{
                required:true,
                maxlength:10
            },
            loginPass:{
                required:true,
                rangelength: [6, 20]
            },
            newPass:{
                required: true,
                rangelength: [6, 20]
            },
            enterpassword:{
                equalTo: "#newPass"
            },
            email: {
                required:true,
                email:true
            }
        }
    });

    var submitResult=false;

    // 发布评论
    $('a.btn').on('click',function (){
        if (validator.form()){
            $.post('/member/modify?'+$('#form').serialize())
                .success(function (data){
                    var datas = data[0];
                    if (datas.status === 200){
                        window.location.href = '/member/user';
                    }else{
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err){
                    window.location.href = '/error';
                });
        }
    });

    //修改密码
    $('#setNewPassword').on('click',function(){
        if (validator.form()){
            $.get('/member/leaguerFixPwd?'+$('#form').serialize())
                .success(function (data){
                    var datas = data[0];
                    if (datas.status === 200){
                        submitResult = true;
                        $('.tips p').text('修改密码成功');
                        $('.mask,.tips').show();
                    }else{
                        $('.tips p').text(datas.message);
                        $('.mask,.tips').show();
                    }
                })
                .error(function (err){
                    window.location.href = '/error';
                });
        }
    })

    $('.tips a').on('click',function (){
        if (submitResult){
            window.location.href = '/member/user';
        }	
	});
});