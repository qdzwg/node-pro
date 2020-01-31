$(function () {


    $(".cartNumber").each(function(){
        $(this).numSpinner({
            min:1,
            max:$(this).data("max"),
            onChange:function(evl,value){
                var obj=$(evl).parent().parent().parent().parent().parent().parent();
                var price=$(evl).parent().next().find("strong").text();
                $(evl).parent().parent().parent().parent().parent().next().find("em").text(operation.accMul(price,value));
                obj.data("obj").num=value;
                totalPrice();
            }
        });
    });
    
    totalPrice();
    $(".cart-list a").on("touchstart", function () {
        $(this).toggleClass("on");
        totalPrice();
    });
    $(".check-all").on("touchstart", function () {
        if ($(".check-all").hasClass("on")) {
            $(".check-box a").removeClass("on");
            $(this).removeClass("on");
        } else {
            $(".check-box a").addClass("on");
            $(this).addClass("on");
        }
        totalPrice()
    });

    // 删除订单
    $(".cart-del").click(function(){
        $(".mask").show();
        $(this).siblings(".confirmtips").show();
    });
    $('.confirmtips .cancel').click(function(){
        $(".mask").hide();
        $(this).parents(".confirmtips").hide();
    });
    $('.confirmtips .queding').click(function () {
        var pro=$(this).parents('.shop-box');
        $(".mask").hide();
        var item_li = $(this).parent().parent().parent().parent().parent();
        var item_id = item_li.data('id');
        var del_url = '/cart/itemdel/'+item_id;
        $.get(del_url, {}, function (result) {
            if (result.status === 200){
                item_li.next('.page-line').remove();
                item_li.remove();
                totalPrice();
            }
        })
    });
    //清空购物车
    $('.clear-box-btn').click(function(){
        var data={
            m_id:merchantInfoId
        };
        $.ajax({
            type: "GET",
            url: "/cart/removeCart",
            data: data,
            success: function(msg){
                window.location.reload();
            }
         });
    });
    
    $("#cart-pay-btn").on('tap',submitCar);  
});

//- 计算购物车选择总价
function totalPrice(){
    var total_price = 0;
    $('.cart-list').each(function(){
        var check = $('.check',this).hasClass('on');
        var price = parseFloat($(this).find('.order-item-price em').text());
        if(check){
            total_price = operation.accAdd(total_price,price);
        }
    });
    $('#totalprice').text(total_price);
    var len=$(".check-box").find(".on").length;
        if(len>0){
            $(".go-pay-btn").removeClass("go-pay-btn-disabled").find("em").text(len);
        }else{
            $(".go-pay-btn").addClass("go-pay-btn-disabled").find("em").text(len);
        }
}

function submitCar() {
    if($(this).hasClass('go-pay-btn-disabled')) return;
    var itemIds = selectItem(), cartobj = { item: itemIds };
    if (itemIds) {
        $.post('/cache/cartPay/', {
            parmdata: JSON.stringify(cartobj)
        })
            .success(function (result) {
                if (result[0].status == '200') {
                    var ids = selectId('id').join(",");
                    var infoIds = selectId('mdseinfoid').join(",");
                    window.location.href = '/order/shop/' + ids + '?m_id=' + merchantInfoId + '&flag=cart&infoIds=' + infoIds;
                } else {
                    $('.tips p').text(result[0].msg);
                    $('.mask,.tips').show();
                }
            })
            .error(function (err) {
                console.log(err);
            });
        // window.location.href='/cart/pay/'+itemIds;
    } else {
        $('.tips p').text("请选择订单！");
        $('.mask,.tips').show();
        $('.queding').click(function () {
            $('.mask,.tips').hide();
        });
    }
}


function selectItem(){
    var items=[];
    $(".cart-list").each(function(){
        var check = $('.check',this).hasClass('on');
        if(check){
            //var itemId = $(this).data('id');
            itemId=$(this).data("obj");
            items.push(itemId);
        }
    });
    return items
}

/**
 * name[string] 为需要找的data 属性名称 
 */
function selectId(name){
    var itemIds = [];
    $('.cart-list').each(function(){
        var check = $('.check',this).hasClass('on');
        if(check){
            var itemId = $(this).data(name);
            itemIds.push(itemId);
        }
    });
    return itemIds
}

