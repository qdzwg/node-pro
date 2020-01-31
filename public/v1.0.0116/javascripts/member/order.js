$(function(){
        $(".tab-search-panel").each(function(){
            var height=$(this).outerHeight(true);
            $(this).css("top",-height+"px");
        });
        var touchobj=$("#searchtab").find("a"),div,tabpanel=$(".tab-search-panel").find("a");
        touch.on(touchobj,'tap',function(){
            if($(this).hasClass("c-base")){
                div=dialogclose(div);
            }
            else{
                dialogclose(div);
                div=$(this).parent().data("div");
                $(this).addClass("c-base");
                if(dodiv()){
                    setTimeout(function(){
                        $("#"+div).stop().animate({
                            top:$("#search-h").outerHeight(true)-1
                        },300);
                    },300);
                }else{
                    $("#"+div).stop().animate({
                        top:$("#search-h").outerHeight(true)-1
                    },300);
                }
                $("#mask").fadeIn();
            }
        });
        touch.on("#mask","tap",function(){
            div=dialogclose(div);
        });
        touch.on("#mask","touchend",function(event){
            event.preventDefault();
        });
        touch.on(tabpanel,'tap',function(ev){
            var text=$(this).text();
            var height=$("#"+div).outerHeight(true);
            //$(".page-list").find("a").addClass("prevent");
            $("#searchtab").find("li[data-div="+div+"]").find("a").text(text);
            $(this).parent().siblings().find("a").removeClass("c-base");
            $(this).addClass("c-base");
            div=dialogclose(div);
            ev.preventDefault();
        });
        touch.on(tabpanel,'touchend',function(event){
            event.preventDefault();
        });

        //提醒发货
        touch.on('#remindDelivery','tap',function(ev){
            $.get('/member/warnsendgoods/'+$("#orderNo").text(),function(data){
                if(data[0].status=="200"){
                    $(".tips").find("p").text("已提醒发货");
                    $(".tips").data("reload",true);
                }else{
                    $(".tips").find("p").text(data[0].message);
                }
                $("#mask,.tips").show();
            })
        });

        //撤销申请
        touch.on('#cancelApply','tap',function(ev){
            $.get('/member/cancelRetreat/'+$("#refundNo").val(),function(data){
                if(data[0].status=="200"){
                    $(".tips").find("p").text("已撤销申请");
                    //$(".tips").data("reload",true);
                }else{
                    $(".tips").find("p").text(data[0].message);
                }
                $("#mask,.tips").show();
                $(".tips").find("a").click(function(){
                    window.location.href='/member/order/'+$("#backid").val()+'?m_id='+merchantInfoId;
                });
            })
        });
        
        //确认收货
        touch.on('#receipt','tap',function(ev){
            $("#confirm,#mask").show();
            
        });
        $("#confirm").find(".queding").click(function(){
            $.get('/member/receipt/'+$("#orderId").val(),function(data){
                if(data[0].status=="200"){
                    $(".tips").find("p").text("已经收货");
                    $(".tips").data("reload",true);
                }else{
                    $(".tips").find("p").text(data[0].message);
                }
                $("#mask,.tips").show();
                $("#confirm").hide();
            })
        });
        $("#confirm").find(".cancel").click(function(){
            $("#confirm,#mask").hide();
        });
    });
    function dialogclose(div){
        var height=$("#"+div).outerHeight(true);
        $("#"+div).stop().animate({
            top:-height+"px"
        },300);
        $("#mask").hide();
        $("#searchtab").find("a").removeClass("c-base");
        div=null;
        return div;
    }
    function dodiv(){
        var flag=false;
        $(".tab-search-panel").each(function(){
            var top=$(this).position().top;
            if(top>0){
                flag=true;
                return false;
            }
        });
        return flag;
    }