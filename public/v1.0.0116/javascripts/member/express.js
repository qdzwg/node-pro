$(function (){
    var validator = $('#form').validate({
        rules: {
            expressCode:{
                required:true
            }
        }
    });

    // 提交参数
    $('a.btn').on('click',function (){
        postForm($(this))
    });

    function postForm(that){
        if (validator.form()){
            that.addClass('background-gray').off('click');
            $.post('/order/logistics/?' + $('#form').serialize())
                .success(function (data){
                    var datas = data[0];
                    var _txt = data[0].message || '提交成功';
                    $('.tips p').text(_txt);
                    $('.mask,.tips').show();
                })
                .error(function (err){
                    that.removeClass('background-gray').on('click',postForm);
                    window.location.href = '/error';
                });
        }
    }

    $('.tips a').on('click',function (){
        window.location.href ='/order/refundDetail?orderCode='+$("#orderCode").val()+'&id='+$("#idcode").val()+'&m_id='+merchantInfoId;
	});

});