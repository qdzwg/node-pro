$(function(){
    var sexA=$("#sexDialog").find("ul").find("a");
    touch.on('#sex','tap',function(){
        $("#sexDialog").show().animate({
            bottom:0
        },300);
        $("#mask").show();
    });
    touch.on('#close','tap',function(){
        closedialog();
    });
    touch.on(sexA,'tap',function(){
        var _this = $(this);
        $.post('/member/modify?sex=' + _this.parent().data('index'))
            .success(function (data){
                var datas = data[0];

                $("#sex").find("span").text(_this.text());
                closedialog();
                sexA.removeClass("c-base");
                _this.addClass("c-base");
            })
            .error(function (err){
                window.location.href = '/error';
            });
        
    });
});
function closedialog(){
    $("#sexDialog").animate({
        bottom:'-9rem'
    },300);
    $("#mask").hide();
}