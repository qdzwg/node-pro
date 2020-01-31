$(function () {
    $('.pay-del').click(function (){
        var orderNo = $(this).data('id');

        var confirmDel = confirm('确认要删除订单吗');
        if(confirmDel){
            $.post('/member/remove/'+orderNo)
                .success(function (data){
                    var datas = data[0];
                    $('.tips p').text(datas.msg);
                    $('.mask,.tips').show();
                })
                .error(function (err){
                    window.location.href = '/error';
                });
        }
    });
    $('.tips a').on('click',function (){
        window.location.href = '/list/order/';
    });

})