$(function () {
    //交易记录列表页数据
    $('.fq-recommend-nav ul li').click(function () {
        var orderStatus = $(this).data('status'), _dom = '', cardId = $('#cardId').val();
        $(this).addClass('on').siblings('li').removeClass('on');
        $.post('/yearcard/record', {
            orderStatus: orderStatus,
            cardId: cardId
        }, function (data) {
            if (data[0].status == '200') {
                if (data[0].data && data[0].data.length > 0) {
                    for (var i = 0; i < data[0].data.length; i++) {
                        var sClass = data[0].data[i].orderStatus == 'order_init' ? 'cred' :'';
                        _dom += '<li><a href="/yearcard/recordd/' + data[0].data[i].payOrderNo + '?m_id=' + merchantInfoId + '">'
                            + '<span>交易流水号：' + data[0].data[i].payOrderNo + '</span><span>交易时间：' + data[0].data[i].createTime + '</span><span>交易金额：¥ ' + data[0].data[i].paySum + '</span>'
                            + '<span>交易方式：' + (data[0].data[i].orderType == 'recharge' ? '充值' : '') + '</span><span>交易状态：<em class='+sClass+'>'+paystt(data[0].data[i].orderStatus)+'</em></span></a></li>';
                    }
                }
                $('#recordUl').html('').html(_dom);
            }else if(data[0].status == '400'){
                window.location.href = '/login?m_id=' + merchantInfoId;
            }
        })
    });
    $('.fq-recommend-nav ul li:eq(0)').trigger('click');

    //年卡充值页面模拟select下拉
    $('.mnSelect').click(function () {
        var ul = $('#chooseType ul');
        if (ul.css('display') == 'none') {
            ul.slideDown('fast');
            $(this).find('i').addClass('trans90')
        } else {
            ul.slideUp('fast');
            $(this).find('i').removeClass('trans90')
        }
    });

    $('#chooseType ul li').click(function () {
        var txt = $(this).text(), cardTypeName = $(this).data('name'),
            idCardNo = $('#idCardNo').val(), typeName = $(this).data('ct');
        $(".input_select").text(txt);
        $('.input_select').siblings('i').removeClass('trans90');
        // if(cardTypeName == '身份证'){
        //     $('#cardNum').val(idCardNo);
        // }else{
        //     $('#cardNum').val('');
        // }
        $('#typeName').val(typeName);
        // $('#cardNum').attr('placeholder','请输入'+cardTypeName+'号');
        $("#chooseType ul").hide();
    });
    $('#chooseType ul li:eq(0)').trigger('click');
    //去充值
    var btnFlag = true;
    $('#toRecharge').click(function () {
        var cardNo = $('#cardNum').val(),
            orderSum = $('#cardPrice').text(),
            id = $(this).data('id'),
            accName = $("#accName").val(),
            //  cardName = $('#cardName').val(),
            //  tradeType = $('#tradeType').val(),
            //  nextProductCode = $('#nextProductCode').val(),
            cardType = $('#typeName').val(),
            CHNCardType = $('.input_select').text();
        // var btnFlag = $(this).data('flag');
        if($.trim(accName) == ''){
            $('.tips p').text('请输入姓名');
            $('.mask,.tips').show();
            return;
        }    
        if(cardNo != ''){
            if(checkIdCard(cardNo)){
                $('.tips p').text('请输入正确的身份证号');
                $('.mask,.tips').show();
            }else{
                if (btnFlag) {
                    btnFlag = false;           
                    $('.loading-box,#mask').show();                    
                    $.post('/yearcard/recharg', {
                        cardNo: cardNo,
                        orderSum: orderSum,
                        merchantInfoId: merchantInfoId,
                        id: id,
                        cardType: cardType,
                        CHNCardType: CHNCardType,
                        accName: accName,
                        cardTypeChoice: $("#cardTypeChoice").val()
                        // nextProductCode: nextProductCode,
                        // cardName: cardName,
                        // tradeType: tradeType
                    }, function (data) { 
                        $('.loading-box,#mask').hide();                     
                        if (data.status == "400") {
                            window.location.href = '/login?m_id=' + merchantInfoId;
                        } else if (data.status == "200") {
                            window.location.href = '/yearcard/recharges?m_id=' + merchantInfoId;
                        } else {
                            $('.tips p').text(data.message);
                            $('.mask,.tips').show();  
                            btnFlag = true;                          
                        }                 
                    })
                }
            }
        }else{
            $('.tips p').text('请输入身份证号');
            $('.mask,.tips').show();
        }
    })

    // 退款说明提交
    $("#submitForm").click(function(){
        var _this = $(this);
        if(!_this.hasClass("btn-disabled")){
            $.post('/yearcard/refund/'+$("#orderNo").val(),{merchantInfoId:$("#merchantInfoId").val(),reason:$("#reason").val()},function(res){
                _this.removeClass("btn-disabled");
                if(res.status==200){
                    window.location.href="/yearcard/recordd/"+$("#payOrderNo").val()+"?m_id="+$("#merchantInfoId").val();
                } else if(res.status==400){
                    window.location.href="/login?m_id="+$("#merchantInfoId").val();
                }else{
                    $('.tips p').text(res.message);
                    $('.mask,.tips').show();
                }
            })
        }
        _this.addClass("btn-disabled");
    });
});

//身份证验证
function checkIdCard(vla) {
    if (!/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(vla)) {
        return true;
    }
}

//交易状态
function paystt(s){
    var _sn = '';
    switch(s)
    {
        case 'order_rechargeing':
            _sn = '充值中'
            break;
        case 'order_close':
            _sn = '订单已关闭'
            break;
        case 'recharge_success':
            _sn = '充值成功'
            break;
        case 'order_init':
            _sn = '待支付'
            break;
        case 'recharge_failure':
            _sn = '充值失败'
            break;
        case 'order_refund':
            _sn = '订单已退款'
            break;
    }
    return _sn;
}