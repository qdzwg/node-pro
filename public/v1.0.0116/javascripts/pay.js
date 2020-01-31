$(function(){
    var paymold=$("#pay-mold").find("a");
    touch.on(".toogleli","tap",function(){
        $(this).parents('.order-list').prev('.orderDetails').slideToggle();
        $(this).find("a").toggleClass("arrow-down");
        $(this).parent().toggleClass("arrow-down");
    });

});