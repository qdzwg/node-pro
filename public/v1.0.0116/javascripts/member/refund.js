$(function (){
    var validator = $('#form').validate({
        rules: {
            handleRefundMoney:{
                required: true,
                number:true,
            },
            reason: {
                required:true,
                isCode:true,
                minlength: 4,
                maxlength:200
            }
        }
    });

    var $submitBtn = $('#submitForm');

    if (module === 'theater_ticket') {
        var refundSeats = [];
    }
    
    //
    var resionTextArea = $('#normalRefundResion').find('textarea')
    var refundResionLists = $("#refundDialog").find("ul");
    var refundResions= refundResionLists.find("a");
    touch.on('#refundResion', 'tap', function () {
        $("#refundDialog").show().animate({
            bottom: 0
        }, 300); 
        $("#mask").show();
    });
    touch.on('#close', 'tap', function () {
        closedialog();
    });

    touch.on(refundResions, 'tap', function () {
        var _this = $(this);
        var _text = _this.text();
        refundResions.removeClass('c-base');
        _this.addClass('c-base');
        resionTextArea.val(_text);
        $('#refundResion').find('span').text(_text);
        closedialog();
    });

    // 提交参数
    $submitBtn.unbind('click').on('click',function (e){
        e.stopPropagation();
        var $this = $(this);
        if ($this.hasClass('background-gray')) return;
        $this.addClass('background-gray');
        postForm()
    });

    function postForm(){
        if (module === 'route'){
            if(!(+($('#adultNum').val())) && !(+($('#childNum').val()))){
                $('.tips p').text('未选择退单数量');
                $('.mask,.tips').show();
                return false;
            }
        }
        if ( module === 'theater_ticket' ) {
            var inputSeats = [];
            for (var i = 0, les = refundSeats.length; i<les; i++) {
                inputSeats.push({
                    status: refundSeats[i].status,
                    fid: refundSeats[i].fid,
                    scol: refundSeats[i].cowNum,
                    srow: refundSeats[i].rowNum,
                    orderDetailId: refundSeats[i].orderDetailId
                })
     
            }
            $('input[name=refundSeats]').val(JSON.stringify(inputSeats));

        }
        if($(".realName-all").length){
            if($(".realName-list").find(".icon-yuanxingxuanzhongfill").length==0){
                $('.tips p').text('未选择退单人');
                $('.mask,.tips').show();
                return false;
            }
            else{
                var orderDetaimModelIds=[];
                $(".realName-list").each(function(){
                    if($(this).find("i").hasClass("icon-yuanxingxuanzhongfill")){
                        orderDetaimModelIds.push($(this).find("input").val())
                    }
                });
                $("input[name='orderDetaimModelId']").val(orderDetaimModelIds.join(","));
                $("input[name='refundAmount']").val(orderDetaimModelIds.length);
            }
        }
        //套票实名制
        var comboRefundFlag = true;
        if(module==='family'){
            if($('input[name="tKtype"]:checked').val() == '1'){
                var orderDetaimModelIds=[];
                $(".combo-choose-wholeReal").each(function(){
                    if($(this).find("i").hasClass("icon-yuanxingxuanzhongfill")){
                        orderDetaimModelIds.push($(this).find("input").val());                       
                    }
                });
                $("input[name='orderDetaimModelId']").val(orderDetaimModelIds.join(","));   
            }else{
                var orderDetaimModelIds=[];                
                // $(".combo-choose-realName").each(function(){
                //     if($(this).find("i").hasClass("icon-yuanxingxuanzhongfill")){
                //         orderDetaimModelIds.push($(this).find("input").val());
                //     }
                // });
                // $("input[name='orderDetaimModelId']").val(orderDetaimModelIds.join(",")); 
                
                $('.combo-refund-list').each(function(index, item){
                    var comboItemNum = $(this).find('input[name="partRefundAmount"]').val();
                    var comboItemReal = 0;
                    var cRealNames = $(this).find('.combo-choose-realName');
                    if(cRealNames.length>0){
                        cRealNames.each(function(i, it){
                            if(cRealNames.eq(i).find('i').hasClass('icon-yuanxingxuanzhongfill')){
                                orderDetaimModelIds.push(cRealNames.eq(i).find("input").val());
                                comboItemReal += 1;
                            }
                        });
                        if(comboItemNum > 0 && comboItemNum != comboItemReal){
                            alert('第'+(index+1)+'个退单数量与所选实名制数量不一致');
                            comboRefundFlag = false;
                            $submitBtn.removeClass('background-gray');
                            return false;                            
                        }
                    }                                       
                });
                $("input[name='orderDetaimModelId']").val(orderDetaimModelIds.join(","));
            }                       
        }
        if (validator.form()&&comboRefundFlag){
            $.ajax({
                url: '/member/refund/' + module + '?' + $('#form').serialize() + '&m_id=' + merchantInfoId,
                type: 'POST',
                beforeSend: function (xhr) {
                    $.showLoading();
                },
                complete: function (xhr, status) {
                    $.hideLoading();
                },
                success: function (datas) {
                    var datas = datas[0];
                    if (datas.status === 400) {
                        window.location.href = '/login?m_id=' + merchantInfoId;
                    }
                    else if (datas.status === 200) {
                        var _txt = datas.message || '申请退单成功';
                        $('.tips a').data("s", true);                    
                    } else {
                        var _txt = datas.message || '申请退单失败';
                        $submitBtn.removeClass('background-gray');
                        $('.tips a').data("s", false);
                    }
                    $('.tips p').text(_txt);
                    $('.mask,.tips').show();
                },
                error:function (err) {
                    $submitBtn.removeClass('background-gray');
                    window.location.href = '/error';
                }
                
            })
        }
    }

    $('.tips a').on('click',function (){
        var s=$(this).data("s");
        if(s){
            if (module === 'pmsHotel') {
                window.location.href = '/member/pmsOrder/' + payOrderNo+'?m_id='+merchantInfoId;          
            } else {
                window.location.href = '/member/order/' + orderNo+'?m_id='+merchantInfoId;
            }     
        }else{
            $(".btn-handle a").removeClass("background-gray");
        }
	});

    /**
     * 初始化数量加减
     */
    if (module === 'route'){
        if (urlParams[0]) {
            $('#adultNum').numSpinner({
                min: 0,
                max: Number(urlParams[0].maxNum)
            });
        }
        if (urlParams[1]){
            $('#childNum').numSpinner({
                min: 0,
                max: Number(urlParams[1].maxNum)
            });
        }
    } else if(module === 'family'){
        if($('input[name="tKtype"]').val()=='1'){
            $(".refundNum").numSpinner({
                min: 0,
                max: Number(maxNum)
            });
        }else{
            for(var i = 0; i < $('.combo-refund-item').length; i++){
                $(".partRefundNum").eq(i).numSpinner({
                    min: 0,
                    max: Number($('input[name="partRefundAmount"]').eq(i).val())
                });
            }            
        }        
    }
    else {
        $(".refundNum").numSpinner({
            min: 1,
            max: Number(maxNum)
        });
    }

    function closedialog() {
        $("#refundDialog").animate({
            bottom: '-12rem'
        }, 300);
        $("#mask").hide();
    }
    
    $("#realName").find(".all").click(function(){
        if($(this).find("i").hasClass("icon-yuanxingxuanzhongfill")){
            $(this).find("i").removeClass("icon-yuanxingxuanzhongfill");
            $(".realName-list").find("i").removeClass("icon-yuanxingxuanzhongfill");
        }else{
            $(this).find("i").addClass("icon-yuanxingxuanzhongfill");
            $(".realName-list").find("i").addClass("icon-yuanxingxuanzhongfill");
        }
    });

    $(".realName-list").click(function(){
        var item = $(this).find("i");
        if(item.hasClass("icon-yuanxingxuanzhongfill")){
            item.removeClass("icon-yuanxingxuanzhongfill")
            // if($(".realName-list").find(".icon-yuanxingxuanzhongfill").length==0){
            //     $("#realName").find("i").removeClass("icon-yuanxingxuanzhongfill");
            // }
            if($(".realName-list").find(".icon-yuanxingxuanzhongfill").length!=$(".realName-list").length){
                $("#realName").find("i").removeClass("icon-yuanxingxuanzhongfill");
            }
        }else{
            item.addClass("icon-yuanxingxuanzhongfill")
            if($(".realName-list").find(".icon-yuanxingxuanzhongfill").length==$(".realName-list").length){
                $("#realName").find("i").addClass("icon-yuanxingxuanzhongfill");
            }
        }
    });

    //套票实名制选择（部分退）
    $(".combo-choose-realName").click(function(){
        var item = $(this).find("i");        
        if(item.hasClass("icon-yuanxingxuanzhongfill")){
            item.removeClass("icon-yuanxingxuanzhongfill");
        }else{
            item.addClass("icon-yuanxingxuanzhongfill");            
        }
        var sValue = 0; 
        var cItem = $(this).parents('.combo-refund-list');
        cItem.find('.combo-choose-realName').each(function(index){            
            if(cItem.find('.combo-choose-realName').eq(index).find('i').hasClass('icon-yuanxingxuanzhongfill')){
                sValue += 1;                
            }      
            cItem.find('input[name="partRefundAmount"]').val(sValue);      
        })      
    });
    //套票实名制选择（整单退）
    // $(".combo-choose-wholeReal").click(function(){
    //     var item = $(this).find("i");
    //     if(item.hasClass("icon-yuanxingxuanzhongfill")){
    //         item.removeClass("icon-yuanxingxuanzhongfill")           
    //     }else{
    //         item.addClass("icon-yuanxingxuanzhongfill")            
    //     }
    // });
    
    $("#theaterLists").find(".ticket-item-inner").unbind('click').click(function(){
        var $this = $(this);
        var itemData = $this.data('item'),orderDetailId = $this.data('id');
        if ($this.hasClass('selected')) {
            $this.removeClass('selected')
            for (var i = 0, les = refundSeats.length; i < les ;i++) {
                if (refundSeats[i].fid === itemData.fid) {
                    refundSeats.splice(i,1);
                    break;
                }
            }
        } else {
            $this.addClass("selected");
            itemData.orderDetailId = orderDetailId;
            refundSeats.push(itemData)
        }
        refundSeats.length > 0 
            ? $submitBtn.removeClass('background-gray')
            : $submitBtn.addClass('background-gray')
         })  

    //套票退款  
    if(module === 'family'){
        if($('input[name="tKtype"]').length){
            $('input[name="tKtype"]').change(function(){
                if($(this).val() == '1'){
                    $('.normalTk').show();
                    $('.combo-partTk').hide();
                    $(".refundNum").numSpinner({
                        min: 0,
                        max: Number(maxNum)
                    });                   
                }else{
                    $('.normalTk').hide();
                    $('.combo-partTk').show();
                    for(var i = 0; i < $('.combo-refund-item').length; i++){
                        $(".partRefundNum").eq(i).numSpinner({
                            min: 0,
                            max: Number($('input[name="partRefundAmount"]').eq(i).val())
                        });
                    }                    
                }
            })
        }        
    }   
    
});
